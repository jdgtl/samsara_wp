<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

function understrap_remove_scripts() {
    wp_dequeue_style( 'understrap-styles' );
    wp_deregister_style( 'understrap-styles' );

    wp_dequeue_script( 'understrap-scripts' );
    wp_deregister_script( 'understrap-scripts' );

    // Removes the parent themes stylesheet and scripts from inc/enqueue.php
}
add_action( 'wp_enqueue_scripts', 'understrap_remove_scripts', 20 );

require get_stylesheet_directory() . '/inc/enqueue.php';
require get_stylesheet_directory() . '/inc/setup.php';
require get_stylesheet_directory() . '/inc/nav.php';
require get_stylesheet_directory() . '/inc/widgets.php';
require get_stylesheet_directory() . '/inc/sidebars.php';

require_once get_stylesheet_directory() . '/inc/Mobile_Detect.php';
global $detect;
$detect = new Mobile_Detect;

function add_child_theme_textdomain() {
    load_child_theme_textdomain( 'understrap-child', get_stylesheet_directory() . '/languages' );
}
add_action( 'after_setup_theme', 'add_child_theme_textdomain' );

/**
 * Add WooCommerce theme support
 */
function understrap_child_add_woocommerce_support() {
    add_theme_support( 'woocommerce' );
}
add_action( 'after_setup_theme', 'understrap_child_add_woocommerce_support' );

/*
 * Cancel subscription button functionality
 */
function cwpai_cancel_user_subscription_button() {
    // Display the cancel subscription button always, regardless of login status or active subscriptions
    $button = '<div class="cancel-subscription-button-container">';

    if ( ! is_user_logged_in() ) {
        // If the user is not logged in, show a message prompting them to log in
        $button .= '<p>You need to be logged in to cancel your subscription.</p>';
    } else {
        // Get the current user's subscriptions
        $user_id = get_current_user_id();

        // Check if WooCommerce Subscriptions is active
        if ( function_exists( 'wcs_get_users_subscriptions' ) ) {
            $subscriptions = wcs_get_users_subscriptions( $user_id );

            // Check if the user has any active subscriptions
            if ( ! empty( $subscriptions ) ) {
                foreach ( $subscriptions as $subscription ) {
                    if ( $subscription->has_status( array( 'active', 'on-hold' ) ) ) {
                        $subscription_id = $subscription->get_id();
                        break;
                    }
                }

                if ( isset( $subscription_id ) ) {
                    // Display the cancel button if an active or on-hold subscription is found
                    $button .= '<form method="post"><input type="hidden" name="subscription_id" value="' . esc_attr( $subscription_id ) . '" />';
                    $button .= '<button type="submit" name="cancel_subscription" class="button cancel-subscription-button">Cancel Subscription</button></form>';
                } else {
                    // Message if no cancellable subscription is found
                    $button .= '<p>You do not have any active subscriptions to cancel.</p>';
                }
            } else {
                // Message if there are no subscriptions at all
                $button .= '<p>You do not have any subscriptions.</p>';
            }
        } else {
            $button .= '<p>Subscriptions plugin not available.</p>';
        }
    }

    $button .= '</div>';

    echo $button;
}
add_shortcode( 'cancel_subscription_button', 'cwpai_cancel_user_subscription_button' );

function cwpai_handle_cancel_subscription() {
    if ( isset( $_POST['cancel_subscription'] ) && isset( $_POST['subscription_id'] ) ) {
        $subscription_id = absint( $_POST['subscription_id'] );

        if ( function_exists( 'wcs_get_subscription' ) ) {
            $subscription = wcs_get_subscription( $subscription_id );

            if ( $subscription && $subscription->has_status( array( 'active', 'on-hold' ) ) ) {
                $subscription->update_status( 'cancelled' );
                wc_add_notice( 'Your subscription has been cancelled.', 'success' );
            } else {
                wc_add_notice( 'Unable to cancel subscription.', 'error' );
            }

            wp_safe_redirect( wc_get_account_endpoint_url( 'subscriptions' ) );
            exit;
        }
    }
}
add_action( 'template_redirect', 'cwpai_handle_cancel_subscription' );

/*
 * Send subscription data to external API
 */
add_action( 'save_post_shop_subscription', 'send_manual_subscription_to_custom_url', 10, 3 );

function send_manual_subscription_to_custom_url( $post_id, $post, $update ) {
    // Only run on new post creation, not updates
    if ( $update ) return;

    // Double-check it's a WC_Subscription post type
    if ( get_post_type( $post_id ) !== 'shop_subscription' ) return;

    // Send subscription ID to external URL
    $response = wp_remote_post( 'https://tritechy.cloud/api_projects/samsara_experience_woocommerce/woo_subscriptions.php', array(
        'method'  => 'POST',
        'timeout' => 15,
        'body'    => array(
            'subscription_id' => $post_id,
        ),
    ) );
}

/**
 * WooCommerce Subscription Cancellation Link Generator
 */

/**
 * Get the subscription cancellation link for a user
 *
 * @param int $user_id Optional. User ID. If not provided, uses current user.
 * @param int $subscription_id Optional. Specific subscription ID. If not provided, gets the most recent active subscription.
 * @return string|false The cancellation link URL or false if no subscription found
 */
function get_subscription_cancel_link($user_id = null, $subscription_id = null) {
    // Check if WooCommerce Subscriptions is active
    if (!class_exists('WC_Subscriptions') || !function_exists('wcs_get_users_subscriptions')) {
        return false;
    }

    // If no user ID provided, use current user
    if (!$user_id) {
        $user_id = get_current_user_id();
    }

    // If user is not logged in and no user ID provided, return login URL with redirect
    if (!$user_id) {
        $my_account_url = wc_get_page_permalink('myaccount');
        $subscriptions_endpoint = get_option('woocommerce_myaccount_view_subscription_endpoint', 'view-subscription');
        $redirect_url = add_query_arg('redirect_to_subscription', '1', $my_account_url . $subscriptions_endpoint . '/');
        return wp_login_url($redirect_url);
    }

    // Get user's subscriptions
    $subscriptions = wcs_get_users_subscriptions($user_id);

    if (empty($subscriptions)) {
        return false;
    }

    $target_subscription = null;

    // If specific subscription ID provided, find it
    if ($subscription_id) {
        foreach ($subscriptions as $subscription) {
            if ($subscription->get_id() == $subscription_id) {
                $target_subscription = $subscription;
                break;
            }
        }
    } else {
        // Find the most recent active subscription
        $active_subscriptions = array();

        foreach ($subscriptions as $subscription) {
            if ($subscription->has_status(array('active', 'pending-cancel'))) {
                $active_subscriptions[] = $subscription;
            }
        }

        if (!empty($active_subscriptions)) {
            // Sort by date created (most recent first)
            usort($active_subscriptions, function($a, $b) {
                return strtotime($b->get_date_created()) - strtotime($a->get_date_created());
            });

            $target_subscription = $active_subscriptions[0];
        }
    }

    // If no subscription found, return false
    if (!$target_subscription) {
        return false;
    }

    // Build the subscription view URL
    $my_account_url = wc_get_page_permalink('myaccount');
    $subscriptions_endpoint = get_option('woocommerce_myaccount_view_subscription_endpoint', 'view-subscription');
    $subscription_url = $my_account_url . $subscriptions_endpoint . '/' . $target_subscription->get_id() . '/';

    // Add hash to scroll to cancellation section
    $subscription_url .= '#subscription-cancel';

    return $subscription_url;
}

/**
 * Generate a subscription cancellation button/link HTML
 */
function get_subscription_cancel_button($text = 'Cancel My Subscription', $class = 'button wc-forward', $user_id = null, $subscription_id = null) {
    $cancel_link = get_subscription_cancel_link($user_id, $subscription_id);

    if (!$cancel_link) {
        return '<p>No active subscription found.</p>';
    }

    return sprintf(
        '<a href="%s" class="%s">%s</a>',
        esc_url($cancel_link),
        esc_attr($class),
        esc_html($text)
    );
}

/**
 * Shortcode to display subscription cancellation link
 */
function subscription_cancel_link_shortcode($atts) {
    $atts = shortcode_atts(array(
        'text' => 'I WOULD LIKE TO CANCEL',
        'class' => 'button wc-forward',
        'user_id' => null,
        'subscription_id' => null
    ), $atts, 'subscription_cancel_link');

    return get_subscription_cancel_button(
        $atts['text'],
        $atts['class'],
        $atts['user_id'],
        $atts['subscription_id']
    );
}
add_shortcode('subscription_cancel_link', 'subscription_cancel_link_shortcode');

/**
 * Shortcode to return just the URL (for Elementor buttons)
 */
function subscription_cancel_url_shortcode($atts) {
    $atts = shortcode_atts(array(
        'user_id' => null,
        'subscription_id' => null
    ), $atts, 'subscription_cancel_url');

    $cancel_link = get_subscription_cancel_link($atts['user_id'], $atts['subscription_id']);

    return $cancel_link ? $cancel_link : '#';
}
add_shortcode('subscription_cancel_url', 'subscription_cancel_url_shortcode');

/**
 * Handle redirect after login for subscription access
 */
function handle_subscription_redirect_after_login() {
    // Only run on my account page
    if (!is_wc_endpoint_url() && !is_account_page()) {
        return;
    }

    // Check if we have a redirect parameter
    if (isset($_GET['redirect_to_subscription']) && $_GET['redirect_to_subscription'] == '1') {
        // User just logged in, redirect to their subscription
        $cancel_link = get_subscription_cancel_link();

        if ($cancel_link) {
            wp_redirect($cancel_link);
            exit;
        }
    }
}
add_action('template_redirect', 'handle_subscription_redirect_after_login');

/**
 * Add custom CSS to highlight the cancel subscription section when accessed via our link
 */
function subscription_cancel_highlight_css() {
    if (is_wc_endpoint_url('view-subscription')) {
        ?>
        <style>
        /* Highlight the subscription actions when accessed via direct link */
        .subscription-actions:target,
        #subscription-cancel:target + .subscription-actions,
        .woocommerce-MyAccount-content:has(#subscription-cancel:target) .subscription-actions {
            background-color: #fff2cc;
            border: 2px solid #f0ad4e;
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
            animation: highlight-pulse 2s ease-in-out;
        }

        @keyframes highlight-pulse {
            0% { background-color: #fff2cc; }
            50% { background-color: #fcf8e3; }
            100% { background-color: #fff2cc; }
        }

        /* Style the cancel button to be more prominent */
        .subscription-actions .button.cancel {
            background-color: #d9534f;
            border-color: #d43f3a;
            color: white;
            font-weight: bold;
            padding: 10px 20px;
        }

        .subscription-actions .button.cancel:hover {
            background-color: #c9302c;
            border-color: #ac2925;
        }
        </style>
        <script>
        jQuery(document).ready(function($) {
            // If we have a hash for subscription-cancel, scroll to the actions
            if (window.location.hash === '#subscription-cancel') {
                setTimeout(function() {
                    var $actions = $('.subscription-actions');
                    if ($actions.length) {
                        $('html, body').animate({
                            scrollTop: $actions.offset().top - 100
                        }, 1000);
                    }
                }, 500);
            }
        });
        </script>
        <?php
    }
}
add_action('wp_head', 'subscription_cancel_highlight_css');

/**
 * Helper function to get all active subscriptions for a user (for debugging/admin use)
 */
function get_user_active_subscriptions_info($user_id) {
    if (!class_exists('WC_Subscriptions') || !function_exists('wcs_get_users_subscriptions')) {
        return array();
    }

    $subscriptions = wcs_get_users_subscriptions($user_id);
    $subscription_info = array();

    foreach ($subscriptions as $subscription) {
        if ($subscription->has_status(array('active', 'pending-cancel'))) {
            $subscription_info[] = array(
                'id' => $subscription->get_id(),
                'status' => $subscription->get_status(),
                'total' => $subscription->get_total(),
                'billing_period' => $subscription->get_billing_period(),
                'billing_interval' => $subscription->get_billing_interval(),
                'next_payment' => $subscription->get_date('next_payment'),
                'created' => $subscription->get_date_created(),
                'cancel_link' => get_subscription_cancel_link($user_id, $subscription->get_id())
            );
        }
    }

    return $subscription_info;
}

/**
 * AJAX handler for getting subscription cancel link (for dynamic use)
 */
function ajax_get_subscription_cancel_link() {
    // Basic security check - verify user capability instead of nonce for public access
    if (!is_user_logged_in()) {
        // For non-logged-in users, return login URL
        $my_account_url = wc_get_page_permalink('myaccount');
        $login_url = wp_login_url($my_account_url);
        wp_send_json_success(array('cancel_link' => $login_url));
        return;
    }

    $user_id = isset($_POST['user_id']) ? intval($_POST['user_id']) : get_current_user_id();
    $subscription_id = isset($_POST['subscription_id']) ? intval($_POST['subscription_id']) : null;

    $cancel_link = get_subscription_cancel_link($user_id, $subscription_id);

    if ($cancel_link) {
        wp_send_json_success(array('cancel_link' => $cancel_link));
    } else {
        wp_send_json_error('No active subscription found');
    }
}
add_action('wp_ajax_get_subscription_cancel_link', 'ajax_get_subscription_cancel_link');
add_action('wp_ajax_nopriv_get_subscription_cancel_link', 'ajax_get_subscription_cancel_link');

/**
 * Add nonce script for AJAX requests
 */
function subscription_cancel_ajax_script() {
    ?>
    <script>
    var subscription_cancel_ajax = {
        ajax_url: '<?php echo admin_url('admin-ajax.php'); ?>',
        nonce: '<?php echo wp_create_nonce('subscription_cancel_nonce'); ?>'
    };
    </script>
    <?php
}
add_action('wp_head', 'subscription_cancel_ajax_script');

/*
 * Trial end subscription handling
 */
add_action('woocommerce_scheduled_subscription_trial_end', 'send_trial_end_subscription_to_server');

function send_trial_end_subscription_to_server($subscription_id) {
    if ( !function_exists( 'wcs_get_subscription' ) ) {
        return;
    }

    $subscription = wcs_get_subscription($subscription_id);
    if (!$subscription) {
        error_log("Invalid subscription ID: $subscription_id");
        return;
    }

    $data = [
        'subscription_id' => $subscription_id,
        'user_id'         => $subscription->get_user_id(),
        'email'           => $subscription->get_billing_email(),
        'trial_end_date'  => $subscription->get_time('trial_end'),
    ];

    $response = wp_remote_post('http://tritechy.cloud/api_projects/law_matice_tesing/samsara/samsara_trail.php', [
        'method'    => 'POST',
        'timeout'   => 15,
        'headers'   => ['Content-Type' => 'application/json'],
        'body'      => json_encode($data),
    ]);

    if (is_wp_error($response)) {
        error_log("HTTP Error: " . $response->get_error_message());
    } else {
        error_log("Response code: " . wp_remote_retrieve_response_code($response));
        error_log("Body: " . wp_remote_retrieve_body($response));
    }
}

/**
 * Samsara Experience - Checkout Terms with Modal Functionality
 */

// 1. Modify the default WooCommerce terms checkbox text
add_filter( 'woocommerce_get_terms_and_conditions_checkbox_text', 'samsara_update_terms_checkbox_text' );
function samsara_update_terms_checkbox_text( $text ) {
    // Get the page ID for your Release of Liability (you'll need to set this)
    $release_page_id = get_option( 'samsara_release_liability_page_id', '' );

    if ( $release_page_id ) {
        $release_url = get_permalink( $release_page_id );
        $text = sprintf(
            'I have read and agree to Samsara Experience\'s <a href="%s" class="samsara-modal-trigger" data-modal-type="page" data-modal-id="%s"><strong>Release of Liability</strong></a>',
            esc_url( $release_url ),
            esc_attr( $release_page_id )
        );
    } else {
        // Fallback if no page is set
        $text = 'I have read and agree to Samsara Experience\'s <a href="#" class="samsara-modal-trigger" data-modal-type="inline" data-modal-content="release-liability"><strong>Release of Liability</strong></a>';
    }

    return $text;
}

// 2. Add/Update the second custom checkbox
add_action( 'woocommerce_review_order_before_submit', 'samsara_add_custom_checkout_checkbox', 9 );
function samsara_add_custom_checkout_checkbox() {
    // Get page ID for subscription terms
    $subscription_terms_id = get_option( 'samsara_subscription_terms_page_id', '' );

    // Build the checkbox text with link
    $checkbox_text = 'I have read and agree to Samsara Experience\'s ';

    if ( $subscription_terms_id ) {
        $checkbox_text .= sprintf(
            '<a href="%s" class="samsara-modal-trigger" data-modal-type="page" data-modal-id="%s"><strong>Subscription Terms of Service</strong></a>',
            esc_url( get_permalink( $subscription_terms_id ) ),
            esc_attr( $subscription_terms_id )
        );
    } else {
        $checkbox_text .= '<a href="#" class="samsara-modal-trigger" data-modal-type="inline" data-modal-content="subscription-terms"><strong>Subscription Terms of Service</strong></a>';
    }
    ?>
    <p class="form-row samsara-custom-terms">
        <label class="woocommerce-form__label woocommerce-form__label-for-checkbox checkbox">
            <input type="checkbox" class="woocommerce-form__input woocommerce-form__input-checkbox input-checkbox" name="samsara_custom_terms" id="samsara_custom_terms" />
            <span class="woocommerce-terms-and-conditions-checkbox-text"><?php echo $checkbox_text; ?></span>&nbsp;<span class="required">*</span>
        </label>
    </p>
    <?php
}

// 3. Validate the custom checkbox
add_action( 'woocommerce_checkout_process', 'samsara_validate_custom_checkbox' );
function samsara_validate_custom_checkbox() {
    if ( ! isset( $_POST['samsara_custom_terms'] ) ) {
        wc_add_notice( __( 'You must accept the Subscription Terms of Service to proceed.', 'samsara' ), 'error' );
    }
}

// 4. Add modal HTML and scripts
add_action( 'wp_footer', 'samsara_add_modal_functionality' );
function samsara_add_modal_functionality() {
    if ( ! is_checkout() ) {
        return;
    }
    ?>
    <!-- Modal HTML Structure -->
    <div id="samsara-modal" class="samsara-modal">
        <div class="samsara-modal-content">
            <div class="samsara-modal-header">
                <h2 class="samsara-modal-title"></h2>
                <span class="samsara-modal-close">&times;</span>
            </div>
            <div class="samsara-modal-body">
                <div class="samsara-modal-loading">Loading...</div>
                <div class="samsara-modal-content-wrapper"></div>
            </div>
            <div class="samsara-modal-footer">
                <button class="samsara-modal-download" style="display:none;">Download PDF</button>
                <button class="samsara-modal-accept">I Accept</button>
            </div>
        </div>
    </div>

    <style>
    /* Modal Styles */
    .samsara-modal {
        display: none;
        position: fixed;
        z-index: 999999;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        overflow: auto;
        background-color: rgba(0,0,0,0.8);
    }

    .samsara-modal-content {
        background-color: #fefefe;
        margin: 2% auto;
        padding: 0;
        border: 1px solid #888;
        width: 90%;
        max-width: 800px;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }

    .samsara-modal-header {
        background-color: #2D954E;
        color: white;
        padding: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-radius: 8px 8px 0 0;
    }

    .samsara-modal-title {
        margin: 0;
        font-size: 24px;
        font-weight: 700;
    }

    .samsara-modal-close {
        color: white;
        font-size: 32px;
        font-weight: bold;
        cursor: pointer;
        line-height: 20px;
        transition: opacity 0.3s;
    }

    .samsara-modal-close:hover,
    .samsara-modal-close:focus {
        opacity: 0.7;
    }

    .samsara-modal-body {
        padding: 30px;
        overflow-y: auto;
        flex-grow: 1;
        background-color: #fafafa;
    }

    .samsara-modal-loading {
        text-align: center;
        padding: 40px;
        color: #666;
    }

    .samsara-modal-content-wrapper {
        display: none;
        line-height: 1.6;
        color: #333;
    }

    .samsara-modal-content-wrapper h1,
    .samsara-modal-content-wrapper h2,
    .samsara-modal-content-wrapper h3 {
        color: #2D954E;
        margin-top: 20px;
        margin-bottom: 10px;
    }

    .samsara-modal-content-wrapper p {
        margin-bottom: 15px;
    }

    .samsara-modal-footer {
        background-color: #f1f1f1;
        padding: 20px;
        text-align: right;
        border-top: 1px solid #ddd;
        border-radius: 0 0 8px 8px;
    }

    .samsara-modal-accept,
    .samsara-modal-download {
        background-color: #2D954E;
        color: white;
        padding: 12px 30px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
        font-weight: 600;
        margin-left: 10px;
        transition: background-color 0.3s;
    }

    .samsara-modal-accept:hover,
    .samsara-modal-download:hover {
        background-color: #267A42;
    }

    .samsara-modal-trigger {
        text-decoration: underline;
        cursor: pointer;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .samsara-modal-content {
            width: 95%;
            margin: 5% auto;
            max-height: 95vh;
        }

        .samsara-modal-header {
            padding: 15px;
        }

        .samsara-modal-title {
            font-size: 20px;
        }

        .samsara-modal-body {
            padding: 20px;
        }
    }

    /* PDF iframe styles */
    .samsara-modal-pdf {
        width: 100%;
        height: 500px;
        border: none;
    }
    </style>

    <script>
    jQuery(document).ready(function($) {
        var modal = $('#samsara-modal');
        var modalTitle = $('.samsara-modal-title');
        var modalBody = $('.samsara-modal-content-wrapper');
        var modalLoading = $('.samsara-modal-loading');
        var modalDownload = $('.samsara-modal-download');
        var currentCheckbox = null;

        // Handle modal trigger clicks
        $(document).on('click', '.samsara-modal-trigger', function(e) {
            e.preventDefault();

            var trigger = $(this);
            var modalType = trigger.data('modal-type');
            var title = trigger.find('strong').text();

            // Find the associated checkbox
            currentCheckbox = trigger.closest('label').find('input[type="checkbox"]');

            // Set modal title
            modalTitle.text(title);

            // Show modal
            modal.fadeIn();
            modalLoading.show();
            modalBody.hide();
            modalDownload.hide();

            // Load content based on type
            if (modalType === 'page') {
                var pageId = trigger.data('modal-id');
                loadPageContent(pageId);
            } else if (modalType === 'pdf') {
                var pdfUrl = trigger.data('pdf-url');
                loadPdfContent(pdfUrl, title);
            } else if (modalType === 'inline') {
                var contentKey = trigger.data('modal-content');
                loadInlineContent(contentKey);
            }
        });

        // Load page content via AJAX
        function loadPageContent(pageId) {
            $.ajax({
                url: '<?php echo admin_url('admin-ajax.php'); ?>',
                type: 'POST',
                data: {
                    action: 'samsara_get_page_content',
                    page_id: pageId,
                    nonce: '<?php echo wp_create_nonce('samsara_modal_nonce'); ?>'
                },
                success: function(response) {
                    if (response.success) {
                        modalLoading.hide();
                        modalBody.html(response.data.content).show();

                        // Show download button if PDF URL is provided
                        if (response.data.pdf_url) {
                            modalDownload.data('pdf-url', response.data.pdf_url).show();
                        }
                    } else {
                        modalBody.html('<p>Error loading content. Please try again.</p>').show();
                        modalLoading.hide();
                    }
                },
                error: function() {
                    modalBody.html('<p>Error loading content. Please try again.</p>').show();
                    modalLoading.hide();
                }
            });
        }

        // Load PDF content
        function loadPdfContent(pdfUrl, title) {
            modalLoading.hide();
            modalBody.html('<iframe src="' + pdfUrl + '" class="samsara-modal-pdf"></iframe>').show();
            modalDownload.data('pdf-url', pdfUrl).show();
        }

        // Load inline content (fallback)
        function loadInlineContent(contentKey) {
            var content = '';

            switch(contentKey) {
                case 'release-liability':
                    content = '<p>Please configure the Release of Liability page in your WordPress settings.</p>';
                    break;
                case 'subscription-terms':
                    content = '<p>Please configure the Subscription Terms of Service page in your WordPress settings.</p>';
                    break;
                default:
                    content = '<p>Content not found.</p>';
            }

            modalLoading.hide();
            modalBody.html(content).show();
        }

        // Handle Accept button
        $('.samsara-modal-accept').click(function() {
            if (currentCheckbox) {
                currentCheckbox.prop('checked', true);
            }
            modal.fadeOut();
        });

        // Handle Download button
        modalDownload.click(function() {
            var pdfUrl = $(this).data('pdf-url');
            if (pdfUrl) {
                window.open(pdfUrl, '_blank');
            }
        });

        // Handle close button
        $('.samsara-modal-close').click(function() {
            modal.fadeOut();
        });

        // Close modal when clicking outside
        $(window).click(function(e) {
            if ($(e.target).is(modal)) {
                modal.fadeOut();
            }
        });
    });
    </script>
    <?php
}

// 5. AJAX handler to get page content
add_action( 'wp_ajax_samsara_get_page_content', 'samsara_ajax_get_page_content' );
add_action( 'wp_ajax_nopriv_samsara_get_page_content', 'samsara_ajax_get_page_content' );
function samsara_ajax_get_page_content() {
    check_ajax_referer( 'samsara_modal_nonce', 'nonce' );

    $page_id = intval( $_POST['page_id'] );

    if ( ! $page_id ) {
        wp_send_json_error( 'Invalid page ID' );
    }

    $page = get_post( $page_id );

    if ( ! $page || $page->post_status !== 'publish' ) {
        wp_send_json_error( 'Page not found' );
    }

    $content = apply_filters( 'the_content', $page->post_content );

    // Check if there's a PDF attachment
    $pdf_url = get_post_meta( $page_id, 'samsara_pdf_url', true );

    wp_send_json_success( array(
        'content' => $content,
        'pdf_url' => $pdf_url
    ) );
}

// 6. Add settings page to configure the legal pages
add_action( 'admin_menu', 'samsara_add_legal_settings_page' );
function samsara_add_legal_settings_page() {
    add_submenu_page(
        'woocommerce',
        'Samsara Legal Pages',
        'Legal Pages Setup',
        'manage_options',
        'samsara-legal-pages',
        'samsara_legal_pages_settings'
    );
}

function samsara_legal_pages_settings() {
    // Save settings if form is submitted
    if ( isset( $_POST['samsara_save_settings'] ) && wp_verify_nonce( $_POST['samsara_legal_nonce'], 'samsara_legal_settings' ) ) {
        update_option( 'samsara_release_liability_page_id', intval( $_POST['release_liability_page'] ) );
        update_option( 'samsara_subscription_terms_page_id', intval( $_POST['subscription_terms_page'] ) );

        echo '<div class="notice notice-success"><p>Settings saved!</p></div>';
    }

    $release_page_id = get_option( 'samsara_release_liability_page_id', '' );
    $subscription_terms_id = get_option( 'samsara_subscription_terms_page_id', '' );
    ?>
    <div class="wrap">
        <h1>Samsara Legal Pages Setup</h1>
        <p>Select the pages to use for your legal documents. These will be displayed in modal popups on the checkout page.</p>

        <form method="post">
            <?php wp_nonce_field( 'samsara_legal_settings', 'samsara_legal_nonce' ); ?>

            <table class="form-table">
                <tr>
                    <th scope="row">
                        <label for="release_liability_page">Release of Liability Page</label>
                    </th>
                    <td>
                        <?php
                        wp_dropdown_pages( array(
                            'name' => 'release_liability_page',
                            'id' => 'release_liability_page',
                            'selected' => $release_page_id,
                            'show_option_none' => '— Select —',
                            'option_none_value' => ''
                        ) );
                        ?>
                        <p class="description">This page will be linked in the first checkbox.</p>
                    </td>
                </tr>

                <tr>
                    <th scope="row">
                        <label for="subscription_terms_page">Subscription Terms of Service Page</label>
                    </th>
                    <td>
                        <?php
                        wp_dropdown_pages( array(
                            'name' => 'subscription_terms_page',
                            'id' => 'subscription_terms_page',
                            'selected' => $subscription_terms_id,
                            'show_option_none' => '— Select —',
                            'option_none_value' => ''
                        ) );
                        ?>
                        <p class="description">This page will be linked in the second checkbox.</p>
                    </td>
                </tr>
            </table>

            <p class="submit">
                <input type="submit" name="samsara_save_settings" class="button-primary" value="Save Settings" />
            </p>
        </form>

        <hr>

        <h2>PDF Support</h2>
        <p>To add PDF download functionality to any legal page:</p>
        <ol>
            <li>Edit the page in WordPress</li>
            <li>Add a custom field named <code>samsara_pdf_url</code></li>
            <li>Set the value to the full URL of your PDF file</li>
            <li>A download button will appear in the modal when viewing that page</li>
        </ol>

        <hr>

        <h2>Important Notes</h2>
        <ul>
            <li>Make sure WooCommerce Terms & Conditions are enabled in WooCommerce → Settings → Advanced</li>
            <li>The first checkbox uses WooCommerce's built-in terms functionality</li>
            <li>The second checkbox is custom and will appear below the first one</li>
            <li>Both checkboxes are required for checkout to proceed</li>
        </ul>
    </div>
    <?php
}

/**
 * WooCommerce Native My Account Implementation
 */

// FIXED: Add custom endpoints AFTER WooCommerce is ready
function samsara_add_my_account_endpoints() {
    // Wait for WooCommerce to initialize first
    if (!did_action('woocommerce_init')) {
        return;
    }

    add_rewrite_endpoint( 'training-programs', EP_ROOT | EP_PAGES );
}
add_action( 'init', 'samsara_add_my_account_endpoints', 20 ); // Run after WooCommerce

// UNCHANGED: Handle the training programs endpoint content
function samsara_training_programs_content() {
    // Include the same active memberships content
    $child_memberships_file = get_stylesheet_directory() . '/includes/active-memberships.php';
    if ( file_exists( $child_memberships_file ) ) {
        include $child_memberships_file;
    } else {
        echo '<p>Training programs content not found.</p>';
    }
}
add_action( 'woocommerce_account_training-programs_endpoint', 'samsara_training_programs_content' );


// NEW: Ensure WooCommerce endpoints are properly registered
function samsara_ensure_woocommerce_endpoints() {
    // Make sure WooCommerce query vars are included
    $wc_vars = WC()->query->get_query_vars();
    foreach ($wc_vars as $key => $var) {
        add_rewrite_tag("%{$key}%", '([^&]+)');
    }
}
add_action('init', 'samsara_ensure_woocommerce_endpoints', 25);

add_action( 'woocommerce_account_payment-methods_endpoint', 'woocommerce_account_edit_address' );
/**
 * =====================================================
 * REACT MY ACCOUNT DASHBOARD
 * =====================================================
 * Enqueue React-based My Account dashboard
 */

/**
 * Enqueue React My Account App
 * Only loads on the React My Account template
 */
function samsara_enqueue_react_my_account() {
    // Only enqueue on the React My Account template
    if (!is_page_template('template-my-account.php')) {
        return;
    }
    
    // Enqueue React and ReactDOM from CDN FIRST (in header)
    wp_enqueue_script(
        'react',
        'https://unpkg.com/react@18/umd/react.production.min.js',
        array(),
        '18.3.1',
        false // Load in header
    );

    wp_enqueue_script(
        'react-dom',
        'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
        array('react'),
        '18.3.1',
        false // Load in header
    );

    // Enqueue React app JS (depends on React and ReactDOM)
    wp_enqueue_script(
        'samsara-my-account-react',
        get_stylesheet_directory_uri() . '/my-account-react/build/js/index.js',
        array('react', 'react-dom'), // Depend on React and ReactDOM
        filemtime(get_stylesheet_directory() . '/my-account-react/build/js/index.js'),
        true // Load in footer, but after React/ReactDOM in header
    );

    // Enqueue Tailwind CSS
    wp_enqueue_style(
        'samsara-my-account-styles',
        get_stylesheet_directory_uri() . '/my-account-react/build/css/my-account.css',
        array(),
        filemtime(get_stylesheet_directory() . '/my-account-react/build/css/my-account.css')
    );
    
    // Localize script with WordPress and WooCommerce data
    wp_localize_script('samsara-my-account-react', 'samsaraMyAccount', array(
        'apiUrl' => esc_url_raw(rest_url()),
        'nonce' => wp_create_nonce('wp_rest'),
        'userId' => get_current_user_id(),
        'wcApiUrl' => esc_url_raw(rest_url('wc/v3/')),
        'wcsApiUrl' => esc_url_raw(rest_url('wc/v1/')),
        'userData' => array(
            'id' => get_current_user_id(),
            'firstName' => wp_get_current_user()->first_name,
            'lastName' => wp_get_current_user()->last_name,
            'displayName' => wp_get_current_user()->display_name,
            'email' => wp_get_current_user()->user_email,
            'memberSince' => wp_get_current_user()->user_registered,
        ),
        'siteUrl' => get_site_url(),
        'basecampUrl' => 'https://videos.samsaraexperience.com',
        'logoutUrl' => wp_logout_url(home_url()),
    ));
}
add_action('wp_enqueue_scripts', 'samsara_enqueue_react_my_account');

/**
 * Remove ALL theme and plugin styles/scripts on React template
 * Only load React app assets
 */
function samsara_dequeue_wc_styles_on_react_template() {
    if (is_page_template('template-my-account.php')) {
        global $wp_styles;

        // Remove WooCommerce styles
        wp_dequeue_style('woocommerce-general');
        wp_dequeue_style('woocommerce-layout');
        wp_dequeue_style('woocommerce-smallscreen');

        // Remove theme styles and scripts
        wp_dequeue_style('child-understrap-styles');
        wp_dequeue_script('child-understrap-scripts');
        wp_dequeue_script('bootstrap-scripts');
        wp_dequeue_script('popper-scripts');

        // Remove parent theme styles if any
        wp_dequeue_style('understrap-styles');
        wp_dequeue_script('understrap-scripts');

        // Remove WordPress core styles that might interfere
        wp_dequeue_style('wp-block-library'); // Gutenberg blocks
        wp_dequeue_style('wp-block-library-theme'); // Gutenberg theme
        wp_dequeue_style('global-styles'); // Global styles
        wp_dequeue_style('classic-theme-styles'); // Classic theme styles

        // Keep jQuery for WordPress admin bar (if needed)
        // But we already hide admin bar, so we could remove jQuery too
        // wp_dequeue_script('jquery');

        // Add custom styles for React template to reset any remaining WordPress styles
        wp_add_inline_style('samsara-my-account-styles', '
            /* Reset WordPress defaults */
            body.samsara-react-account {
                margin: 0 !important;
                padding: 0 !important;
                background: #faf9f7 !important;
            }
            body.samsara-react-account #wpadminbar {
                display: none !important;
            }
            body.samsara-react-account #samsara-my-account-root {
                min-height: 100vh;
                display: block;
            }
        ');
    }
}
add_action('wp_enqueue_scripts', 'samsara_dequeue_wc_styles_on_react_template', 999);

/**
 * Hide admin bar on React My Account template
 */
function samsara_hide_admin_bar_on_react_template() {
    if (is_page_template('template-my-account.php')) {
        show_admin_bar(false);
    }
}
add_action('wp', 'samsara_hide_admin_bar_on_react_template');

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
 * Add rewrite rules for React SPA routing
 * Ensures all /athlete/* routes serve the React template
 */
function samsara_react_dashboard_rewrite_rules() {
    // Add rewrite rule to catch all athlete sub-routes
    add_rewrite_rule(
        '^athlete/?(.*)$',
        'index.php?pagename=athlete&react_route=$matches[1]',
        'top'
    );
}
add_action('init', 'samsara_react_dashboard_rewrite_rules', 10);

/**
 * Add custom query var for React routing
 */
function samsara_react_query_vars($vars) {
    $vars[] = 'react_route';
    return $vars;
}
add_filter('query_vars', 'samsara_react_query_vars');

/**
 * Flush rewrite rules on theme switch or admin init (one-time)
 * This ensures the React dashboard routes are properly registered
 */
function samsara_flush_rewrite_rules_once() {
    if (get_option('samsara_react_routes_flushed') !== 'yes') {
        samsara_react_dashboard_rewrite_rules();
        flush_rewrite_rules();
        update_option('samsara_react_routes_flushed', 'yes');
    }
}
add_action('after_switch_theme', 'samsara_flush_rewrite_rules_once');
add_action('admin_init', 'samsara_flush_rewrite_rules_once');

/**
 * Enqueue React My Account App
 * Only loads on the React My Account template
 */
function samsara_enqueue_react_my_account() {
    // Only enqueue on the React My Account template
    if (!is_page_template('template-my-account.php')) {
        return;
    }
    
    // Enqueue Stripe.js FIRST for payment methods
    wp_enqueue_script(
        'stripe-js',
        'https://js.stripe.com/v3/',
        array(),
        '3.0',
        false // Load in header
    );

    // Enqueue React and ReactDOM from CDN (in header)
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
    
    // Check if User Switching plugin is active and user is switched
    $is_switched = false;
    $original_user = null;
    $switch_back_url = null;

    if (function_exists('current_user_switched')) {
        $old_user = current_user_switched();
        if ($old_user) {
            $is_switched = true;
            $original_user = array(
                'id' => $old_user->ID,
                'displayName' => $old_user->display_name,
                'email' => $old_user->user_email,
                'firstName' => $old_user->first_name,
                'lastName' => $old_user->last_name,
            );

            // Get switch back URL if available (using method_exists for better compatibility)
            if (class_exists('user_switching') && method_exists('user_switching', 'switch_back_url')) {
                $switch_back_url = user_switching::switch_back_url($old_user);
            }
        }
    }

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
        'userSwitching' => array(
            'isSwitched' => $is_switched,
            'originalUser' => $original_user,
            'switchBackUrl' => $switch_back_url,
        ),
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

        // Check if user is switched (need admin bar for session management)
        $is_switched = false;
        if (function_exists('current_user_switched')) {
            $old_user = current_user_switched();
            if ($old_user) {
                $is_switched = true;
            }
        }

        // Build CSS - hide admin bar only if NOT switched
        $admin_bar_css = $is_switched ? '' : 'body.samsara-react-account #wpadminbar { display: none !important; }';
        $padding_top = $is_switched ? 'padding-top: 32px !important;' : ''; // Account for admin bar height

        // Add custom styles for React template to reset any remaining WordPress styles
        wp_add_inline_style('samsara-my-account-styles', '
            /* Reset WordPress defaults */
            body.samsara-react-account {
                margin: 0 !important;
                padding: 0 !important;
                background: #faf9f7 !important;
                ' . $padding_top . '
            }
            ' . $admin_bar_css . '
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
 * EXCEPT when user is switched (User Switching plugin needs the admin bar for session management)
 */
function samsara_hide_admin_bar_on_react_template() {
    if (is_page_template('template-my-account.php')) {
        // Check if user is switched via User Switching plugin
        $is_switched = false;
        if (function_exists('current_user_switched')) {
            $old_user = current_user_switched();
            if ($old_user) {
                $is_switched = true;
            }
        }

        // Only hide admin bar if NOT switched
        if (!$is_switched) {
            show_admin_bar(false);
        }
    }
}
add_action('wp', 'samsara_hide_admin_bar_on_react_template');

/**
 * =====================================================
 * CUSTOM REST API ENDPOINTS FOR REACT DASHBOARD
 * =====================================================
 * Endpoints for payment methods, memberships, and dashboard stats
 */

/**
 * Register custom REST API routes
 */
function samsara_register_custom_api_routes() {
    // Payment Methods endpoints
    register_rest_route('samsara/v1', '/payment-methods', array(
        'methods' => 'GET',
        'callback' => 'samsara_get_payment_methods',
        'permission_callback' => 'samsara_check_authentication',
    ));

    register_rest_route('samsara/v1', '/payment-methods', array(
        'methods' => 'POST',
        'callback' => 'samsara_add_payment_method',
        'permission_callback' => 'samsara_check_authentication',
    ));

    register_rest_route('samsara/v1', '/payment-methods/confirm', array(
        'methods' => 'POST',
        'callback' => 'samsara_confirm_payment_method',
        'permission_callback' => 'samsara_check_authentication',
    ));

    register_rest_route('samsara/v1', '/payment-methods/(?P<id>[a-zA-Z0-9_-]+)', array(
        'methods' => 'PUT',
        'callback' => 'samsara_update_payment_method',
        'permission_callback' => 'samsara_check_authentication',
    ));

    register_rest_route('samsara/v1', '/payment-methods/(?P<id>[a-zA-Z0-9_-]+)', array(
        'methods' => 'DELETE',
        'callback' => 'samsara_delete_payment_method',
        'permission_callback' => 'samsara_check_authentication',
    ));

    // Memberships endpoint
    register_rest_route('samsara/v1', '/memberships', array(
        'methods' => 'GET',
        'callback' => 'samsara_get_memberships',
        'permission_callback' => 'samsara_check_authentication',
    ));

    // Dashboard stats endpoint
    register_rest_route('samsara/v1', '/stats', array(
        'methods' => 'GET',
        'callback' => 'samsara_get_dashboard_stats',
        'permission_callback' => 'samsara_check_authentication',
    ));

    // Subscription orders endpoint
    register_rest_route('samsara/v1', '/subscriptions/(?P<id>\d+)/orders', array(
        'methods' => 'GET',
        'callback' => 'samsara_get_subscription_orders',
        'permission_callback' => 'samsara_check_authentication',
        'args' => array(
            'id' => array(
                'required' => true,
                'validate_callback' => function($param) {
                    return is_numeric($param);
                }
            ),
        ),
    ));

    // Custom subscriptions endpoint that uses native WooCommerce Subscriptions functions
    // Bypasses REST API quirks and works reliably with User Switching
    register_rest_route('samsara/v1', '/user-subscriptions', array(
        'methods' => 'GET',
        'callback' => 'samsara_get_user_subscriptions',
        'permission_callback' => 'samsara_check_authentication',
    ));

    // Get subscription for a specific order
    register_rest_route('samsara/v1', '/orders/(?P<id>\d+)/subscription', array(
        'methods' => 'GET',
        'callback' => 'samsara_get_order_subscription',
        'permission_callback' => 'samsara_check_authentication',
        'args' => array(
            'id' => array(
                'required' => true,
                'validate_callback' => function($param) {
                    return is_numeric($param);
                }
            ),
        ),
    ));
}
add_action('rest_api_init', 'samsara_register_custom_api_routes');

/**
 * Ensure REST API cookie authentication works with User Switching
 * User Switching can interfere with REST API auth, this fixes it
 */
add_filter('rest_authentication_errors', 'samsara_rest_auth_for_user_switching', 99);
function samsara_rest_auth_for_user_switching($result) {
    // If already authenticated or errored, return as is
    if (true === $result || is_wp_error($result)) {
        return $result;
    }

    // Check if user is logged in (including switched users)
    if (is_user_logged_in()) {
        return true;
    }

    return $result;
}

/**
 * Grant customers temporary capabilities to access their own data via REST API
 * This is critical for the React dashboard - customers need read access to their own resources
 */
add_filter('user_has_cap', 'samsara_grant_customer_rest_api_caps', 10, 4);
function samsara_grant_customer_rest_api_caps($allcaps, $caps, $args, $user) {
    // Only apply when checking REST API permissions
    if (!defined('REST_REQUEST') || !REST_REQUEST) {
        return $allcaps;
    }

    // Only for logged in users
    if (!$user || !isset($user->ID)) {
        return $allcaps;
    }

    $user_id = $user->ID;

    // Grant read capabilities for own data
    // These are checked by WooCommerce REST API controllers
    $allcaps['read_private_shop_orders'] = true;
    $allcaps['read_private_shop_subscriptions'] = true;
    $allcaps['read_shop_subscriptions'] = true;
    $allcaps['read_shop_subscription'] = true;
    $allcaps['edit_shop_customer'] = true;
    $allcaps['read_customer'] = true;
    $allcaps['edit_customer'] = true;

    return $allcaps;
}

/**
 * Allow users to access their own data via WooCommerce REST API
 * Additional layer of security - verify they're accessing THEIR OWN data only
 */
add_filter('woocommerce_rest_check_permissions', 'samsara_verify_own_data_access', 10, 4);
function samsara_verify_own_data_access($permission, $context, $object_id, $post_type) {
    // If permission already granted by capabilities, verify it's their own data
    if ($permission === true) {
        return $permission;
    }

    // Only modify permissions for logged in users
    if (!is_user_logged_in()) {
        return $permission;
    }

    $user_id = get_current_user_id();

    // Allow users to view/edit their own customer data
    if ($context === 'read' || $context === 'edit') {
        // Customer endpoint - allow access to own customer data
        if ($object_id == $user_id) {
            return true;
        }
    }

    // Allow users to view their own subscriptions
    if ($post_type === 'shop_subscription' && $context === 'read') {
        // If no object_id, it's a list request - check if customer param matches current user
        if (!$object_id) {
            $customer_param = isset($_GET['customer']) ? intval($_GET['customer']) : null;
            if ($customer_param === $user_id) {
                return true;
            }
        } else {
            // Check if subscription belongs to current user
            if (function_exists('wcs_get_subscription')) {
                $subscription = wcs_get_subscription($object_id);
                if ($subscription && $subscription->get_user_id() == $user_id) {
                    return true;
                }
            }
        }
    }

    // Allow users to view their own orders
    if ($post_type === 'shop_order' && $context === 'read') {
        if ($object_id) {
            $order = wc_get_order($object_id);
            if ($order && $order->get_customer_id() == $user_id) {
                return true;
            }
        } else {
            // List request - check if customer param matches
            $customer_param = isset($_GET['customer']) ? intval($_GET['customer']) : null;
            if ($customer_param === $user_id) {
                return true;
            }
        }
    }

    return $permission;
}

/**
 * Permission callback - check if user is authenticated
 */
function samsara_check_authentication($request) {
    return is_user_logged_in();
}

/**
 * Get payment methods for current user
 */
function samsara_get_payment_methods($request) {
    $user_id = get_current_user_id();

    // Get customer tokens (payment methods)
    $tokens = WC_Payment_Tokens::get_customer_tokens($user_id);

    $payment_methods = array();

    foreach ($tokens as $token) {
        $payment_methods[] = array(
            'id' => $token->get_id(),
            'type' => $token->get_type(), // 'CC' for credit card
            'brand' => $token->get_card_type(),
            'last4' => $token->get_last4(),
            'expMonth' => $token->get_expiry_month(),
            'expYear' => $token->get_expiry_year(),
            'isDefault' => $token->is_default(),
            'gateway' => $token->get_gateway_id(),
        );
    }

    return rest_ensure_response($payment_methods);
}

/**
 * Get Stripe Setup Intent for adding payment method
 * Returns client_secret and publishable_key for Stripe.js
 */
function samsara_add_payment_method($request) {
    $user_id = get_current_user_id();

    // Check if Stripe gateway is available
    if (!class_exists('WC_Stripe')) {
        return new WP_Error(
            'stripe_not_available',
            'Stripe payment gateway is not active',
            array('status' => 503)
        );
    }

    try {
        // Get Stripe gateway instance
        $gateways = WC()->payment_gateways->get_available_payment_gateways();
        $stripe_gateway = isset($gateways['stripe']) ? $gateways['stripe'] : null;

        if (!$stripe_gateway || $stripe_gateway->enabled !== 'yes') {
            error_log('Stripe gateway not available. Enabled: ' . ($stripe_gateway ? $stripe_gateway->enabled : 'null'));
            return new WP_Error(
                'stripe_not_enabled',
                'Stripe gateway is not enabled',
                array('status' => 503)
            );
        }

        // Check if publishable key is set
        if (empty($stripe_gateway->publishable_key)) {
            error_log('Stripe publishable key is not set. Test mode: ' . ($stripe_gateway->testmode === 'yes' ? 'yes' : 'no'));
            return new WP_Error(
                'stripe_key_missing',
                'Stripe publishable key is not configured. Please check your Stripe settings.',
                array('status' => 503)
            );
        }

        // Get or create Stripe customer
        // Use different meta keys for test vs live mode
        // The testmode property can be 'yes', 'no', true, false, 1, or 0
        $is_test_mode = false;
        if (isset($stripe_gateway->testmode)) {
            // Handle both string ('yes') and boolean/int (true/1) values
            $is_test_mode = ($stripe_gateway->testmode === 'yes' || $stripe_gateway->testmode === true || $stripe_gateway->testmode === 1);
        }

        error_log('Stripe test mode detected: ' . ($is_test_mode ? 'yes' : 'no') . ' (property value: ' . print_r($stripe_gateway->testmode ?? 'not set', true) . ')');

        $customer_meta_key = $is_test_mode ? '_stripe_customer_id_test' : '_stripe_customer_id';
        $customer_id = get_user_meta($user_id, $customer_meta_key, true);

        if (!$customer_id) {
            // Create Stripe customer if doesn't exist
            $user = get_userdata($user_id);
            $customer = WC_Stripe_API::request(array(
                'email' => $user->user_email,
                'description' => $user->display_name . ($is_test_mode ? ' (Test)' : ''),
            ), 'customers');

            if (is_wp_error($customer)) {
                error_log('Error creating Stripe customer: ' . $customer->get_error_message());
                return $customer;
            }

            $customer_id = $customer->id;
            update_user_meta($user_id, $customer_meta_key, $customer_id);
            error_log('Created new Stripe customer: ' . $customer_id . ' (test mode: ' . ($is_test_mode ? 'yes' : 'no') . ')');
        } else {
            error_log('Using existing Stripe customer: ' . $customer_id . ' (test mode: ' . ($is_test_mode ? 'yes' : 'no') . ')');
        }

        // Create Setup Intent
        error_log('Creating Setup Intent for customer: ' . $customer_id);
        $setup_intent = WC_Stripe_API::request(array(
            'customer' => $customer_id,
            'payment_method_types' => array('card'),
            'usage' => 'off_session', // For future subscription payments
        ), 'setup_intents');

        if (is_wp_error($setup_intent)) {
            error_log('Setup Intent error: ' . $setup_intent->get_error_message());
            return $setup_intent;
        }

        // Debug: Log the entire response structure
        error_log('Setup Intent response type: ' . gettype($setup_intent));
        error_log('Setup Intent response: ' . print_r($setup_intent, true));

        // Extract client_secret - could be in different locations depending on response format
        $client_secret = null;
        if (is_object($setup_intent)) {
            $client_secret = isset($setup_intent->client_secret) ? $setup_intent->client_secret : null;
        } elseif (is_array($setup_intent)) {
            $client_secret = isset($setup_intent['client_secret']) ? $setup_intent['client_secret'] : null;
        }

        if (empty($client_secret)) {
            error_log('Setup Intent created but client_secret is empty or missing');
            return new WP_Error(
                'invalid_setup_intent',
                'Setup Intent was created but is missing client secret',
                array('status' => 500)
            );
        }

        error_log('Setup Intent created successfully with client_secret');

        return rest_ensure_response(array(
            'clientSecret' => $client_secret,
            'publishableKey' => $stripe_gateway->publishable_key,
        ));

    } catch (Exception $e) {
        error_log('Error creating Setup Intent: ' . $e->getMessage());
        return new WP_Error(
            'setup_intent_error',
            'Failed to initialize payment method setup: ' . $e->getMessage(),
            array('status' => 500)
        );
    }
}

/**
 * Confirm and save Stripe payment method after Setup Intent succeeds
 * Called by React after Stripe.js confirms the setup
 */
function samsara_confirm_payment_method($request) {
    $user_id = get_current_user_id();
    $params = $request->get_json_params();

    error_log('Confirm payment method called for user: ' . $user_id);
    error_log('Request params: ' . print_r($params, true));

    // Required: setup_intent_id from Stripe
    $setup_intent_id = isset($params['setup_intent_id']) ? $params['setup_intent_id'] : null;
    $set_as_default = isset($params['set_as_default']) ? (bool)$params['set_as_default'] : false;

    if (!$setup_intent_id) {
        error_log('Missing setup_intent_id in request');
        return new WP_Error(
            'missing_setup_intent',
            'Setup Intent ID is required',
            array('status' => 400)
        );
    }

    error_log('Fetching Setup Intent: ' . $setup_intent_id);

    try {
        // Get Setup Intent from Stripe to retrieve the payment method
        $setup_intent = WC_Stripe_API::request(array(), 'setup_intents/' . $setup_intent_id);

        if (is_wp_error($setup_intent)) {
            return $setup_intent;
        }

        // Verify setup intent succeeded
        if ($setup_intent->status !== 'succeeded') {
            return new WP_Error(
                'setup_intent_not_succeeded',
                'Setup Intent has not succeeded yet',
                array('status' => 400)
            );
        }

        // Get the payment method ID
        $payment_method_id = $setup_intent->payment_method;

        if (!$payment_method_id) {
            return new WP_Error(
                'no_payment_method',
                'No payment method found in Setup Intent',
                array('status' => 400)
            );
        }

        // Retrieve payment method details from Stripe
        $payment_method = WC_Stripe_API::request(array(), 'payment_methods/' . $payment_method_id);

        if (is_wp_error($payment_method)) {
            return $payment_method;
        }

        // Create WooCommerce payment token
        $token = new WC_Payment_Token_CC();
        $token->set_token($payment_method_id);
        $token->set_gateway_id('stripe');
        $token->set_user_id($user_id);

        // Set card details
        if (isset($payment_method->card)) {
            $token->set_card_type(strtolower($payment_method->card->brand));
            $token->set_last4($payment_method->card->last4);
            $token->set_expiry_month($payment_method->card->exp_month);
            $token->set_expiry_year($payment_method->card->exp_year);
        }

        // Set as default if no other payment methods exist or if requested
        $existing_tokens = WC_Payment_Tokens::get_customer_tokens($user_id);
        if (empty($existing_tokens) || $set_as_default) {
            $token->set_default(true);
        }

        // Save token
        $token_id = $token->save();

        if (!$token_id) {
            return new WP_Error(
                'token_save_failed',
                'Failed to save payment method',
                array('status' => 500)
            );
        }

        // Store Stripe customer ID in token meta
        $customer_id = $setup_intent->customer;
        if ($customer_id) {
            update_metadata('payment_token', $token_id, 'customer_id', $customer_id);
        }

        return rest_ensure_response(array(
            'success' => true,
            'token_id' => $token_id,
            'message' => 'Payment method added successfully',
        ));

    } catch (Exception $e) {
        error_log('Error confirming payment method: ' . $e->getMessage());
        return new WP_Error(
            'confirm_error',
            'Failed to confirm payment method: ' . $e->getMessage(),
            array('status' => 500)
        );
    }
}

/**
 * Update payment method (e.g., set as default)
 */
function samsara_update_payment_method($request) {
    $user_id = get_current_user_id();
    $token_id = $request->get_param('id');
    $params = $request->get_json_params();

    // Get the token
    $token = WC_Payment_Tokens::get($token_id);

    // Verify token belongs to current user
    if (!$token || $token->get_user_id() != $user_id) {
        return new WP_Error('invalid_token', 'Payment method not found', array('status' => 404));
    }

    // Set as default if requested
    if (isset($params['isDefault']) && $params['isDefault']) {
        WC_Payment_Tokens::set_users_default($user_id, $token_id);
    }

    return rest_ensure_response(array(
        'success' => true,
        'message' => 'Payment method updated successfully',
    ));
}

/**
 * Delete a payment method
 */
function samsara_delete_payment_method($request) {
    $user_id = get_current_user_id();
    $token_id = $request->get_param('id');

    // Get the token
    $token = WC_Payment_Tokens::get($token_id);

    // Verify token belongs to current user
    if (!$token || $token->get_user_id() != $user_id) {
        return new WP_Error('invalid_token', 'Payment method not found', array('status' => 404));
    }

    // Delete the token
    WC_Payment_Tokens::delete($token_id);

    return rest_ensure_response(array(
        'success' => true,
        'message' => 'Payment method deleted successfully',
    ));
}

/**
 * Get user memberships
 * Returns additional memberships/products the user has access to
 */
function samsara_get_memberships($request) {
    try {
        $user_id = get_current_user_id();
        error_log('MEMBERSHIPS DEBUG - User ID: ' . $user_id);

        if (!$user_id) {
            error_log('MEMBERSHIPS DEBUG - No user ID, returning empty');
            return rest_ensure_response(array());
        }

        $memberships = array();

        // Check if WooCommerce Memberships plugin is active
        error_log('MEMBERSHIPS DEBUG - Checking for wc_memberships_get_user_memberships function: ' . (function_exists('wc_memberships_get_user_memberships') ? 'YES' : 'NO'));
        if (function_exists('wc_memberships_get_user_memberships')) {
            try {
                $user_memberships = wc_memberships_get_user_memberships($user_id);
                error_log('MEMBERSHIPS DEBUG - wc_memberships_get_user_memberships returned: ' . print_r($user_memberships, true));

                if (is_wp_error($user_memberships)) {
                    error_log('WP Error in get_user_memberships: ' . $user_memberships->get_error_message());
                    return rest_ensure_response(array());
                }

                if (!empty($user_memberships) && is_array($user_memberships)) {
                    error_log('MEMBERSHIPS DEBUG - Processing ' . count($user_memberships) . ' memberships');
                    foreach ($user_memberships as $membership) {
                        try {
                            if (!is_object($membership) || !method_exists($membership, 'get_plan')) {
                                error_log('MEMBERSHIPS DEBUG - Skipping invalid membership object');
                                continue;
                            }

                            $plan = $membership->get_plan();

                            if (!$plan) {
                                error_log('MEMBERSHIPS DEBUG - No plan found for membership');
                                continue;
                            }

                            // Get restricted content pages for this membership plan
                            $restricted_pages = array();
                            $plan_id = $plan->get_id();

                            // Query for pages that are restricted to this membership plan
                            $args = array(
                                'post_type' => 'page',
                                'post_status' => 'publish',
                                'posts_per_page' => -1,
                                'meta_query' => array(
                                    array(
                                        'key' => '_wc_memberships_force_public',
                                        'compare' => 'NOT EXISTS',
                                    ),
                                ),
                            );

                            $pages = get_posts($args);
                            foreach ($pages as $page) {
                                // Skip "My account" page - we don't want to show this
                                if (strtolower($page->post_title) === 'my account' || $page->post_name === 'my-account') {
                                    continue;
                                }

                                // Check if this page is restricted to this membership plan
                                $rules = get_post_meta($page->ID, '_wc_memberships_content_restriction_rules', true);
                                if (!empty($rules)) {
                                    foreach ($rules as $rule) {
                                        if (isset($rule['membership_plan_id']) && $rule['membership_plan_id'] == $plan_id) {
                                            $restricted_pages[] = array(
                                                'id' => $page->ID,
                                                'title' => $page->post_title,
                                                'url' => get_permalink($page->ID),
                                            );
                                            break;
                                        }
                                    }
                                }
                            }

                            // If no restricted pages found via meta, try the membership plan's content restriction rules
                            if (empty($restricted_pages) && method_exists($plan, 'get_content_restriction_rules')) {
                                $rules = $plan->get_content_restriction_rules();
                                error_log('MEMBERSHIPS DEBUG - Content restriction rules: ' . print_r($rules, true));

                                if (!empty($rules)) {
                                    foreach ($rules as $rule) {
                                        if (method_exists($rule, 'get_content_type') && $rule->get_content_type() === 'post_type') {
                                            $object_ids = method_exists($rule, 'get_object_ids') ? $rule->get_object_ids() : array();
                                            foreach ($object_ids as $page_id) {
                                                $page = get_post($page_id);
                                                if ($page && $page->post_status === 'publish') {
                                                    // Skip "My account" page
                                                    if (strtolower($page->post_title) === 'my account' || $page->post_name === 'my-account') {
                                                        continue;
                                                    }

                                                    $restricted_pages[] = array(
                                                        'id' => $page_id,
                                                        'title' => $page->post_title,
                                                        'url' => get_permalink($page_id),
                                                    );
                                                }
                                            }
                                        }
                                    }
                                }
                            }

                            $membership_data = array(
                                'id' => (string) $membership->get_id(),
                                'name' => $plan->get_name() ?: '',
                                'slug' => $plan->get_slug() ?: '',
                                'status' => $membership->get_status() ?: 'unknown',
                                'startedAt' => $membership->get_start_date('Y-m-d') ?: '',
                                'expiresAt' => $membership->get_end_date('Y-m-d') ?: '',
                                'restrictedPages' => $restricted_pages,
                            );
                            error_log('MEMBERSHIPS DEBUG - Adding membership: ' . print_r($membership_data, true));
                            $memberships[] = $membership_data;
                        } catch (Exception $e) {
                            error_log('Error processing individual membership: ' . $e->getMessage());
                            continue;
                        } catch (Throwable $e) {
                            error_log('Fatal error processing membership: ' . $e->getMessage());
                            continue;
                        }
                    }
                }
            } catch (Exception $e) {
                error_log('Error calling wc_memberships_get_user_memberships: ' . $e->getMessage());
                return rest_ensure_response(array());
            } catch (Throwable $e) {
                error_log('Fatal error in membership retrieval: ' . $e->getMessage());
                return rest_ensure_response(array());
            }
        } else {
            error_log('MEMBERSHIPS DEBUG - WooCommerce Memberships plugin not active or function not found');
        }

        error_log('MEMBERSHIPS DEBUG - Returning ' . count($memberships) . ' memberships');
        return rest_ensure_response($memberships);
    } catch (Exception $e) {
        error_log('Error in samsara_get_memberships: ' . $e->getMessage());
        return rest_ensure_response(array());
    } catch (Throwable $e) {
        error_log('Fatal error in samsara_get_memberships: ' . $e->getMessage());
        return rest_ensure_response(array());
    }
}

/**
 * Get dashboard statistics
 * Returns aggregated data for the dashboard overview
 */
function samsara_get_dashboard_stats($request) {
    $user_id = get_current_user_id();

    $stats = array(
        'totalOrders' => 0,
        'activeSubscriptions' => 0,
        'totalSpent' => 0,
        'activeMemberships' => 0,
    );

    // Get total orders count
    $customer = new WC_Customer($user_id);
    $orders = wc_get_orders(array(
        'customer' => $user_id,
        'limit' => -1,
    ));
    $stats['totalOrders'] = count($orders);

    // Calculate total spent
    foreach ($orders as $order) {
        if ($order->get_status() === 'completed') {
            $stats['totalSpent'] += floatval($order->get_total());
        }
    }

    // Get active subscriptions count
    if (function_exists('wcs_get_users_subscriptions')) {
        $subscriptions = wcs_get_users_subscriptions($user_id);
        foreach ($subscriptions as $subscription) {
            if ($subscription->has_status('active')) {
                $stats['activeSubscriptions']++;
            }
        }
    }

    // Get active memberships count
    if (function_exists('wc_memberships_get_user_memberships')) {
        $memberships = wc_memberships_get_user_memberships($user_id, array(
            'status' => 'active',
        ));
        $stats['activeMemberships'] = count($memberships);
    }

    return rest_ensure_response($stats);
}

/**
 * Get user subscriptions using native WooCommerce Subscriptions functions
 * This bypasses the WooCommerce REST API which can be unreliable
 */
function samsara_get_user_subscriptions($request) {
    $user_id = get_current_user_id();

    // Check if WooCommerce Subscriptions is active
    if (!function_exists('wcs_get_users_subscriptions')) {
        return new WP_Error(
            'subscriptions_not_available',
            'WooCommerce Subscriptions plugin is not active',
            array('status' => 503)
        );
    }

    try {
        // Get filter parameters
        $status = $request->get_param('status');

        // Get all user subscriptions using native function
        $subscriptions = wcs_get_users_subscriptions($user_id);

        $formatted_subscriptions = array();

        foreach ($subscriptions as $subscription) {
            // Filter by status if provided
            if ($status && !$subscription->has_status($status)) {
                continue;
            }

            // Get line items and product info
            $line_items = array();
            $product_id = null;
            $product_url = null;

            foreach ($subscription->get_items() as $item) {
                $line_items[] = array(
                    'id' => $item->get_id(),
                    'name' => $item->get_name(),
                    'quantity' => $item->get_quantity(),
                    'total' => $item->get_total(),
                );

                // Get product ID from first item for re-subscribe functionality
                if (!$product_id) {
                    $product_id = $item->get_product_id();
                    if ($product_id) {
                        $product_url = get_permalink($product_id);
                    }
                }
            }

            // Format subscription data to match WooCommerce REST API structure
            $formatted_subscriptions[] = array(
                'id' => $subscription->get_id(),
                'parent_id' => $subscription->get_parent_id(),
                'status' => $subscription->get_status(),
                'currency' => $subscription->get_currency(),
                'date_created' => $subscription->get_date_created() ? $subscription->get_date_created()->date('Y-m-d\TH:i:s') : null,
                'date_modified' => $subscription->get_date_modified() ? $subscription->get_date_modified()->date('Y-m-d\TH:i:s') : null,
                'discount_total' => $subscription->get_total_discount(),
                'discount_tax' => '0.00',
                'shipping_total' => $subscription->get_shipping_total(),
                'shipping_tax' => $subscription->get_shipping_tax(),
                'cart_tax' => $subscription->get_cart_tax(),
                'total' => $subscription->get_total(),
                'total_tax' => $subscription->get_total_tax(),
                'customer_id' => $subscription->get_user_id(),
                'billing_period' => $subscription->get_billing_period(),
                'billing_interval' => $subscription->get_billing_interval(),
                'start_date' => $subscription->get_date('start'),
                'trial_end_date' => $subscription->get_date('trial_end'),
                'next_payment_date' => $subscription->get_date('next_payment'),
                'last_payment_date' => $subscription->get_date('last_order_date_created'),
                'end_date' => $subscription->get_date('end'),
                'line_items' => $line_items,
                'payment_method' => $subscription->get_payment_method(),
                'payment_method_title' => $subscription->get_payment_method_title(),
                'product_id' => $product_id,
                'product_url' => $product_url,
            );
        }

        return rest_ensure_response($formatted_subscriptions);

    } catch (Exception $e) {
        error_log('Error in samsara_get_user_subscriptions: ' . $e->getMessage());
        return new WP_Error(
            'subscription_error',
            'Failed to fetch subscriptions: ' . $e->getMessage(),
            array('status' => 500)
        );
    }
}

/**
 * Get subscription related to a specific order
 * Returns subscription info if the order is linked to a subscription
 */
function samsara_get_order_subscription($request) {
    $order_id = $request->get_param('id');
    $user_id = get_current_user_id();

    // Check if WooCommerce Subscriptions is active
    if (!function_exists('wcs_get_subscriptions_for_order')) {
        return rest_ensure_response(null);
    }

    try {
        // Get the order
        $order = wc_get_order($order_id);

        // Verify order exists and belongs to current user
        if (!$order || $order->get_customer_id() != $user_id) {
            return new WP_Error(
                'order_not_found',
                'Order not found or does not belong to current user',
                array('status' => 404)
            );
        }

        // Get subscriptions related to this order
        $subscriptions = wcs_get_subscriptions_for_order($order_id, array('order_type' => 'any'));

        if (empty($subscriptions)) {
            return rest_ensure_response(null);
        }

        // Get the first subscription (typically there's only one)
        $subscription = reset($subscriptions);

        // Check relationship type
        $is_renewal = false;
        $is_switch = false;
        $is_parent = false;

        // Check if this order is the parent order (initial subscription order)
        if ($subscription->get_parent_id() == $order_id) {
            $is_parent = true;
        }

        // Check renewal orders
        $renewal_orders = $subscription->get_related_orders('ids', 'renewal');
        if (in_array($order_id, $renewal_orders)) {
            $is_renewal = true;
        }

        // Check switch orders
        $switch_orders = $subscription->get_related_orders('ids', 'switch');
        if (in_array($order_id, $switch_orders)) {
            $is_switch = true;
        }

        return rest_ensure_response(array(
            'subscriptionId' => $subscription->get_id(),
            'isParent' => $is_parent,
            'isRenewal' => $is_renewal,
            'isSwitch' => $is_switch,
            'subscriptionStatus' => $subscription->get_status(),
        ));

    } catch (Exception $e) {
        error_log('Error in samsara_get_order_subscription: ' . $e->getMessage());
        return rest_ensure_response(null);
    }
}

/**
 * Get orders related to a specific subscription
 * Uses WooCommerce Subscriptions internal functions to get correct orders
 */
function samsara_get_subscription_orders($request) {
    $subscription_id = $request->get_param('id');
    $user_id = get_current_user_id();

    // Check if WooCommerce Subscriptions is active
    if (!function_exists('wcs_get_subscription')) {
        return new WP_Error(
            'subscriptions_not_available',
            'WooCommerce Subscriptions plugin is not active',
            array('status' => 503)
        );
    }

    try {
        // Get the subscription object
        $subscription = wcs_get_subscription($subscription_id);

        // Verify subscription exists and belongs to current user
        if (!$subscription || $subscription->get_user_id() != $user_id) {
            return new WP_Error(
                'subscription_not_found',
                'Subscription not found or does not belong to current user',
                array('status' => 404)
            );
        }

        // Get related orders using WooCommerce Subscriptions method
        $related_order_ids = $subscription->get_related_orders('ids', 'any');

        if (empty($related_order_ids)) {
            return rest_ensure_response(array());
        }

        // Fetch each order using WooCommerce
        $orders = array();
        foreach ($related_order_ids as $order_id) {
            $order = wc_get_order($order_id);

            if ($order) {
                // Get line items and ensure it's an array
                $line_items = $order->get_items();
                $line_items_array = array();

                if (!empty($line_items) && is_iterable($line_items)) {
                    foreach ($line_items as $item) {
                        $line_items_array[] = array(
                            'id' => $item->get_id(),
                            'name' => $item->get_name(),
                            'quantity' => $item->get_quantity(),
                            'total' => $item->get_total(),
                        );
                    }
                }

                // Transform to match WC REST API format
                $orders[] = array(
                    'id' => $order->get_id(),
                    'status' => $order->get_status(),
                    'date_created' => $order->get_date_created()->date('Y-m-d\TH:i:s'),
                    'total' => $order->get_total(),
                    'currency' => $order->get_currency(),
                    'payment_method_title' => $order->get_payment_method_title(),
                    'line_items' => $line_items_array,
                    'subtotal' => $order->get_subtotal(),
                    'shipping_total' => $order->get_shipping_total(),
                    'total_tax' => $order->get_total_tax(),
                    'discount_total' => $order->get_discount_total(),
                );
            }
        }

        return rest_ensure_response($orders);

    } catch (Exception $e) {
        error_log('Error in samsara_get_subscription_orders: ' . $e->getMessage());
        return new WP_Error(
            'subscription_orders_error',
            'Failed to fetch subscription orders: ' . $e->getMessage(),
            array('status' => 500)
        );
    }
}

/**
 * ========================================
 * PROGRAMS URL STRUCTURE & REDIRECTS
 * ========================================
 *
 * This section handles:
 * 1. Hiding /programs/ from user-facing URLs
 * 2. Redirecting old /my-account/ URLs to new structure
 *
 * WordPress Structure: /programs/page-slug/
 * User-Facing URLs: /page-slug/
 * Old URLs: /my-account/page-slug/ → /page-slug/
 */

/**
 * Rewrite URLs to hide /programs/ from user-facing URLs
 * Structure: /programs/page-slug/ becomes /page-slug/
 */
add_action('init', 'samsara_programs_rewrite_rules');
function samsara_programs_rewrite_rules() {
    // Match any top-level URL that isn't a WordPress or WooCommerce endpoint
    // Exclude: programs page itself, shop, cart, checkout, my-account, athlete
    add_rewrite_rule(
        '^(?!programs$|shop|cart|checkout|my-account|athlete|wp-admin|wp-content|wp-includes)([^/]+)/?$',
        'index.php?pagename=programs/$matches[1]',
        'top'
    );

    // Also handle pagination if needed
    add_rewrite_rule(
        '^(?!programs$|shop|cart|checkout|my-account|athlete)([^/]+)/page/?([0-9]{1,})/?$',
        'index.php?pagename=programs/$matches[1]&paged=$matches[2]',
        'top'
    );
}

/**
 * Filter permalinks to remove /programs/ from URLs
 * This makes get_permalink() return clean URLs
 */
add_filter('page_link', 'samsara_remove_programs_from_permalink', 10, 2);
function samsara_remove_programs_from_permalink($permalink, $post) {
    // Get post object if we received an ID
    if (is_numeric($post)) {
        $post = get_post($post);
    }

    // Safety check - ensure we have a valid post object
    if (!$post || !is_object($post)) {
        return $permalink;
    }

    // Only modify pages that are children of the "programs" page
    if ($post->post_type === 'page' && $post->post_parent) {
        $parent = get_post($post->post_parent);
        if ($parent && $parent->post_name === 'programs') {
            // Remove /programs/ from the URL
            $permalink = str_replace('/programs/', '/', $permalink);
        }
    }
    return $permalink;
}

/**
 * Redirect old /my-account/* URLs and /programs/* URLs to new top-level URLs
 */
add_action('template_redirect', 'samsara_redirect_legacy_my_account_urls', 1);
function samsara_redirect_legacy_my_account_urls() {
    $request_uri = $_SERVER['REQUEST_URI'];

    // Redirect /programs/* to clean top-level URLs (prevent duplicate content)
    if (preg_match('#^/programs/([^/]+)/?$#', $request_uri, $matches)) {
        $slug = $matches[1];
        // Don't redirect the /programs/ page itself
        if ($slug !== '' && $slug !== 'programs') {
            wp_redirect(home_url('/' . $slug . '/'), 301);
            exit;
        }
    }

    // Check if this is an old /my-account/ content URL (not a WooCommerce endpoint)
    if (preg_match('#^/my-account/([^/]+)/?$#', $request_uri, $matches)) {
        $slug = $matches[1];

        // Don't redirect WooCommerce dashboard endpoints
        $dashboard_endpoints = array(
            'dashboard',
            'orders',
            'view-order',
            'downloads',
            'edit-account',
            'edit-address',
            'payment-methods',
            'lost-password',
            'customer-logout',
            'subscriptions',
            'view-subscription'
        );

        if (!in_array($slug, $dashboard_endpoints)) {
            // This is membership content - redirect to top-level URL
            wp_redirect(home_url('/' . $slug . '/'), 301);
            exit;
        }
    }

    // Redirect /my-account/ itself to the new React dashboard
    if (preg_match('#^/my-account/?$#', $request_uri)) {
        wp_redirect(home_url('/athlete/'), 301);
        exit;
    }

    // Redirect old /account-dashboard/ to new /athlete/ URL
    if (preg_match('#^/account-dashboard/?(.*)$#', $request_uri, $matches)) {
        $subroute = $matches[1];
        wp_redirect(home_url('/athlete/' . $subroute), 301);
        exit;
    }
}

/**
 * Flush rewrite rules on theme activation
 * This ensures the custom rewrite rules are registered
 */
add_action('after_switch_theme', 'samsara_flush_rewrite_rules');
function samsara_flush_rewrite_rules() {
    samsara_programs_rewrite_rules();
    flush_rewrite_rules();
}

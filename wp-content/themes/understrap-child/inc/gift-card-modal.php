<?php
/**
 * Gift Card Balance Checker Modal
 * Adds a modal popup for checking gift card balances
 * Can be triggered from any link with class "gift-card-checker-trigger"
 */

/**
 * Enqueue modal assets on all pages
 */
function samsara_enqueue_gift_card_modal_assets() {
    // Enqueue modal styles
    wp_enqueue_style(
        'samsara-gift-card-modal',
        get_stylesheet_directory_uri() . '/css/gift-card-modal.css',
        array(),
        '1.0.0'
    );

    // Enqueue modal script
    wp_enqueue_script(
        'samsara-gift-card-modal',
        get_stylesheet_directory_uri() . '/js/gift-card-modal.js',
        array('jquery'),
        '1.0.0',
        true
    );

    // Localize script with API settings
    wp_localize_script('samsara-gift-card-modal', 'giftCardModalSettings', array(
        'apiUrl' => rest_url('samsara/v1/gift-cards/balance/'),
        'nonce' => wp_create_nonce('wp_rest'),
    ));
}
add_action('wp_enqueue_scripts', 'samsara_enqueue_gift_card_modal_assets');

/**
 * Add modal HTML to footer
 */
function samsara_add_gift_card_modal_to_footer() {
    ?>
    <!-- Gift Card Balance Checker Modal -->
    <div id="gift-card-modal" class="gc-modal" role="dialog" aria-labelledby="gc-modal-title" aria-modal="true" style="display: none;">
        <div class="gc-modal-overlay"></div>
        <div class="gc-modal-container">
            <div class="gc-modal-content">
                <!-- Header -->
                <div class="gc-modal-header">
                    <h2 id="gc-modal-title" class="gc-modal-title">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                            <line x1="2" y1="10" x2="22" y2="10"></line>
                        </svg>
                        Check Gift Card Balance
                    </h2>
                    <button type="button" class="gc-modal-close" aria-label="Close modal">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <!-- Body -->
                <div class="gc-modal-body">
                    <p class="gc-modal-description">
                        Enter your gift card code to check the balance and expiry date.
                    </p>

                    <form id="gc-modal-form" class="gc-form">
                        <div class="gc-form-group">
                            <label for="gc-code-input" class="gc-label">Gift Card Code</label>
                            <input
                                type="text"
                                id="gc-code-input"
                                class="gc-input"
                                placeholder="Enter gift card code..."
                                required
                                autocomplete="off"
                            />
                        </div>

                        <button type="submit" class="gc-submit-btn" id="gc-submit-btn">
                            <span class="gc-btn-text">Check Balance</span>
                            <span class="gc-btn-loading" style="display: none;">
                                <span class="gc-spinner"></span>
                                Checking...
                            </span>
                        </button>
                    </form>

                    <!-- Results -->
                    <div id="gc-results" class="gc-results" style="display: none;">
                        <!-- Success -->
                        <div id="gc-success" class="gc-success" style="display: none;">
                            <div class="gc-success-header">
                                <div class="gc-success-badge">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                    Gift Card Found
                                </div>
                                <span class="gc-status-badge" id="gc-status"></span>
                            </div>

                            <div class="gc-code-display">
                                <span class="gc-code-label">Code:</span>
                                <code id="gc-result-code"></code>
                            </div>

                            <div class="gc-details-grid">
                                <div class="gc-detail-card">
                                    <span class="gc-detail-label">Remaining Balance</span>
                                    <span class="gc-detail-value gc-balance" id="gc-balance"></span>
                                </div>
                                <div class="gc-detail-card">
                                    <span class="gc-detail-label">Expiry Date</span>
                                    <span class="gc-detail-value" id="gc-expiry"></span>
                                </div>
                            </div>

                            <button type="button" class="gc-reset-btn" id="gc-reset-btn">
                                Check Another Card
                            </button>
                        </div>

                        <!-- Error -->
                        <div id="gc-error" class="gc-error" style="display: none;">
                            <div class="gc-error-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                            </div>
                            <p class="gc-error-message" id="gc-error-message"></p>
                            <button type="button" class="gc-reset-btn" id="gc-reset-btn-error">
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <?php
}
add_action('wp_footer', 'samsara_add_gift_card_modal_to_footer');

/**
 * Register a custom menu location for footer if not exists
 * This is optional - only if you need a dedicated footer menu
 */
function samsara_register_gift_card_menu() {
    if (!has_nav_menu('gift-card-footer')) {
        register_nav_menus(array(
            'gift-card-footer' => __('Gift Card Footer Menu', 'understrap-child'),
        ));
    }
}
add_action('after_setup_theme', 'samsara_register_gift_card_menu');

/**
 * Handle /gift-card URL to prevent 404 and show modal
 * Redirects to homepage with modal auto-open
 */
function samsara_gift_card_virtual_page() {
    $request_uri = trim($_SERVER['REQUEST_URI'], '/');

    // List of paths that should trigger the modal
    $gift_card_paths = array('gift-card', 'check-gift-card', 'gift-card-balance');

    foreach ($gift_card_paths as $path) {
        if ($request_uri === $path || strpos($request_uri, $path . '?') === 0) {
            // Load the homepage template
            // The modal will auto-open via JavaScript based on the URL
            global $wp_query;
            $wp_query->is_home = true;
            $wp_query->is_404 = false;
            status_header(200);

            // Load homepage template
            include(get_home_template());
            exit;
        }
    }
}
add_action('template_redirect', 'samsara_gift_card_virtual_page', 1);

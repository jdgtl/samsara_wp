<?php
/**
 * Gift Card Balance Checker Shortcode
 * Public-facing shortcode for checking gift card balances
 *
 * Usage: [gift_card_balance_checker]
 *
 * Add this to any page to create a public balance checker
 */

function samsara_gift_card_balance_checker_shortcode($atts) {
    // Parse attributes
    $atts = shortcode_atts(array(
        'title' => 'Check Gift Card Balance',
        'description' => 'Enter your gift card code to check the balance.',
    ), $atts, 'gift_card_balance_checker');

    // Enqueue necessary styles and scripts
    wp_enqueue_style('samsara-gift-card-checker', get_stylesheet_directory_uri() . '/css/gift-card-checker.css', array(), '1.0.0');
    wp_enqueue_script('samsara-gift-card-checker', get_stylesheet_directory_uri() . '/js/gift-card-checker.js', array('jquery'), '1.0.0', true);

    // Localize script with API settings
    wp_localize_script('samsara-gift-card-checker', 'giftCardCheckerSettings', array(
        'ajaxUrl' => admin_url('admin-ajax.php'),
        'apiUrl' => rest_url('samsara/v1/gift-cards/balance/'),
        'nonce' => wp_create_nonce('wp_rest'),
    ));

    // Build the HTML output
    ob_start();
    ?>
    <div class="samsara-gift-card-checker" id="gift-card-balance-checker">
        <div class="checker-container">
            <?php if ($atts['title']): ?>
                <h2 class="checker-title"><?php echo esc_html($atts['title']); ?></h2>
            <?php endif; ?>

            <?php if ($atts['description']): ?>
                <p class="checker-description"><?php echo esc_html($atts['description']); ?></p>
            <?php endif; ?>

            <form class="checker-form" id="gift-card-checker-form">
                <div class="form-group">
                    <label for="gift-card-code" class="sr-only">Gift Card Code</label>
                    <div class="input-wrapper">
                        <input
                            type="text"
                            id="gift-card-code"
                            name="gift_card_code"
                            class="checker-input"
                            placeholder="Enter gift card code..."
                            required
                            autocomplete="off"
                        />
                        <button type="submit" class="checker-button" id="check-balance-btn">
                            <span class="button-text">Check Balance</span>
                            <span class="button-loading" style="display: none;">
                                <span class="spinner"></span> Checking...
                            </span>
                        </button>
                    </div>
                </div>
            </form>

            <!-- Results Container -->
            <div class="checker-results" id="checker-results" style="display: none;">
                <!-- Success Result -->
                <div class="result-success" id="result-success" style="display: none;">
                    <div class="result-header">
                        <div class="result-badge">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            Gift Card Found
                        </div>
                        <span class="status-badge" id="status-badge"></span>
                    </div>
                    <div class="result-code">
                        <span class="code-label">Code:</span>
                        <code id="result-code"></code>
                    </div>
                    <div class="result-details">
                        <div class="detail-item">
                            <span class="detail-label">Remaining Balance</span>
                            <span class="detail-value balance" id="result-balance"></span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Expiry Date</span>
                            <span class="detail-value" id="result-expiry"></span>
                        </div>
                    </div>
                    <button type="button" class="checker-reset" id="reset-btn">
                        Check Another Card
                    </button>
                </div>

                <!-- Error Result -->
                <div class="result-error" id="result-error" style="display: none;">
                    <div class="error-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                    </div>
                    <p class="error-message" id="error-message"></p>
                    <button type="button" class="checker-reset" id="reset-btn-error">
                        Try Again
                    </button>
                </div>
            </div>
        </div>
    </div>
    <?php
    return ob_get_clean();
}

add_shortcode('gift_card_balance_checker', 'samsara_gift_card_balance_checker_shortcode');

/**
 * Alternative shorter shortcode name
 */
add_shortcode('check_gift_card', 'samsara_gift_card_balance_checker_shortcode');

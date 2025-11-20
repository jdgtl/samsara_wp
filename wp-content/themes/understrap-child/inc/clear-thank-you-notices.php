<?php
/**
 * Clear WooCommerce Notices on Thank You Pages
 *
 * Prevents confusing error/notice messages from appearing on order confirmation pages.
 * After a successful purchase, the cart validation notices should not be displayed.
 */

add_action('template_redirect', 'samsara_clear_thank_you_notices', 1);

function samsara_clear_thank_you_notices() {
    // Check if this is an order received (thank you) page
    if (is_order_received_page() || is_checkout()) {
        // Check if order was successfully placed
        global $wp;

        // For standard WooCommerce thank you page
        if (is_order_received_page() && isset($wp->query_vars['order-received'])) {
            wc_clear_notices();
        }

        // For CartFlows thank you steps (URL contains 'thank' or ends with order ID)
        if (is_page() && function_exists('WCFB')) {
            $current_url = $_SERVER['REQUEST_URI'];

            // Check if URL suggests this is a thank you page
            if (strpos($current_url, 'thank') !== false ||
                strpos($current_url, 'confirmation') !== false ||
                (isset($_GET['wcf-order']) && !empty($_GET['wcf-order']))) {
                wc_clear_notices();
            }
        }
    }
}

/**
 * Alternative approach: Clear notices specifically after successful order
 * This hooks into WooCommerce after order is processed
 */
add_action('woocommerce_thankyou', 'samsara_clear_notices_after_order', 1);

function samsara_clear_notices_after_order($order_id) {
    if ($order_id > 0) {
        // Order was successfully created, clear any cart-related notices
        wc_clear_notices();
    }
}

<?php
/**
 * Gift Card Checkout Debug
 * Temporary file to debug why gift cards aren't showing at checkout
 */

// Try multiple hooks to see when WC_GC becomes available
add_action('wp', function() {
    // Skip in admin area - WooCommerce sessions don't exist there
    if (is_admin()) {
        return;
    }

    error_log('🔍 DEBUG wp hook - WC_GC() function exists: ' . (function_exists('WC_GC') ? 'YES' : 'NO'));
    error_log('🔍 DEBUG wp hook - WC_Gift_Cards class exists: ' . (class_exists('WC_Gift_Cards') ? 'YES' : 'NO'));
    if (function_exists('WC_GC')) {
        $wc_gc = WC_GC();
        error_log('🔍 DEBUG wp hook - WC_GC()->account exists: ' . (isset($wc_gc->account) ? 'YES' : 'NO'));
        if (isset($wc_gc->account)) {
            try {
                $has_balance = $wc_gc->account->has_balance();
                $balance = $wc_gc->account->get_balance();
                $active_cards = $wc_gc->account->get_active_giftcards(get_current_user_id());
                error_log('🔍 DEBUG wp hook - WC_GC()->account->has_balance(): ' . ($has_balance ? 'YES' : 'NO'));
                error_log('🔍 DEBUG wp hook - WC_GC()->account->get_balance(): ' . $balance);
                error_log('🔍 DEBUG wp hook - Active gift cards count: ' . count($active_cards));
            } catch (Exception $e) {
                error_log('🔍 DEBUG wp hook - Error accessing gift card account: ' . $e->getMessage());
            }
        }
    }
    error_log('🔍 DEBUG wp hook - get_option woocommerce_enable_gc_account: ' . get_option('woocommerce_enable_gc_account', 'not set'));
}, 999);

add_action('woocommerce_before_checkout_form', function() {
    error_log('🔍 DEBUG before_checkout_form - WC_GC exists: ' . (class_exists('WC_GC') ? 'YES' : 'NO'));
}, 999);

add_action('woocommerce_checkout_before_customer_details', function() {
    if (!is_user_logged_in()) {
        error_log('🔍 GIFT CARD DEBUG - User not logged in');
        return;
    }

    $user_id = get_current_user_id();
    $user = wp_get_current_user();

    error_log('🔍 GIFT CARD DEBUG - User ID: ' . $user_id);
    error_log('🔍 GIFT CARD DEBUG - User Email: ' . $user->user_email);

    if (!class_exists('WC_GC')) {
        error_log('🔍 GIFT CARD DEBUG - WC_GC class does not exist!');
        return;
    }

    error_log('🔍 GIFT CARD DEBUG - WC_GC class exists');

    try {
        $has_balance = WC_GC()->account->has_balance();
        error_log('🔍 GIFT CARD DEBUG - has_balance(): ' . ($has_balance ? 'true' : 'false'));
    } catch (Exception $e) {
        error_log('🔍 GIFT CARD DEBUG - Error calling has_balance(): ' . $e->getMessage());
    }

    try {
        $balance = WC_GC()->account->get_balance();
        error_log('🔍 GIFT CARD DEBUG - get_balance(): ' . $balance);
    } catch (Exception $e) {
        error_log('🔍 GIFT CARD DEBUG - Error calling get_balance(): ' . $e->getMessage());
    }

    try {
        $active_cards = WC_GC()->account->get_active_giftcards($user_id);
        error_log('🔍 GIFT CARD DEBUG - Active cards count: ' . count($active_cards));

        foreach ($active_cards as $card) {
            error_log('🔍 GIFT CARD DEBUG - Card ID: ' . $card->get_id() . ', Code: ' . $card->get_code() . ', Balance: ' . $card->get_balance());
        }
    } catch (Exception $e) {
        error_log('🔍 GIFT CARD DEBUG - Error getting active cards: ' . $e->getMessage());
    }

    try {
        // Also check if redeeming is enabled
        $redeeming_enabled = wc_gc_is_redeeming_enabled();
        error_log('🔍 GIFT CARD DEBUG - wc_gc_is_redeeming_enabled(): ' . ($redeeming_enabled ? 'true' : 'false'));
    } catch (Exception $e) {
        error_log('🔍 GIFT CARD DEBUG - Error checking redeeming enabled: ' . $e->getMessage());
    }
});

<?php
/**
 * One-time fix to enable gift card account features
 * This sets the option that should have been set by the settings page
 */

add_action('init', function() {
    // Only run once
    if (get_option('woocommerce_enable_gc_account_fixed') === 'yes') {
        return;
    }

    // Set the option
    update_option('woocommerce_enable_gc_account', 'yes');

    // Mark as fixed
    update_option('woocommerce_enable_gc_account_fixed', 'yes');

    error_log('✅ Gift card account option has been set to: yes');
});

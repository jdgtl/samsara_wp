<?php
/**
 * Clean Up Duplicate Payment Methods
 *
 * Removes duplicate payment tokens from the database
 * Keeps the newest token for each unique card (by last4, card_type, and latest expiry)
 */

add_action('wp', function() {
    if (!isset($_GET['cleanup_payment_duplicates'])) {
        return;
    }

    if (!current_user_can('manage_options')) {
        wp_die('Unauthorized');
    }

    $user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;

    echo '<html><head><title>Clean Up Duplicate Payment Methods</title>';
    echo '<style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 20px; background: #f5f5f5; }
        h1 { color: #333; }
        pre { background: white; padding: 20px; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); font-family: "Courier New", monospace; font-size: 13px; line-height: 1.6; }
        .success { color: #2D9554; }
        .warning { color: #D4A127; }
        .error { color: #BA4A52; }
        .info { color: #666; }
    </style></head><body>';
    echo '<h1>Clean Up Duplicate Payment Methods</h1>';
    echo '<pre>';

    global $wpdb;

    if ($user_id > 0) {
        // Clean up for specific user
        echo "<span class='info'>Cleaning up duplicates for user ID: {$user_id}</span>\n\n";
        cleanup_user_duplicates($user_id, $wpdb);
    } else {
        // Clean up for ALL users
        echo "<span class='warning'>WARNING: Cleaning up duplicates for ALL users</span>\n\n";

        $all_users = $wpdb->get_col("SELECT DISTINCT user_id FROM {$wpdb->prefix}woocommerce_payment_tokens ORDER BY user_id");

        echo "<span class='info'>Found " . count($all_users) . " users with payment tokens</span>\n\n";

        foreach ($all_users as $uid) {
            cleanup_user_duplicates($uid, $wpdb);
        }
    }

    echo '</pre></body></html>';
    exit;
});

function cleanup_user_duplicates($user_id, $wpdb) {
    echo "<span class='info'>--- User ID: {$user_id} ---</span>\n";

    // Get all tokens for this user
    $tokens = $wpdb->get_results($wpdb->prepare(
        "SELECT * FROM {$wpdb->prefix}woocommerce_payment_tokens WHERE user_id = %d ORDER BY token_id ASC",
        $user_id
    ));

    if (empty($tokens)) {
        echo "<span class='info'>No payment tokens found</span>\n\n";
        return;
    }

    echo "Found " . count($tokens) . " payment tokens\n";

    // Group tokens by card (last4 + card_type)
    $grouped = [];
    foreach ($tokens as $token) {
        $meta = $wpdb->get_results($wpdb->prepare(
            "SELECT meta_key, meta_value FROM {$wpdb->prefix}woocommerce_payment_tokenmeta WHERE payment_token_id = %d",
            $token->token_id
        ), OBJECT_K);

        $last4 = $meta['last4']->meta_value ?? '';
        $card_type = $meta['card_type']->meta_value ?? '';
        $exp_month = $meta['expiry_month']->meta_value ?? '';
        $exp_year = $meta['expiry_year']->meta_value ?? '';

        $key = "{$card_type}_{$last4}";

        if (!isset($grouped[$key])) {
            $grouped[$key] = [];
        }

        $grouped[$key][] = [
            'token_id' => $token->token_id,
            'token' => $token->token,
            'is_default' => $token->is_default,
            'last4' => $last4,
            'card_type' => $card_type,
            'exp_month' => $exp_month,
            'exp_year' => $exp_year,
        ];
    }

    // Process each card group
    $total_deleted = 0;
    foreach ($grouped as $key => $cards) {
        if (count($cards) <= 1) {
            echo "<span class='info'>  {$key}: 1 token (no duplicates)</span>\n";
            continue;
        }

        echo "<span class='warning'>  {$key}: " . count($cards) . " tokens (DUPLICATES FOUND)</span>\n";

        // Sort by expiry date (newest first), then by token_id (newest first)
        usort($cards, function($a, $b) {
            // Handle empty or non-numeric expiry dates
            $a_exp = trim($a['exp_year'] . str_pad($a['exp_month'], 2, '0', STR_PAD_LEFT));
            $b_exp = trim($b['exp_year'] . str_pad($b['exp_month'], 2, '0', STR_PAD_LEFT));

            // Convert to integers, default to 0 if empty/invalid
            $a_exp_int = is_numeric($a_exp) ? intval($a_exp) : 0;
            $b_exp_int = is_numeric($b_exp) ? intval($b_exp) : 0;

            $exp_cmp = $b_exp_int - $a_exp_int;
            if ($exp_cmp !== 0) return $exp_cmp;
            return $b['token_id'] - $a['token_id'];
        });

        // Keep the first one (newest/latest)
        $keep = array_shift($cards);
        echo "<span class='success'>    KEEP: Token ID {$keep['token_id']} (expires {$keep['exp_month']}/{$keep['exp_year']})</span>\n";

        // Check if any of the cards to be deleted are currently default
        $deleting_default = false;
        foreach ($cards as $card) {
            if ($card['is_default']) {
                $deleting_default = true;
                break;
            }
        }

        // Delete the rest
        foreach ($cards as $card) {
            echo "<span class='error'>    DELETE: Token ID {$card['token_id']} (expires {$card['exp_month']}/{$card['exp_year']})";
            if ($card['is_default']) {
                echo " [WAS DEFAULT]";
            }
            echo "</span>\n";

            // Delete token metadata
            $wpdb->delete(
                $wpdb->prefix . 'woocommerce_payment_tokenmeta',
                ['payment_token_id' => $card['token_id']],
                ['%d']
            );

            // Delete token
            $wpdb->delete(
                $wpdb->prefix . 'woocommerce_payment_tokens',
                ['token_id' => $card['token_id']],
                ['%d']
            );

            $total_deleted++;
        }

        // Make sure the kept token is set as default if we deleted the default or no token is default
        if (!$keep['is_default'] || $deleting_default) {
            $wpdb->update(
                $wpdb->prefix . 'woocommerce_payment_tokens',
                ['is_default' => 1],
                ['token_id' => $keep['token_id']],
                ['%d'],
                ['%d']
            );
            echo "<span class='success'>    SET AS DEFAULT: Token ID {$keep['token_id']}</span>\n";
        }
    }

    if ($total_deleted > 0) {
        echo "<span class='success'>✓ Deleted {$total_deleted} duplicate tokens for user {$user_id}</span>\n\n";
    } else {
        echo "<span class='info'>No duplicates to delete for user {$user_id}</span>\n\n";
    }
}

<?php
/**
 * Grant Athlete Team Memberships
 *
 * Assigns WooCommerce Memberships to active athlete team subscribers
 * based on their subscription team (Mandala, Momentum, Matrix, Alumni, Recon+)
 */

add_action('wp', function() {
    // Only run when accessing this specific query parameter
    if (!isset($_GET['grant_athlete_memberships'])) {
        return;
    }

    // Security check - only for administrators
    if (!current_user_can('manage_options')) {
        wp_die('Unauthorized access');
    }

    // Increase timeout and disable output buffering for real-time progress
    set_time_limit(300); // 5 minutes
    ini_set('max_execution_time', 300);
    @ini_set('zlib.output_compression', 0);
    @ini_set('implicit_flush', 1);
    if (function_exists('apache_setenv')) {
        @apache_setenv('no-gzip', 1);
    }
    while (ob_get_level() > 0) {
        ob_end_flush();
    }
    ob_implicit_flush(1);

    echo '<html><head><title>Grant Athlete Team Memberships</title>';
    echo '<style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 20px; background: #f5f5f5; }
        h1 { color: #333; }
        .summary { background: white; padding: 20px; margin-bottom: 20px; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .log { background: white; padding: 20px; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); font-family: "Courier New", monospace; font-size: 13px; }
        .success { color: #2D9554; }
        .skip { color: #D4A127; }
        .error { color: #BA4A52; }
        .info { color: #666; }
        pre { margin: 0; line-height: 1.6; }
    </style></head><body>';

    echo '<h1>Grant Athlete Team Memberships</h1>';

    // Check if WooCommerce Memberships is active
    if (!function_exists('wc_memberships_get_membership_plans')) {
        echo '<div class="summary"><p class="error">Error: WooCommerce Memberships plugin is not active.</p></div>';
        echo '</body></html>';
        exit;
    }

    $stats = [
        'total_processed' => 0,
        'granted' => 0,
        'already_has' => 0,
        'errors' => 0,
        'plan_not_found' => [],
    ];

    echo '<div class="log"><pre>';

    // Team to membership plan slug mapping
    $team_plan_map = [
        'mandala' => 'mandala-athlete-team',
        'momentum' => 'momentum-athlete-team',
        'matrix' => 'matrix-athlete-team',
        'alumni' => 'alumni-athlete-team',
        'recon' => 'recon-athlete-team',
    ];

    // Get all membership plans and verify they exist
    echo "<span class='info'>Checking membership plans...</span>\n";
    flush();
    $available_plans = [];
    foreach ($team_plan_map as $team_key => $plan_slug) {
        $query = new WP_Query([
            'post_type' => 'wc_membership_plan',
            'name' => $plan_slug,
            'post_status' => 'publish',
            'posts_per_page' => 1,
        ]);

        if ($query->have_posts()) {
            $plan = $query->posts[0];
            $available_plans[$team_key] = $plan->ID;
            echo "<span class='success'>✓ Found plan: {$plan->post_title} (ID: {$plan->ID})</span>\n";
        } else {
            echo "<span class='error'>✗ Plan not found: {$plan_slug}</span>\n";
        }
    }
    echo "\n";

    // Get ALL active subscriptions
    echo "<span class='info'>Fetching active subscriptions...</span>\n\n";
    $all_subscriptions = wcs_get_subscriptions([
        'subscriptions_per_page' => -1,
        'subscription_status' => 'active',
    ]);

    $processed_users = []; // Track users to avoid duplicates

    // Process each subscription
    foreach ($all_subscriptions as $subscription) {
        $user_id = $subscription->get_user_id();
        $user = get_user_by('id', $user_id);

        if (!$user) {
            continue;
        }

        // Get subscription product name
        $items = $subscription->get_items();
        $product_name = '';
        foreach ($items as $item) {
            $product_name = $item->get_name();
            break;
        }

        $product_lower = strtolower($product_name);

        // Determine team based on product name
        $team_key = '';
        $team_name = '';

        if (strpos($product_lower, 'mandala') !== false) {
            $team_key = 'mandala';
            $team_name = 'Mandala';
        } elseif (strpos($product_lower, 'momentum') !== false) {
            $team_key = 'momentum';
            $team_name = 'Momentum';
        } elseif (strpos($product_lower, 'matrix') !== false) {
            $team_key = 'matrix';
            $team_name = 'Matrix';
        } elseif (strpos($product_lower, 'recon') !== false) {
            $team_key = 'recon';
            $team_name = 'Recon+';
        } elseif (strpos($product_lower, 'alumni') !== false) {
            $team_key = 'alumni';
            $team_name = 'Alumni';
        } else {
            // Not an athlete team subscription
            continue;
        }

        // Skip if user already processed
        if (isset($processed_users[$user_id])) {
            continue;
        }
        $processed_users[$user_id] = true;

        $stats['total_processed']++;

        // Check if membership plan exists
        if (!isset($available_plans[$team_key])) {
            echo "<span class='error'>ERROR: User #{$user_id} ({$user->user_email}) - {$team_name} plan not found</span>\n";
            $stats['errors']++;
            if (!isset($stats['plan_not_found'][$team_name])) {
                $stats['plan_not_found'][$team_name] = 0;
            }
            $stats['plan_not_found'][$team_name]++;
            continue;
        }

        $plan_id = $available_plans[$team_key];

        // Check if user already has this membership
        $existing_membership = wc_memberships_get_user_membership($user_id, $plan_id);

        if ($existing_membership && in_array($existing_membership->get_status(), ['active', 'complimentary', 'pending'])) {
            echo "<span class='skip'>SKIP: User #{$user_id} ({$user->user_email}) already has {$team_name} membership</span>\n";
            $stats['already_has']++;
            continue;
        }

        // Grant membership
        try {
            $membership = wc_memberships_create_user_membership([
                'plan_id' => $plan_id,
                'user_id' => $user_id,
            ]);

            if ($membership) {
                echo "<span class='success'>✓ GRANTED: User #{$user_id} ({$user->user_email}) → {$team_name} Athlete Team</span>\n";
                $stats['granted']++;
            } else {
                echo "<span class='error'>ERROR: Failed to grant {$team_name} to User #{$user_id} ({$user->user_email})</span>\n";
                $stats['errors']++;
            }
        } catch (Exception $e) {
            echo "<span class='error'>ERROR: User #{$user_id} ({$user->user_email}) - {$e->getMessage()}</span>\n";
            $stats['errors']++;
        }
    }

    echo "\n<span class='info'>========================================</span>\n";
    echo "<span class='info'>SUMMARY</span>\n";
    echo "<span class='info'>========================================</span>\n";
    echo "<span class='info'>Total processed: {$stats['total_processed']}</span>\n";
    echo "<span class='success'>Memberships granted: {$stats['granted']}</span>\n";
    echo "<span class='skip'>Already had membership: {$stats['already_has']}</span>\n";
    echo "<span class='error'>Errors: {$stats['errors']}</span>\n";

    if (!empty($stats['plan_not_found'])) {
        echo "\n<span class='error'>Plans not found:</span>\n";
        foreach ($stats['plan_not_found'] as $team => $count) {
            echo "<span class='error'>  {$team}: {$count} users</span>\n";
        }
    }

    echo '</pre></div>';
    echo '</body></html>';
    exit;
});

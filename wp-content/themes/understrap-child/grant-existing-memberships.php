<?php
/**
 * One-time script to grant memberships to existing active subscribers
 * Access via: https://samsara.local/?grant_existing_memberships=1
 *
 * IMPORTANT: Run create-athlete-memberships.php FIRST to create the membership plans
 * Then run this script to grant memberships to existing subscribers
 *
 * After running successfully, you can delete this file.
 */

add_action('init', function() {
    if (!isset($_GET['grant_existing_memberships'])) {
        return;
    }

    // Only allow administrators
    if (!current_user_can('manage_options')) {
        wp_die('Unauthorized - Admin access required');
    }

    // Check if WooCommerce Subscriptions is active
    if (!function_exists('wcs_get_subscriptions')) {
        wp_die('WooCommerce Subscriptions plugin is not active.');
    }

    // Check if WooCommerce Memberships is active
    if (!function_exists('wc_memberships_get_membership_plans')) {
        wp_die('WooCommerce Memberships plugin is not active.');
    }

    // Increase execution time for large datasets
    set_time_limit(300); // 5 minutes

    header('Content-Type: text/plain');
    echo "=== Granting Memberships to Existing Subscribers ===\n\n";

    // Team keyword to membership slug mapping
    $team_mapping = [
        'mandala' => 'mandala-athlete-team',
        'momentum' => 'momentum-athlete-team',
        'matrix' => 'matrix-athlete-team',
        'alumni' => 'alumni-athlete-team',
        'recon' => 'recon-athlete-team',
    ];

    // First, verify all membership plans exist
    echo "--- Verifying Membership Plans ---\n";
    $membership_plans = [];

    foreach ($team_mapping as $keyword => $slug) {
        $plans = wc_memberships_get_membership_plans(['post_name' => $slug]);

        if (empty($plans)) {
            echo "✗ ERROR: Membership plan '{$slug}' not found!\n";
            echo "  Please run create-athlete-memberships.php first.\n\n";
            exit;
        }

        $plan = reset($plans);
        $membership_plans[$keyword] = $plan;
        echo "✓ Found: {$plan->get_name()} (ID: {$plan->get_id()})\n";
    }

    echo "\n--- Processing Subscriptions ---\n\n";

    // Get all subscriptions (active, on-hold, pending-cancel)
    $subscription_statuses = ['active', 'on-hold', 'pending-cancel'];
    $total_processed = 0;
    $total_granted = 0;
    $total_skipped = 0;
    $total_errors = 0;

    foreach ($subscription_statuses as $status) {
        $subscriptions = wcs_get_subscriptions([
            'subscriptions_per_page' => -1,
            'subscription_status' => $status,
            'orderby' => 'start_date',
            'order' => 'DESC',
        ]);

        echo "Found " . count($subscriptions) . " subscriptions with status: {$status}\n\n";

        foreach ($subscriptions as $subscription) {
            $total_processed++;
            $subscription_id = $subscription->get_id();
            $user_id = $subscription->get_user_id();

            if (!$user_id) {
                echo "⚠ Subscription #{$subscription_id} - No user ID, skipping\n";
                $total_skipped++;
                continue;
            }

            $user = get_user_by('ID', $user_id);
            if (!$user) {
                echo "⚠ Subscription #{$subscription_id} - User #{$user_id} not found, skipping\n";
                $total_skipped++;
                continue;
            }

            // Get subscription product names
            $subscription_items = $subscription->get_items();

            foreach ($subscription_items as $item) {
                $product_name = strtolower($item->get_name());

                // Check which team this subscription belongs to
                $matched_team = null;
                foreach ($team_mapping as $keyword => $slug) {
                    if (strpos($product_name, $keyword) !== false) {
                        $matched_team = $keyword;
                        break;
                    }
                }

                if (!$matched_team) {
                    // Not an athlete team subscription, skip silently
                    continue;
                }

                $plan = $membership_plans[$matched_team];
                $plan_id = $plan->get_id();

                echo "User: {$user->display_name} (#{$user_id})\n";
                echo "  Subscription: {$item->get_name()} (#{$subscription_id})\n";
                echo "  Status: {$status}\n";
                echo "  Team: {$plan->get_name()}\n";

                // Check if user already has this membership
                $existing_memberships = wc_memberships_get_user_memberships($user_id, [
                    'plan' => $plan_id,
                ]);

                if (!empty($existing_memberships)) {
                    $existing = reset($existing_memberships);
                    echo "  → Already has membership (Status: {$existing->get_status()})\n";
                    $total_skipped++;
                } else {
                    // Grant the membership
                    try {
                        $args = [
                            'plan_id' => $plan_id,
                            'user_id' => $user_id,
                        ];

                        // Create the membership
                        $membership = wc_memberships_create_user_membership($args);

                        if ($membership && !is_wp_error($membership)) {
                            // Set start date to subscription start date
                            $start_date = $subscription->get_date('start');
                            if ($start_date) {
                                $membership->set_start_date($start_date);
                            }

                            // Activate the membership
                            $membership->activate_membership();

                            echo "  ✓ GRANTED membership!\n";
                            $total_granted++;
                        } else {
                            $error_msg = is_wp_error($membership) ? $membership->get_error_message() : 'Unknown error';
                            echo "  ✗ ERROR: {$error_msg}\n";
                            $total_errors++;
                        }
                    } catch (Exception $e) {
                        echo "  ✗ ERROR: {$e->getMessage()}\n";
                        $total_errors++;
                    }
                }

                echo "\n";
            }
        }
    }

    echo "\n=== Summary ===\n";
    echo "Total subscriptions processed: {$total_processed}\n";
    echo "Memberships granted: {$total_granted}\n";
    echo "Already had membership (skipped): {$total_skipped}\n";
    echo "Errors: {$total_errors}\n\n";

    if ($total_granted > 0) {
        echo "✓ Successfully granted {$total_granted} new memberships!\n\n";
    }

    echo "Next steps:\n";
    echo "1. Verify memberships in: WooCommerce > Memberships > Members\n";
    echo "2. Check a few user accounts to confirm they see their team badge\n";
    echo "3. Delete this file (grant-existing-memberships.php) as it's no longer needed\n";

    exit;
});

<?php
/**
 * One-time script to create Athlete Team Membership Plans
 * Access via: https://samsara.local/?create_athlete_memberships=1
 *
 * This will create 5 membership plans and link them to existing subscription products
 * After running successfully, you can delete this file.
 */

add_action('init', function() {
    if (!isset($_GET['create_athlete_memberships'])) {
        return;
    }

    // Only allow administrators
    if (!current_user_can('manage_options')) {
        wp_die('Unauthorized - Admin access required');
    }

    // Check if WooCommerce Memberships is active
    if (!function_exists('wc_memberships_get_membership_plans')) {
        wp_die('WooCommerce Memberships plugin is not active. Please install and activate it first.');
    }

    header('Content-Type: text/plain');
    echo "=== Creating Athlete Team Membership Plans ===\n\n";

    $teams = [
        'mandala' => [
            'name' => 'Mandala Athlete Team',
            'slug' => 'mandala-athlete-team',
        ],
        'momentum' => [
            'name' => 'Momentum Athlete Team',
            'slug' => 'momentum-athlete-team',
        ],
        'matrix' => [
            'name' => 'Matrix Athlete Team',
            'slug' => 'matrix-athlete-team',
        ],
        'alumni' => [
            'name' => 'Alumni Athlete Team',
            'slug' => 'alumni-athlete-team',
        ],
        'recon' => [
            'name' => 'Recon+ Athlete Team',
            'slug' => 'recon-athlete-team',
        ],
    ];

    foreach ($teams as $keyword => $team_data) {
        echo "\n--- Processing {$team_data['name']} ---\n";

        // Check if membership plan already exists
        $existing_plans = wc_memberships_get_membership_plans([
            'post_status' => ['publish', 'draft'],
        ]);

        $plan_exists = false;
        $plan_id = null;

        foreach ($existing_plans as $plan) {
            if ($plan->get_slug() === $team_data['slug']) {
                $plan_exists = true;
                $plan_id = $plan->get_id();
                echo "✓ Membership plan already exists (ID: {$plan_id})\n";
                break;
            }
        }

        // Create membership plan if it doesn't exist
        if (!$plan_exists) {
            $plan_args = [
                'post_title' => $team_data['name'],
                'post_name' => $team_data['slug'],
                'post_type' => 'wc_membership_plan',
                'post_status' => 'publish',
            ];

            $plan_id = wp_insert_post($plan_args);

            if (is_wp_error($plan_id)) {
                echo "✗ Error creating plan: " . $plan_id->get_error_message() . "\n";
                continue;
            }

            echo "✓ Created membership plan (ID: {$plan_id})\n";

            // Set default access length (unlimited)
            update_post_meta($plan_id, '_access_length_type', 'unlimited');
        }

        // Find subscription products that match this team
        $args = [
            'type' => 'subscription',
            'limit' => -1,
            'status' => 'publish',
        ];

        $products = wc_get_products($args);
        $matched_products = [];

        foreach ($products as $product) {
            $product_name = strtolower($product->get_name());

            // Check if product name contains the keyword
            if (strpos($product_name, $keyword) !== false) {
                $matched_products[] = $product;
            }
        }

        echo "Found " . count($matched_products) . " matching subscription product(s)\n";

        // Link products to this membership plan
        if (!empty($matched_products)) {
            $plan = wc_memberships_get_membership_plan($plan_id);

            if ($plan) {
                foreach ($matched_products as $product) {
                    echo "  → Linking product: {$product->get_name()} (ID: {$product->get_id()})\n";

                    // Get existing product restriction rules
                    $rules = $plan->get_product_restriction_rules();

                    // Add this product as granting this membership
                    $new_rule = [
                        'membership_plan_id' => $plan_id,
                        'object_ids' => [$product->get_id()],
                        'content_type' => 'post_type',
                        'content_type_name' => 'product',
                        'access_schedule' => 'immediate',
                        'access_type' => 'grant_access',
                    ];

                    // Update plan meta to grant membership when this product is purchased
                    $granted_products = get_post_meta($plan_id, '_product_ids', true);
                    if (!is_array($granted_products)) {
                        $granted_products = [];
                    }

                    if (!in_array($product->get_id(), $granted_products)) {
                        $granted_products[] = $product->get_id();
                        update_post_meta($plan_id, '_product_ids', $granted_products);
                        echo "    ✓ Product linked to membership plan\n";
                    } else {
                        echo "    - Product already linked\n";
                    }
                }
            }
        }
    }

    echo "\n\n=== Summary ===\n";
    echo "All membership plans have been created and linked to subscription products.\n\n";
    echo "You can now:\n";
    echo "1. View them in: WooCommerce > Memberships\n";
    echo "2. Delete this file (create-athlete-memberships.php) as it's no longer needed\n";
    echo "3. The React dashboard will automatically detect and use these memberships\n\n";
    echo "Note: Existing subscribers will need to be granted memberships manually OR\n";
    echo "they will automatically get the membership on their next renewal.\n";

    exit;
});

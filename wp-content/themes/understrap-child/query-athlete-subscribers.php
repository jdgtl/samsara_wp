<?php
/**
 * Query Active Athlete Team Subscribers
 *
 * Displays list of users with active subscriptions for:
 * Mandala, Momentum, Matrix, Recon, Alumni
 */

add_action('wp', function() {
    // Only run when accessing this specific query parameter
    if (!isset($_GET['query_athlete_subscribers'])) {
        return;
    }

    // Security check - only for administrators
    if (!current_user_can('manage_options')) {
        wp_die('Unauthorized access');
    }

    echo '<html><head><title>Athlete Team Subscribers</title>';
    echo '<style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 20px; background: #f5f5f5; }
        h1 { color: #333; }
        table { width: 100%; border-collapse: collapse; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        th { background: #2D9554; color: white; padding: 12px; text-align: left; font-weight: 600; }
        td { padding: 12px; border-bottom: 1px solid #eee; }
        tr:hover { background: #f9f9f9; }
        .mandala { color: #2D9554; font-weight: 600; }
        .momentum { color: #D4A127; font-weight: 600; }
        .matrix { color: #BA4A52; font-weight: 600; }
        .alumni { color: #0C000A; font-weight: 600; }
        .recon { color: #0C000A; font-weight: 600; }
        .summary { background: white; padding: 20px; margin-bottom: 20px; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .summary h2 { margin-top: 0; color: #333; }
        .stat { display: inline-block; margin-right: 30px; }
        .stat-number { font-size: 32px; font-weight: bold; color: #2D9554; }
        .stat-label { font-size: 14px; color: #666; text-transform: uppercase; }
    </style></head><body>';

    echo '<h1>Active Athlete Team Subscribers</h1>';

    $all_results = [];
    $team_counts = [];

    // Get ALL active subscriptions first
    $all_subscriptions = wcs_get_subscriptions([
        'subscriptions_per_page' => -1,
        'subscription_status' => 'active',
    ]);

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

        // Determine team based on product name - must contain one of the team keywords
        $team = '';
        $team_class = '';

        if (strpos($product_lower, 'mandala') !== false) {
            $team = 'Mandala';
            $team_class = 'mandala';
        } elseif (strpos($product_lower, 'momentum') !== false) {
            $team = 'Momentum';
            $team_class = 'momentum';
        } elseif (strpos($product_lower, 'matrix') !== false) {
            $team = 'Matrix';
            $team_class = 'matrix';
        } elseif (strpos($product_lower, 'recon') !== false) {
            $team = 'Recon+';
            $team_class = 'recon';
        } elseif (strpos($product_lower, 'alumni') !== false) {
            $team = 'Alumni';
            $team_class = 'alumni';
        } else {
            // If it doesn't match any team keyword, skip it
            continue;
        }

        // Count by team
        if (!isset($team_counts[$team])) {
            $team_counts[$team] = 0;
        }
        $team_counts[$team]++;

        $all_results[] = [
            'user_id' => $user_id,
            'email' => $user->user_email,
            'first_name' => $user->first_name ?: '—',
            'last_name' => $user->last_name ?: '—',
            'subscription' => $product_name,
            'team' => $team,
            'team_class' => $team_class,
            'subscription_id' => $subscription->get_id(),
        ];
    }

    // Remove duplicates (users with multiple subscriptions)
    $unique_results = [];
    foreach ($all_results as $result) {
        $unique_results[$result['user_id']] = $result;
    }
    $all_results = array_values($unique_results);

    // Sort by team, then by last name
    usort($all_results, function($a, $b) {
        $team_order = ['Mandala' => 1, 'Momentum' => 2, 'Matrix' => 3, 'Alumni' => 4, 'Recon+' => 5];
        $team_cmp = ($team_order[$a['team']] ?? 99) - ($team_order[$b['team']] ?? 99);
        if ($team_cmp !== 0) return $team_cmp;
        return strcmp($a['last_name'], $b['last_name']);
    });

    // Display summary
    echo '<div class="summary">';
    echo '<h2>Summary</h2>';
    echo '<div class="stat"><div class="stat-number">' . count($all_results) . '</div><div class="stat-label">Total Active Members</div></div>';
    foreach ($team_counts as $team => $count) {
        echo '<div class="stat"><div class="stat-number">' . $count . '</div><div class="stat-label">' . $team . '</div></div>';
    }
    echo '</div>';

    // Display results table
    echo '<table>';
    echo '<thead><tr>';
    echo '<th>User ID</th>';
    echo '<th>First Name</th>';
    echo '<th>Last Name</th>';
    echo '<th>Email</th>';
    echo '<th>Team</th>';
    echo '<th>Subscription</th>';
    echo '<th>Sub ID</th>';
    echo '</tr></thead>';
    echo '<tbody>';

    foreach ($all_results as $result) {
        echo '<tr>';
        echo '<td>' . $result['user_id'] . '</td>';
        echo '<td>' . esc_html($result['first_name']) . '</td>';
        echo '<td>' . esc_html($result['last_name']) . '</td>';
        echo '<td>' . esc_html($result['email']) . '</td>';
        echo '<td class="' . $result['team_class'] . '">' . esc_html($result['team']) . '</td>';
        echo '<td>' . esc_html($result['subscription']) . '</td>';
        echo '<td>' . $result['subscription_id'] . '</td>';
        echo '</tr>';
    }

    echo '</tbody></table>';

    echo '</body></html>';
    exit;
});

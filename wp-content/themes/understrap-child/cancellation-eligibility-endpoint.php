<?php
/**
 * Get Cancellation Eligibility for a Subscription
 * REST API endpoint for customer dashboard
 */

function samsara_get_cancellation_eligibility($request) {
    $subscription_id = $request['id'];

    if (!function_exists('wcs_get_subscription')) {
        return new WP_Error('subscriptions_not_available', 'WooCommerce Subscriptions not active', array('status' => 500));
    }

    $subscription = wcs_get_subscription($subscription_id);

    if (!$subscription) {
        return new WP_Error('subscription_not_found', 'Subscription not found', array('status' => 404));
    }

    // Verify user owns this subscription
    $user_id = get_current_user_id();
    if ($subscription->get_user_id() != $user_id && !current_user_can('manage_woocommerce')) {
        return new WP_Error('forbidden', 'You do not have permission to access this subscription', array('status' => 403));
    }

    // Get subscription data
    $payment_count = $subscription->get_payment_count();
    $start_date = $subscription->get_date('start');
    $next_payment = $subscription->get_date('next_payment');
    $status = $subscription->get_status();
    $product_id = 0;
    $variation_id = 0;

    // Get product info
    $items = $subscription->get_items();
    foreach ($items as $item) {
        $product_id = $item->get_product_id();
        $variation_id = $item->get_variation_id();
        break;
    }

    // Get cancellation rules from subscription or product
    $minimum_period = get_post_meta($subscription_id, '_ccp_minimum_period', true);
    $cooling_off_period = get_post_meta($subscription_id, '_ccp_cooling_off_period', true);
    $rolling_cycle = get_post_meta($subscription_id, '_ccp_rolling_cycle', true);
    $disable_cancellation_days = get_post_meta($subscription_id, '_ccp_disable_cancellation_x_days', true);

    // Get product-level rules if subscription rules don't exist
    $check_product_id = $variation_id > 0 ? $variation_id : $product_id;
    if (empty($minimum_period) && $check_product_id > 0) {
        $product = wc_get_product($check_product_id);
        if ($product) {
            $parent_id = $product->get_parent_id();
            if ($parent_id > 0) {
                $minimum_period = get_post_meta($parent_id, '_ccp_minimum_period', true);
                $cooling_off_period = get_post_meta($parent_id, '_ccp_cooling_off_period', true);
                $rolling_cycle = get_post_meta($parent_id, '_ccp_rolling_cycle', true);
                $disable_cancellation_days = get_post_meta($parent_id, '_ccp_disable_cancellation_x_days', true);
            } else {
                $minimum_period = get_post_meta($check_product_id, '_ccp_minimum_period', true);
                $cooling_off_period = get_post_meta($check_product_id, '_ccp_cooling_off_period', true);
                $rolling_cycle = get_post_meta($check_product_id, '_ccp_rolling_cycle', true);
                $disable_cancellation_days = get_post_meta($check_product_id, '_ccp_disable_cancellation_x_days', true);
            }
        }
    }

    // Calculate cancellation eligibility
    $cancelable = true;
    $cancel_reasons = array();
    $cancel_available_start = null;
    $cancel_available_end = null;

    // Check cooling-off period
    if (!empty($cooling_off_period) && $cooling_off_period > 0 && $start_date) {
        $start_timestamp = strtotime($start_date);
        $cooling_off_end = strtotime("+{$cooling_off_period} days", $start_timestamp);
        if (time() < $cooling_off_end) {
            $cancelable = false;
            $days_remaining = ceil(($cooling_off_end - time()) / 86400);
            $cancel_reasons[] = "Cooling-off period: {$days_remaining} days remaining";
            $cancel_available_start = date('m/d/Y', $cooling_off_end);
        }
    }

    // Check minimum period and calculate cancellation window
    if (!empty($minimum_period) && $minimum_period > 0) {
        if ($payment_count < $minimum_period) {
            $cancelable = false;
            $remaining_periods = $minimum_period - $payment_count;
            $cancel_reasons[] = "Minimum period not met: {$payment_count} of {$minimum_period} payments completed";

            // Calculate when minimum period will be met
            if ($next_payment && $remaining_periods > 0) {
                $next_payment_timestamp = strtotime($next_payment);
                $billing_period = $subscription->get_billing_period();
                $billing_interval = $subscription->get_billing_interval();

                // The next_payment date is when the NEXT payment will be made
                // If we need 2 more payments, the next payment is #1, so we need 1 more after that
                // Therefore we add (remaining_periods - 1) to next_payment_timestamp
                $periods_needed = $remaining_periods - 1;

                if ($billing_period === 'month') {
                    $cancel_available_start = date('m/d/Y', strtotime("+{$periods_needed} months", $next_payment_timestamp));
                } elseif ($billing_period === 'year') {
                    $cancel_available_start = date('m/d/Y', strtotime("+{$periods_needed} years", $next_payment_timestamp));
                } elseif ($billing_period === 'week') {
                    $weeks = $periods_needed * $billing_interval;
                    $cancel_available_start = date('m/d/Y', strtotime("+{$weeks} weeks", $next_payment_timestamp));
                } elseif ($billing_period === 'day') {
                    $days = $periods_needed * $billing_interval;
                    $cancel_available_start = date('m/d/Y', strtotime("+{$days} days", $next_payment_timestamp));
                }
            }
        }

        // Calculate cancellation window end (if rolling cycle)
        if (!empty($rolling_cycle) && $rolling_cycle > 0 && $cancel_available_start) {
            $current_position_in_cycle = $payment_count % $rolling_cycle;
            if ($current_position_in_cycle === 0) {
                $current_position_in_cycle = $rolling_cycle;
            }

            $periods_until_reset = $rolling_cycle - $minimum_period;

            // If rolling cycle equals minimum period, window closes at next payment (1 period)
            // If rolling cycle > minimum period, window closes when cycle resets
            if ($rolling_cycle == $minimum_period) {
                // Window closes at the next payment after minimum is met
                $start_timestamp = strtotime($cancel_available_start);
                $billing_period = $subscription->get_billing_period();
                $billing_interval = $subscription->get_billing_interval();

                if ($billing_period === 'month') {
                    $cancel_available_end = date('m/d/Y', strtotime("+1 month", $start_timestamp));
                } elseif ($billing_period === 'year') {
                    $cancel_available_end = date('m/d/Y', strtotime("+1 year", $start_timestamp));
                } elseif ($billing_period === 'week') {
                    $cancel_available_end = date('m/d/Y', strtotime("+{$billing_interval} weeks", $start_timestamp));
                } elseif ($billing_period === 'day') {
                    $cancel_available_end = date('m/d/Y', strtotime("+{$billing_interval} days", $start_timestamp));
                }

                $cancel_reasons[] = "Cancellation window closes on {$cancel_available_end} (rolling cycle resets immediately)";
            } elseif ($periods_until_reset > 0) {
                // Window extends for the difference between rolling cycle and minimum period
                $start_timestamp = strtotime($cancel_available_start);
                $billing_period = $subscription->get_billing_period();
                $billing_interval = $subscription->get_billing_interval();

                if ($billing_period === 'month') {
                    $cancel_available_end = date('m/d/Y', strtotime("+{$periods_until_reset} months", $start_timestamp));
                } elseif ($billing_period === 'year') {
                    $cancel_available_end = date('m/d/Y', strtotime("+{$periods_until_reset} years", $start_timestamp));
                } elseif ($billing_period === 'week') {
                    $weeks = $periods_until_reset * $billing_interval;
                    $cancel_available_end = date('m/d/Y', strtotime("+{$weeks} weeks", $start_timestamp));
                } elseif ($billing_period === 'day') {
                    $days = $periods_until_reset * $billing_interval;
                    $cancel_available_end = date('m/d/Y', strtotime("+{$days} days", $start_timestamp));
                }

                $cancel_reasons[] = "Cancellation window closes on {$cancel_available_end} (rolling cycle resets)";
            }
        }
    }

    // Build response
    $response = array(
        'cancelable' => $cancelable,
        'reasons' => $cancel_reasons,
        'window' => array(
            'start' => $cancel_available_start,
            'end' => $cancel_available_end,
        ),
        'rules' => array(
            'minimum_period' => $minimum_period ?: 0,
            'cooling_off_period' => $cooling_off_period ?: 0,
            'rolling_cycle' => $rolling_cycle ?: 0,
        ),
        'current' => array(
            'payment_count' => $payment_count,
            'status' => $status,
        ),
    );

    return new WP_REST_Response($response, 200);
}

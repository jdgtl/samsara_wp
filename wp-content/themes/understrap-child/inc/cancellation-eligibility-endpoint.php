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
        error_log('DEBUG: Line item product_id=' . $product_id . ', variation_id=' . $variation_id);
        break;
    }

    // Check which product ID we'll actually use
    $check_product_id = $variation_id > 0 ? $variation_id : $product_id;
    error_log('DEBUG: Using product ID for meta lookup: ' . $check_product_id);

    // Check if there's a parent product
    if ($check_product_id > 0) {
        $product = wc_get_product($check_product_id);
        if ($product && $product->get_parent_id() > 0) {
            error_log('DEBUG: Product has parent ID: ' . $product->get_parent_id());
        }
    }

    // DEBUG: Get all meta fields to find the correct key names
    $all_sub_meta = get_post_meta($subscription_id);
    $all_product_meta = $check_product_id > 0 ? get_post_meta($check_product_id) : array();
    error_log('=== DEBUG: All Subscription Meta Keys ===');
    foreach ($all_sub_meta as $key => $value) {
        if (strpos($key, 'ccp') !== false || strpos($key, 'cancel') !== false || strpos($key, 'window') !== false) {
            error_log('  Subscription ' . $key . ': ' . print_r($value, true));
        }
    }
    error_log('=== DEBUG: ALL Product Meta Keys (Product ID: ' . $check_product_id . ') ===');
    foreach ($all_product_meta as $key => $value) {
        // Log ALL keys to see everything
        error_log('  Product ' . $key . ': ' . print_r($value, true));
    }

    // Also check product 14894 if it's different
    if ($check_product_id != 14894) {
        error_log('=== DEBUG: Checking Product 14894 (User-specified ID) ===');
        $product_14894_meta = get_post_meta(14894);
        foreach ($product_14894_meta as $key => $value) {
            if (strpos($key, 'ccp') !== false || strpos($key, 'cancel') !== false || strpos($key, 'window') !== false) {
                error_log('  Product 14894 ' . $key . ': ' . print_r($value, true));
            }
        }
    }

    // Get cancellation rules from subscription or product
    $minimum_period = get_post_meta($subscription_id, '_ccp_minimum_period', true);
    $cooling_off_period = get_post_meta($subscription_id, '_ccp_cooling_off_period', true);
    $rolling_cycle = get_post_meta($subscription_id, '_ccp_rolling_cycle', true);
    $cancellation_window_start = get_post_meta($subscription_id, '_ccp_cancellation_window_start', true);
    $cancellation_window_end = get_post_meta($subscription_id, '_ccp_cancellation_window_end', true);
    $cancellation_window_period = get_post_meta($subscription_id, '_ccp_cancellation_window_period', true);

    // Get product-level rules if subscription rules don't exist
    $check_product_id = $variation_id > 0 ? $variation_id : $product_id;
    if (empty($minimum_period) && empty($cancellation_window_start) && $check_product_id > 0) {
        $product = wc_get_product($check_product_id);
        if ($product) {
            $parent_id = $product->get_parent_id();
            if ($parent_id > 0) {
                $minimum_period = get_post_meta($parent_id, '_ccp_minimum_period', true);
                $cooling_off_period = get_post_meta($parent_id, '_ccp_cooling_off_period', true);
                $rolling_cycle = get_post_meta($parent_id, '_ccp_rolling_cycle', true);
                $cancellation_window_start = get_post_meta($parent_id, '_ccp_cancellation_window_start', true);
                $cancellation_window_end = get_post_meta($parent_id, '_ccp_cancellation_window_end', true);
                $cancellation_window_period = get_post_meta($parent_id, '_ccp_cancellation_window_period', true);
            } else {
                $minimum_period = get_post_meta($check_product_id, '_ccp_minimum_period', true);
                $cooling_off_period = get_post_meta($check_product_id, '_ccp_cooling_off_period', true);
                $rolling_cycle = get_post_meta($check_product_id, '_ccp_rolling_cycle', true);
                $cancellation_window_start = get_post_meta($check_product_id, '_ccp_cancellation_window_start', true);
                $cancellation_window_end = get_post_meta($check_product_id, '_ccp_cancellation_window_end', true);
                $cancellation_window_period = get_post_meta($check_product_id, '_ccp_cancellation_window_period', true);
            }
        }
    }

    // Convert cancellation window to days (for time-based restrictions)
    $disable_cancellation_days = 0;
    if (!empty($cancellation_window_start) && is_numeric($cancellation_window_start)) {
        // Convert to days based on period (day, week, month, year)
        $period = !empty($cancellation_window_period) ? $cancellation_window_period : 'day';
        switch ($period) {
            case 'day':
                $disable_cancellation_days = intval($cancellation_window_start);
                break;
            case 'week':
                $disable_cancellation_days = intval($cancellation_window_start) * 7;
                break;
            case 'month':
                $disable_cancellation_days = intval($cancellation_window_start) * 30; // Approximate
                break;
            case 'year':
                $disable_cancellation_days = intval($cancellation_window_start) * 365;
                break;
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

    // Check time-based cancellation window using Custom Cancellation Rules plugin logic
    // This matches the plugin's ccp_check_window_period() function
    if (!empty($cancellation_window_action) && !empty($cancellation_window_start)) {
        // Get last payment date (plugin uses this, not start date!)
        $last_payment = $subscription->get_date('last_order_date_created');
        $last_payment_timestamp = strtotime($last_payment);

        // Calculate window start date
        $period = !empty($cancellation_window_period) ? $cancellation_window_period : 'day';
        $window_start_date = strtotime("+{$cancellation_window_start} {$period}", $last_payment_timestamp);

        // Calculate window end date if set
        $window_end_date = null;
        if (!empty($cancellation_window_end)) {
            $window_end_date = strtotime("+{$cancellation_window_end} {$period}", $last_payment_timestamp);
        }

        $now = time();
        $in_window = true;

        // Check if we're outside the window
        if ($now < $window_start_date || ($window_end_date && $now > $window_end_date)) {
            $in_window = false;
        }

        // Apply action logic (enable = allow during window, disable = block during window)
        if (($cancellation_window_action === 'enable' && !$in_window) ||
            ($cancellation_window_action === 'disable' && $in_window)) {
            $cancelable = false;

            if ($now < $window_start_date) {
                $days_remaining = ceil(($window_start_date - $now) / 86400);
                $cancel_reasons[] = "Cancellation not available for {$days_remaining} more days";
                $cancel_available_start = date('m/d/Y', $window_start_date);
            } elseif ($window_end_date && $now > $window_end_date) {
                $cancel_reasons[] = "Cancellation window has closed";
            }
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

                $payment_based_start = null;
                if ($billing_period === 'month') {
                    $payment_based_start = date('m/d/Y', strtotime("+{$periods_needed} months", $next_payment_timestamp));
                } elseif ($billing_period === 'year') {
                    $payment_based_start = date('m/d/Y', strtotime("+{$periods_needed} years", $next_payment_timestamp));
                } elseif ($billing_period === 'week') {
                    $weeks = $periods_needed * $billing_interval;
                    $payment_based_start = date('m/d/Y', strtotime("+{$weeks} weeks", $next_payment_timestamp));
                } elseif ($billing_period === 'day') {
                    $days = $periods_needed * $billing_interval;
                    $payment_based_start = date('m/d/Y', strtotime("+{$days} days", $next_payment_timestamp));
                }

                // If both time-based and payment-based rules exist, use the later date (strictest rule)
                if ($payment_based_start) {
                    if (!$cancel_available_start) {
                        $cancel_available_start = $payment_based_start;
                    } else {
                        // Compare dates and use the later one
                        $time_based_timestamp = strtotime($cancel_available_start);
                        $payment_based_timestamp = strtotime($payment_based_start);
                        if ($payment_based_timestamp > $time_based_timestamp) {
                            $cancel_available_start = $payment_based_start;
                        }
                    }
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
            'disable_cancellation_days' => $disable_cancellation_days ?: 0,
        ),
        'current' => array(
            'payment_count' => $payment_count,
            'status' => $status,
            'start_date' => $start_date,
        ),
        'debug' => array(
            'product_id' => $product_id,
            'variation_id' => $variation_id,
            'check_product_id' => $check_product_id,
        ),
    );

    // Log for debugging
    error_log('Cancellation Eligibility Debug - Subscription ' . $subscription_id);
    error_log('  cancellation_window_action: ' . ($cancellation_window_action ?: 'NOT SET'));
    error_log('  cancellation_window_start: ' . ($cancellation_window_start ?: 'NOT SET'));
    error_log('  cancellation_window_period: ' . ($cancellation_window_period ?: 'NOT SET'));
    error_log('  minimum_period: ' . ($minimum_period ?: 'not set'));
    error_log('  payment_count: ' . $payment_count);
    error_log('  start_date: ' . $start_date);
    error_log('  cancelable: ' . ($cancelable ? 'true' : 'false'));
    error_log('  reasons: ' . json_encode($cancel_reasons));

    return new WP_REST_Response($response, 200);
}

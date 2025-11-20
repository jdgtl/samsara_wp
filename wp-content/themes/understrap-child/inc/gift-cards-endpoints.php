<?php
/**
 * Gift Cards REST API Endpoints
 * Custom endpoints for WooCommerce Gift Cards plugin integration
 */

/**
 * Get all gift cards for the current user
 * Returns both purchased and received gift cards in separate arrays
 */
function samsara_get_user_gift_cards($request) {
    $user_id = get_current_user_id();
    $user = wp_get_current_user();
    $user_email = $user->user_email;

    error_log('🎁 Gift Cards API called for user ' . $user_id . ' (' . $user_email . ')');

    if (!$user_email) {
        error_log('❌ No user email found');
        return new WP_Error('no_user_email', 'User email not found', array('status' => 400));
    }

    // Check if WooCommerce Gift Cards plugin is active
    if (!class_exists('WC_GC_Gift_Card_Data')) {
        error_log('❌ WooCommerce Gift Cards plugin not active');
        return new WP_Error('gift_cards_not_available', 'WooCommerce Gift Cards plugin not active', array('status' => 500));
    }

    try {
        $received_cards = array();
        $purchased_cards = array();

        // Get gift cards RECEIVED by user using WC_GC API
        error_log('📥 Querying received gift cards for: ' . $user_email);
        $received_gcs = WC_GC()->db->giftcards->query(array(
            'return' => 'objects',
            'recipient' => $user_email,
            'limit' => -1
        ));

        error_log('📥 Found ' . count($received_gcs) . ' received gift cards');

        foreach ($received_gcs as $gc_data) {
            $gc = new WC_GC_Gift_Card($gc_data->get_id());
            if ($gc->get_id()) {
                $received_cards[] = samsara_format_gift_card($gc);
            }
        }

        // Get gift cards PURCHASED by user (from their orders)
        // Get all orders by this customer
        error_log('🛒 Querying orders for customer: ' . $user_id);
        $customer_orders = wc_get_orders(array(
            'customer_id' => $user_id,
            'limit' => -1,
            'return' => 'ids'
        ));

        error_log('🛒 Found ' . count($customer_orders) . ' customer orders');

        if (!empty($customer_orders)) {
            // Track IDs to avoid duplicates
            $added_gc_ids = array();

            // Get gift cards from those orders
            foreach ($customer_orders as $order_id) {
                $order_gcs = WC_GC()->db->giftcards->query(array(
                    'return' => 'objects',
                    'order_id' => $order_id,
                    'limit' => -1
                ));

                if (!empty($order_gcs)) {
                    error_log('🎁 Found ' . count($order_gcs) . ' gift cards in order #' . $order_id);
                }

                foreach ($order_gcs as $gc_data) {
                    $gc_id = $gc_data->get_id();

                    // Skip if already added (avoid duplicates)
                    if (in_array($gc_id, $added_gc_ids)) {
                        continue;
                    }

                    $gc = new WC_GC_Gift_Card($gc_id);
                    if ($gc->get_id()) {
                        $purchased_cards[] = samsara_format_gift_card($gc);
                        $added_gc_ids[] = $gc_id;
                    }
                }
            }
        }

        // Sort both arrays by creation date (newest first)
        usort($received_cards, function($a, $b) {
            return strtotime($b['create_date']) - strtotime($a['create_date']);
        });

        usort($purchased_cards, function($a, $b) {
            return strtotime($b['create_date']) - strtotime($a['create_date']);
        });

        // Return both arrays
        $response = array(
            'received' => $received_cards,
            'purchased' => $purchased_cards,
        );

        error_log('✅ Returning ' . count($received_cards) . ' received and ' . count($purchased_cards) . ' purchased cards');

        return new WP_REST_Response($response, 200);

    } catch (Exception $e) {
        return new WP_Error('gift_cards_error', $e->getMessage(), array('status' => 500));
    }
}

/**
 * Get a specific gift card by ID
 * Ensures user owns the gift card
 */
function samsara_get_gift_card($request) {
    $gift_card_id = $request['id'];
    $user = wp_get_current_user();
    $user_email = $user->user_email;

    if (!class_exists('WC_GC_Gift_Card')) {
        return new WP_Error('gift_cards_not_available', 'WooCommerce Gift Cards plugin not active', array('status' => 500));
    }

    try {
        $gc = new WC_GC_Gift_Card($gift_card_id);

        if (!$gc->get_id()) {
            return new WP_Error('gift_card_not_found', 'Gift card not found', array('status' => 404));
        }

        // Verify user owns this gift card
        $recipient = $gc->get_recipient();
        if ($recipient !== $user_email && !current_user_can('manage_woocommerce')) {
            return new WP_Error('forbidden', 'You do not have permission to access this gift card', array('status' => 403));
        }

        $gift_card_data = samsara_format_gift_card($gc, true);

        // Add flag to indicate if current user is the recipient (vs. purchaser)
        $gift_card_data['is_current_user_recipient'] = ($recipient === $user_email);

        return new WP_REST_Response($gift_card_data, 200);

    } catch (Exception $e) {
        // Log detailed error for debugging
        error_log('Gift Card API Error (ID: ' . $gift_card_id . '): ' . $e->getMessage());
        error_log('Stack trace: ' . $e->getTraceAsString());

        // Return user-friendly error with technical details
        $error_message = 'Failed to load gift card. ';

        // Add specific error hints
        if (strpos($e->getMessage(), 'DateTime') !== false) {
            $error_message .= 'Date formatting error. Please contact support.';
        } elseif (strpos($e->getMessage(), 'timezone') !== false) {
            $error_message .= 'Timezone configuration error. Please contact support.';
        } else {
            $error_message .= $e->getMessage();
        }

        return new WP_Error(
            'gift_card_error',
            $error_message,
            array(
                'status' => 500,
                'technical_details' => array(
                    'exception' => get_class($e),
                    'message' => $e->getMessage(),
                    'file' => basename($e->getFile()),
                    'line' => $e->getLine(),
                )
            )
        );
    }
}

/**
 * Check gift card balance by code
 * Allows user to check balance of any gift card code
 */
function samsara_check_gift_card_balance($request) {
    $code = sanitize_text_field($request['code']);

    if (!class_exists('WC_GC_Gift_Card')) {
        return new WP_Error('gift_cards_not_available', 'WooCommerce Gift Cards plugin not active', array('status' => 500));
    }

    try {
        // Get gift card by code using query
        $gcs = WC_GC()->db->giftcards->query(array(
            'return' => 'objects',
            'code' => $code,
            'limit' => 1
        ));

        if (empty($gcs)) {
            return new WP_Error('gift_card_not_found', 'Gift card not found', array('status' => 404));
        }

        $gift_card_obj = new WC_GC_Gift_Card($gcs[0]->get_id());

        // Format expire date with timezone (same as other endpoints)
        $expire_date = null;
        $expire_timestamp = $gift_card_obj->get_expire_date();
        if ($expire_timestamp) {
            try {
                if (function_exists('wp_timezone')) {
                    $wp_timezone = wp_timezone();
                } else {
                    $timezone_string = get_option('timezone_string');
                    if (empty($timezone_string)) {
                        $timezone_string = 'UTC';
                    }
                    $wp_timezone = new DateTimeZone($timezone_string);
                }
                $date = new DateTime('@' . $expire_timestamp);
                $date->setTimezone($wp_timezone);
                $expire_date = $date->format('c'); // ISO 8601 with timezone
            } catch (Exception $e) {
                error_log('Date formatting error in balance check: ' . $e->getMessage());
                $expire_date = date('Y-m-d', $expire_timestamp);
            }
        }

        // Return basic balance info (don't expose full details for privacy)
        $response = array(
            'code' => $gift_card_obj->get_code(),
            'balance' => (float) $gift_card_obj->get_initial_balance(),
            'remaining' => (float) $gift_card_obj->get_balance(),
            'is_active' => $gift_card_obj->is_active(),
            'expire_date' => $expire_date,
            'status' => samsara_get_gift_card_status($gift_card_obj),
        );

        return new WP_REST_Response($response, 200);

    } catch (Exception $e) {
        return new WP_Error('gift_card_error', $e->getMessage(), array('status' => 500));
    }
}

/**
 * Format gift card object for API response
 *
 * @param WC_GC_Gift_Card $gc Gift card object
 * @param bool $include_activities Whether to include transaction history
 * @return array Formatted gift card data
 */
function samsara_format_gift_card($gc, $include_activities = false) {
    // All date methods return Unix timestamps (int|null), not DateTime objects
    // Format dates in ISO 8601 with timezone for proper JavaScript parsing
    $format_date = function($timestamp) {
        if (!$timestamp) {
            return null;
        }

        try {
            // Get WordPress timezone (wp_timezone() requires WP 5.3+)
            if (function_exists('wp_timezone')) {
                $wp_timezone = wp_timezone();
            } else {
                // Fallback for older WordPress versions
                $timezone_string = get_option('timezone_string');
                if (empty($timezone_string)) {
                    $timezone_string = 'UTC';
                }
                $wp_timezone = new DateTimeZone($timezone_string);
            }

            // Create DateTime object in WordPress timezone
            $date = new DateTime('@' . $timestamp);
            $date->setTimezone($wp_timezone);
            // Return ISO 8601 format with timezone (e.g., "2025-11-19T16:00:00-05:00")
            return $date->format('c');
        } catch (Exception $e) {
            // Fallback to simple format if timezone conversion fails
            error_log('Gift card date formatting error: ' . $e->getMessage());
            return date('Y-m-d H:i:s', $timestamp);
        }
    };

    $data = array(
        'id' => $gc->get_id(),
        'code' => $gc->get_code(),
        'balance' => (float) $gc->get_initial_balance(),
        'remaining' => (float) $gc->get_balance(),
        'recipient' => $gc->get_recipient() ?: '',
        'sender' => $gc->get_sender() ?: '',
        'message' => $gc->get_message() ?: '',
        'create_date' => $format_date($gc->get_date_created()),
        'deliver_date' => $format_date($gc->get_deliver_date()),
        'expire_date' => $format_date($gc->get_expire_date()),
        'redeem_date' => $format_date($gc->get_date_redeemed()),
        'is_active' => $gc->is_active(),
        'customer_id' => $gc->get_redeemed_by() ?: null,
        'is_redeemed_to_account' => !empty($gc->get_redeemed_by()),
        'status' => samsara_get_gift_card_status($gc),
    );

    // Include transaction history if requested
    if ($include_activities) {
        try {
            error_log('🔍 Fetching activities for gift card #' . $gc->get_id());

            $activities = WC_GC()->db->activity->query(array(
                'gc_id' => $gc->get_id(),
                'orderby' => 'date',
                'order' => 'DESC',
            ));

            error_log('🔍 Activities count: ' . (is_array($activities) ? count($activities) : 'not an array'));

            $formatted_activities = array();
            if (is_array($activities)) {
                foreach ($activities as $index => $activity) {
                    // Activities can be either objects or arrays depending on query parameters
                    if (is_object($activity) && method_exists($activity, 'get_id')) {
                        // Handle object format
                        $formatted_activities[] = array(
                            'id' => $activity->get_id(),
                            'type' => $activity->get_type(),
                            'user_id' => $activity->get_user_id(),
                            'user_email' => $activity->get_user_email(),
                            'object_id' => $activity->get_object_id(), // Order ID if applicable
                            'amount' => (float) $activity->get_amount(),
                            'date' => $format_date($activity->get_date_created()),
                            'note' => $activity->get_note(),
                        );
                        error_log('✅ Added activity (object): ' . $activity->get_type() . ' - ' . $activity->get_amount());
                    } elseif (is_array($activity)) {
                        // Handle array format
                        $formatted_activities[] = array(
                            'id' => isset($activity['id']) ? $activity['id'] : null,
                            'type' => isset($activity['type']) ? $activity['type'] : 'unknown',
                            'user_id' => isset($activity['user_id']) ? $activity['user_id'] : null,
                            'user_email' => isset($activity['user_email']) ? $activity['user_email'] : '',
                            'object_id' => isset($activity['object_id']) ? $activity['object_id'] : null,
                            'amount' => isset($activity['amount']) ? (float) $activity['amount'] : 0,
                            'date' => isset($activity['date']) ? $format_date($activity['date']) : null,
                            'note' => isset($activity['note']) ? $activity['note'] : '',
                        );
                        error_log('✅ Added activity (array): ' . (isset($activity['type']) ? $activity['type'] : 'unknown') . ' - ' . (isset($activity['amount']) ? $activity['amount'] : '0'));
                    }
                }
            }

            error_log('✅ Formatted ' . count($formatted_activities) . ' activities');
            $data['activities'] = $formatted_activities;
        } catch (Exception $e) {
            error_log('❌ Error fetching activities: ' . $e->getMessage());
            $data['activities'] = array();
        }
    }

    return $data;
}

/**
 * Determine gift card status
 *
 * @param WC_GC_Gift_Card $gc Gift card object
 * @return string Status: 'active', 'used', 'expired', or 'inactive'
 */
function samsara_get_gift_card_status($gc) {
    if (!$gc->is_active()) {
        return 'inactive';
    }

    // Check if expired
    // Note: get_expire_date() returns a Unix timestamp (int), not a date string
    $expire_date = $gc->get_expire_date();
    if ($expire_date && $expire_date < time()) {
        return 'expired';
    }

    // Check if fully used (balance is the remaining amount)
    $balance = $gc->get_balance();
    if ($balance <= 0) {
        return 'used';
    }

    return 'active';
}

/**
 * Redeem a gift card to the current user's account
 * This links the gift card to the user ID for checkout use
 */
function samsara_redeem_gift_card_to_account($request) {
    $gift_card_id = $request['id'];
    $user_id = get_current_user_id();
    $user = wp_get_current_user();

    if (!class_exists('WC_GC_Gift_Card')) {
        return new WP_Error('gift_cards_not_available', 'WooCommerce Gift Cards plugin not active', array('status' => 500));
    }

    try {
        $gc = new WC_GC_Gift_Card($gift_card_id);

        if (!$gc->get_id()) {
            return new WP_Error('gift_card_not_found', 'Gift card not found', array('status' => 404));
        }

        // Verify user owns this gift card (by email)
        $recipient = $gc->get_recipient();
        if ($recipient !== $user->user_email && !current_user_can('manage_woocommerce')) {
            return new WP_Error('forbidden', 'You do not have permission to redeem this gift card', array('status' => 403));
        }

        // Check if already redeemed
        if ($gc->is_redeemed()) {
            $redeemed_by = $gc->get_redeemed_by();
            if ($redeemed_by == $user_id) {
                return new WP_REST_Response(array(
                    'success' => true,
                    'message' => 'Gift card is already redeemed to your account',
                    'already_redeemed' => true
                ), 200);
            } else {
                return new WP_Error('already_redeemed', 'Gift card is already redeemed to another account', array('status' => 400));
            }
        }

        // Redeem to account using the redeem() method
        $gc->redeem($user_id);

        error_log('✅ Gift card #' . $gift_card_id . ' redeemed to user #' . $user_id);

        return new WP_REST_Response(array(
            'success' => true,
            'message' => 'Gift card successfully added to your account balance'
        ), 200);

    } catch (Exception $e) {
        // Log detailed error for debugging
        error_log('❌ Error redeeming gift card (ID: ' . $gift_card_id . '): ' . $e->getMessage());
        error_log('Stack trace: ' . $e->getTraceAsString());

        // Return user-friendly error with technical details
        $error_message = 'Failed to redeem gift card. ';

        // Add specific error hints
        if (strpos($e->getMessage(), 'already') !== false) {
            $error_message .= 'This gift card has already been redeemed.';
        } elseif (strpos($e->getMessage(), 'expired') !== false) {
            $error_message .= 'This gift card has expired.';
        } elseif (strpos($e->getMessage(), 'balance') !== false) {
            $error_message .= 'This gift card has no remaining balance.';
        } else {
            $error_message .= $e->getMessage();
        }

        return new WP_Error(
            'gift_card_redeem_error',
            $error_message,
            array(
                'status' => 400,
                'technical_details' => array(
                    'exception' => get_class($e),
                    'message' => $e->getMessage(),
                    'file' => basename($e->getFile()),
                    'line' => $e->getLine(),
                    'gift_card_id' => $gift_card_id,
                    'user_id' => $user_id,
                )
            )
        );
    }
}

/**
 * Get gift cards for a specific order
 * Returns gift cards that were purchased in the specified order
 */
function samsara_get_order_gift_cards($request) {
    $order_id = $request->get_param('id');
    $user_id = get_current_user_id();

    error_log('🎁 Getting gift cards for order #' . $order_id);

    if (!class_exists('WC_GC_Gift_Card')) {
        error_log('❌ WC_GC_Gift_Card class not found');
        return rest_ensure_response(array());
    }

    try {
        // Get the order
        $order = wc_get_order($order_id);

        // Verify order exists and belongs to current user
        if (!$order || $order->get_customer_id() != $user_id) {
            error_log('❌ Order not found or does not belong to user');
            return new WP_Error(
                'order_not_found',
                'Order not found or does not belong to current user',
                array('status' => 404)
            );
        }

        // Use WooCommerce Gift Cards API to query gift cards by order ID
        $order_gcs = WC_GC()->db->giftcards->query(array(
            'return' => 'objects',
            'order_id' => $order_id,
            'limit' => -1
        ));

        error_log('🎁 Found ' . count($order_gcs) . ' gift cards via WC_GC API');

        if (empty($order_gcs)) {
            return rest_ensure_response(array());
        }

        $gift_cards = array();
        foreach ($order_gcs as $gc_data) {
            $gc = new WC_GC_Gift_Card($gc_data->get_id());
            if ($gc->get_id()) {
                $gift_cards[] = samsara_format_gift_card($gc);
                error_log('🎁 Added gift card #' . $gc->get_id() . ' - ' . $gc->get_code());
            }
        }

        // Sort by creation date (newest first)
        usort($gift_cards, function($a, $b) {
            return strtotime($b['create_date']) - strtotime($a['create_date']);
        });

        error_log('✅ Returning ' . count($gift_cards) . ' gift cards');

        return rest_ensure_response($gift_cards);

    } catch (Exception $e) {
        error_log('❌ Error getting order gift cards: ' . $e->getMessage());
        return new WP_Error('gift_card_error', $e->getMessage(), array('status' => 500));
    }
}

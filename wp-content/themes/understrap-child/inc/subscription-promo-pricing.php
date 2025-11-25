<?php
/**
 * Subscription Promotional Pricing Display
 *
 * Dynamically displays first-payment discount pricing on shop and product pages
 * based on auto-apply coupons that are restricted to specific products.
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Get auto-apply coupon data for a specific product
 * Returns the coupon discount info if an auto-apply coupon exists for this product
 */
function samsara_get_product_auto_apply_coupon($product_id) {
    // Cache results to avoid repeated queries
    static $coupon_cache = array();

    if (isset($coupon_cache[$product_id])) {
        return $coupon_cache[$product_id];
    }

    // Query for coupons that:
    // 1. Are set to auto-apply
    // 2. Have this product in their restrictions
    // 3. Are currently valid (not expired, within date range)
    $args = array(
        'post_type'      => 'shop_coupon',
        'post_status'    => 'publish',
        'posts_per_page' => -1,
        'meta_query'     => array(
            'relation' => 'AND',
            // Auto-apply is enabled (WT Smart Coupons plugin uses _wt_make_auto_coupon)
            // Value can be '1', 'yes', or true depending on how it was saved
            array(
                'key'     => '_wt_make_auto_coupon',
                'value'   => array('1', 'yes'),
                'compare' => 'IN',
            ),
        ),
    );

    $coupons = get_posts($args);

    foreach ($coupons as $coupon_post) {
        $coupon = new WC_Coupon($coupon_post->ID);

        // Check if coupon is valid (not expired, within dates)
        if (!samsara_is_coupon_currently_valid($coupon)) {
            continue;
        }

        // Check if this product is in the coupon's product restrictions
        $product_ids = $coupon->get_product_ids();

        // Convert to integers for proper comparison
        $product_ids = array_map('intval', $product_ids);

        if (!empty($product_ids) && in_array((int)$product_id, $product_ids, true)) {
            // Found an auto-apply coupon for this product
            $discount_type = $coupon->get_discount_type();
            $discount_amount = $coupon->get_amount();
            $active_for_payments = get_post_meta($coupon_post->ID, '_wcs_number_payments', true);

            // Only show promo pricing if it's for first payment only (1 payment)
            // or if it's a percentage/fixed discount type we can display
            if ($active_for_payments == 1 || empty($active_for_payments)) {
                $coupon_data = array(
                    'coupon_id'       => $coupon_post->ID,
                    'coupon_code'     => $coupon->get_code(),
                    'discount_type'   => $discount_type,
                    'discount_amount' => $discount_amount,
                    'active_payments' => $active_for_payments,
                );

                $coupon_cache[$product_id] = $coupon_data;
                return $coupon_data;
            }
        }

        // Also check category restrictions
        $category_ids = $coupon->get_product_categories();
        if (!empty($category_ids)) {
            $product_categories = wc_get_product_term_ids($product_id, 'product_cat');
            if (array_intersect($category_ids, $product_categories)) {
                $discount_type = $coupon->get_discount_type();
                $discount_amount = $coupon->get_amount();
                $active_for_payments = get_post_meta($coupon_post->ID, '_wcs_number_payments', true);

                if ($active_for_payments == 1 || empty($active_for_payments)) {
                    $coupon_data = array(
                        'coupon_id'       => $coupon_post->ID,
                        'coupon_code'     => $coupon->get_code(),
                        'discount_type'   => $discount_type,
                        'discount_amount' => $discount_amount,
                        'active_payments' => $active_for_payments,
                    );

                    $coupon_cache[$product_id] = $coupon_data;
                    return $coupon_data;
                }
            }
        }
    }

    $coupon_cache[$product_id] = false;
    return false;
}

/**
 * Check if a coupon is currently valid (within date range, not expired)
 */
function samsara_is_coupon_currently_valid($coupon) {
    $now = current_time('timestamp');

    // Check expiry date
    $expiry_date = $coupon->get_date_expires();
    if ($expiry_date && $expiry_date->getTimestamp() < $now) {
        return false;
    }

    // Check start date (WT Smart Coupons uses _wt_coupon_start_date)
    $start_date = get_post_meta($coupon->get_id(), '_wt_coupon_start_date', true);
    if ($start_date && strtotime($start_date) > $now) {
        return false;
    }

    // Check usage limits
    $usage_limit = $coupon->get_usage_limit();
    $usage_count = $coupon->get_usage_count();
    if ($usage_limit > 0 && $usage_count >= $usage_limit) {
        return false;
    }

    return true;
}

/**
 * Calculate discounted price based on coupon type
 */
function samsara_calculate_discounted_price($original_price, $coupon_data) {
    $discount_type = $coupon_data['discount_type'];
    $discount_amount = $coupon_data['discount_amount'];

    switch ($discount_type) {
        case 'percent':
        case 'recurring_percent':
        case 'sign_up_fee_percent':
            // Percentage discount
            return $original_price * (1 - ($discount_amount / 100));

        case 'fixed_cart':
        case 'fixed_product':
        case 'recurring_fee':
        case 'sign_up_fee':
            // Fixed amount discount
            return max(0, $original_price - $discount_amount);

        default:
            // Unknown type, return original
            return $original_price;
    }
}

/**
 * Get discount percentage for display (works for both percent and fixed discounts)
 */
function samsara_get_discount_display($original_price, $coupon_data) {
    $discount_type = $coupon_data['discount_type'];
    $discount_amount = $coupon_data['discount_amount'];

    if (strpos($discount_type, 'percent') !== false) {
        return round($discount_amount) . '%';
    } else {
        // For fixed discounts, calculate the percentage
        if ($original_price > 0) {
            $percent = ($discount_amount / $original_price) * 100;
            return round($percent) . '%';
        }
        return wc_price($discount_amount);
    }
}

/**
 * Filter the price HTML for subscription products to show promotional pricing
 */
add_filter('woocommerce_get_price_html', 'samsara_subscription_promo_price_html', 100, 2);

function samsara_subscription_promo_price_html($price_html, $product) {
    // Only modify on frontend, not admin
    if (is_admin() && !wp_doing_ajax()) {
        return $price_html;
    }

    // Check if this is a subscription product
    if (!class_exists('WC_Subscriptions_Product') || !WC_Subscriptions_Product::is_subscription($product)) {
        return $price_html;
    }

    $product_id = $product->get_id();

    // Check if this product has an auto-apply coupon
    $coupon_data = samsara_get_product_auto_apply_coupon($product_id);

    if (!$coupon_data) {
        return $price_html;
    }

    // Get subscription pricing details
    $regular_price = WC_Subscriptions_Product::get_price($product);
    $sign_up_fee = WC_Subscriptions_Product::get_sign_up_fee($product);
    $period = WC_Subscriptions_Product::get_period($product);
    $interval = WC_Subscriptions_Product::get_interval($product);

    if (!$regular_price) {
        return $price_html;
    }

    // Calculate the total first payment (recurring + sign-up fee)
    $original_first_payment = $regular_price + $sign_up_fee;

    // Calculate discounted first payment
    $discounted_first_payment = samsara_calculate_discounted_price($original_first_payment, $coupon_data);

    // Format the period string
    $period_string = samsara_format_subscription_period($period, $interval);

    // Build the promotional price HTML
    $promo_html = '<span class="samsara-promo-pricing">';

    // First payment with strikethrough original
    $promo_html .= '<span class="first-payment">';
    $promo_html .= '<span class="promo-label">First payment </span>';
    $promo_html .= '<del class="original-price">' . wc_price($original_first_payment) . '</del> ';
    $promo_html .= '<ins class="discounted-price">' . wc_price($discounted_first_payment) . '</ins>';
    $promo_html .= '</span>';

    // Then regular price
    $promo_html .= '<span class="recurring-payment">';
    $promo_html .= '<span class="then-label">then </span>';
    $promo_html .= '<span class="regular-recurring">' . wc_price($original_first_payment) . '/' . $period_string . '</span>';
    $promo_html .= '</span>';

    $promo_html .= '</span>';

    return $promo_html;
}

/**
 * Format subscription period for display
 */
function samsara_format_subscription_period($period, $interval) {
    $periods = array(
        'day'   => array('day', 'days'),
        'week'  => array('week', 'weeks'),
        'month' => array('month', 'months'),
        'year'  => array('year', 'years'),
    );

    if (!isset($periods[$period])) {
        return $period;
    }

    if ($interval == 1) {
        return $periods[$period][0];
    }

    return $interval . ' ' . $periods[$period][1];
}

/**
 * Add CSS for promotional pricing display
 */
add_action('wp_head', 'samsara_promo_pricing_css');

function samsara_promo_pricing_css() {
    ?>
    <style>
        .samsara-promo-pricing {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .samsara-promo-pricing .first-payment {
            font-size: 1.1em;
        }

        .samsara-promo-pricing .promo-label {
            font-weight: 600;
            color: #333;
        }

        .samsara-promo-pricing del.original-price {
            color: #999;
            text-decoration: line-through;
            font-size: 0.9em;
        }

        .samsara-promo-pricing ins.discounted-price {
            color: #27ae60;
            font-weight: 700;
            text-decoration: none;
            font-size: 1.2em;
        }

        .samsara-promo-pricing .recurring-payment {
            font-size: 0.9em;
            color: #666;
        }

        .samsara-promo-pricing .then-label {
            font-style: italic;
        }

        /* Shop page / archive styling */
        .woocommerce ul.products li.product .samsara-promo-pricing {
            margin-top: 10px;
        }

        /* Single product page styling */
        .single-product .samsara-promo-pricing {
            margin-bottom: 20px;
        }

        .single-product .samsara-promo-pricing .first-payment {
            font-size: 1.3em;
        }

        .single-product .samsara-promo-pricing ins.discounted-price {
            font-size: 1.5em;
        }

        /* Ensure product title is visible on single product pages */
        .single-product .product_title,
        .single-product h1.product_title,
        .single-product .entry-title {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            height: auto !important;
            overflow: visible !important;
            clip: auto !important;
            position: relative !important;
        }
    </style>
    <?php
}

/**
 * Add a promotional badge to products on shop/archive pages only
 */
add_action('woocommerce_before_shop_loop_item_title', 'samsara_promo_badge', 15);

function samsara_promo_badge() {
    global $product;

    if (!$product) {
        return;
    }

    $coupon_data = samsara_get_product_auto_apply_coupon($product->get_id());

    if (!$coupon_data) {
        return;
    }

    // Get subscription pricing to calculate discount display
    if (!class_exists('WC_Subscriptions_Product') || !WC_Subscriptions_Product::is_subscription($product)) {
        return;
    }

    $regular_price = WC_Subscriptions_Product::get_price($product);
    $sign_up_fee = WC_Subscriptions_Product::get_sign_up_fee($product);
    $original_price = $regular_price + $sign_up_fee;

    $discount_display = samsara_get_discount_display($original_price, $coupon_data);

    echo '<span class="samsara-promo-badge">' . esc_html($discount_display) . ' OFF First Payment</span>';
}

/**
 * Add badge CSS
 */
add_action('wp_head', 'samsara_promo_badge_css');

function samsara_promo_badge_css() {
    ?>
    <style>
        .samsara-promo-badge {
            position: absolute;
            top: 10px;
            left: 10px;
            background: #27ae60;
            color: white;
            padding: 5px 10px;
            font-size: 12px;
            font-weight: 700;
            border-radius: 3px;
            z-index: 10;
            text-transform: uppercase;
        }
    </style>
    <?php
}

<?php
/**
 * Active Memberships Grid Component
 */

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;


$current_user_id = get_current_user_id();
$active_memberships = array();
$purchased_products = array();

// Debug for Switch User plugin compatibility
error_log( 'Active Memberships - Current User ID: ' . $current_user_id );
if ( $current_user_id ) {
    $user_info = get_userdata( $current_user_id );
    error_log( 'Active Memberships - User login: ' . ( $user_info ? $user_info->user_login : 'unknown' ) );

    // Check if in switched user session
    if ( function_exists( 'current_user_switched' ) ) {
        $switched_user = current_user_switched();
        if ( $switched_user ) {
            error_log( 'Active Memberships - SWITCHED USER SESSION DETECTED' );
            error_log( 'Active Memberships - Original Admin ID: ' . $switched_user->ID );
            error_log( 'Active Memberships - Processing data for switched user: ' . $current_user_id );
        }
    }
}

// First, get user's orders to validate memberships
$customer_orders = wc_get_orders( array(
    'customer_id' => $current_user_id,
    'status' => wc_get_is_paid_statuses(),
    'limit' => -1,
) );

// Get all content from user's active memberships
$all_membership_content = array();

if ( function_exists( 'wc_memberships_get_user_active_memberships' ) ) {
    $user_memberships = wc_memberships_get_user_active_memberships( $current_user_id );
    foreach ( $user_memberships as $membership ) {
        $plan = $membership->get_plan();

        // Skip if this is a test or placeholder membership without valid purchase
        if ( stripos( $plan->get_name(), 'basecamp' ) !== false || stripos( $plan->get_name(), 'vip' ) !== false ) {
            // Only include if user actually has paid orders specifically for this membership plan
            $has_valid_purchase = false;
            foreach ( $customer_orders as $order ) {
                if ( $order->get_status() === 'completed' || $order->get_status() === 'processing' ) {
                    // Check if this order contains products that grant this specific membership plan
                    foreach ( $order->get_items() as $item ) {
                        $product = $item->get_product();
                        if ( $product && function_exists( 'wc_memberships_get_membership_plans_from_product' ) ) {
                            $product_membership_plans = wc_memberships_get_membership_plans_from_product( $product->get_id() );
                            foreach ( $product_membership_plans as $product_plan ) {
                                if ( $product_plan->get_id() === $plan->get_id() ) {
                                    $has_valid_purchase = true;
                                    break 3; // Break out of all nested loops
                                }
                            }
                        }
                    }
                }
            }

            if ( ! $has_valid_purchase ) {
                error_log( 'Active Memberships - Skipping membership ' . $plan->get_name() . ' (ID: ' . $plan->get_id() . ') - no valid purchase found' );
                continue; // Skip this membership
            }
        }

        // Get restricted content from this membership plan
        $restricted_content_query = $plan->get_restricted_content( -1 );

        if ( $restricted_content_query && $restricted_content_query->have_posts() ) {
            while ( $restricted_content_query->have_posts() ) {
                $restricted_content_query->the_post();

                // Get featured image
                $featured_image = '';
                if ( has_post_thumbnail() ) {
                    $featured_image = get_the_post_thumbnail_url( get_the_ID(), 'thumbnail' );
                }

                $all_membership_content[] = array(
                    'id' => get_the_ID(),
                    'title' => get_the_title(),
                    'url' => get_permalink(),
                    'type' => get_post_type(),
                    'excerpt' => wp_trim_words( get_the_excerpt() ? get_the_excerpt() : get_the_content(), 15, '...' ),
                    'image' => $featured_image,
                    'membership' => $plan->get_name(),
                    'membership_id' => $plan->get_id()
                );
            }
            wp_reset_postdata();
        }


        // Keep membership info for other uses (like displaying empty state info)
        $active_memberships[] = array(
            'id' => $plan->get_id(),
            'name' => $plan->get_name(),
            'status' => $membership->get_status(),
            'start_date' => $membership->get_start_date(),
            'end_date' => $membership->get_end_date(),
            'type' => 'membership'
        );
    }
}

// Sort all membership content alphabetically by title
usort( $all_membership_content, function( $a, $b ) {
    return strcmp( $a['title'], $b['title'] );
});

// Get user's purchased products (training plans, programs, downloads, subscriptions)
foreach ( $customer_orders as $order ) {
    foreach ( $order->get_items() as $item ) {
        $product = $item->get_product();
        if ( $product ) {
            // Get all product categories
            $categories = wp_get_post_terms( $product->get_id(), 'product_cat', array( 'fields' => 'names' ) );

            // More inclusive category matching - include digital products, downloads, subscriptions
            $training_categories = array(
                'Training Plans', 'Programs', 'Video Programs', 'Coaching',
                'training-plans', 'programs', 'video-programs', 'coaching',
                'Digital Products', 'digital-products', 'Downloads', 'downloads',
                'Subscriptions', 'subscriptions', 'Memberships', 'memberships',
                'Training', 'training', 'Fitness', 'fitness', 'Workout', 'workout',
                'Program', 'program', 'Plan', 'plan'
            );

            // Include products with matching categories OR downloadable/virtual products OR subscription products
            $is_training_related = !empty( array_intersect( $categories, $training_categories ) );
            $is_digital = $product->is_downloadable() || $product->is_virtual();
            $is_subscription = class_exists( 'WC_Subscriptions_Product' ) && WC_Subscriptions_Product::is_subscription( $product );

            if ( $is_training_related || $is_digital || $is_subscription ) {
                // Avoid duplicates by checking if this product was already added
                $already_added = false;
                foreach ( $purchased_products as $existing_product ) {
                    if ( $existing_product['id'] == $product->get_id() ) {
                        $already_added = true;
                        break;
                    }
                }

                if ( ! $already_added ) {
                    $purchased_products[] = array(
                        'id' => $product->get_id(),
                        'name' => $product->get_name(),
                        'image' => wp_get_attachment_image_url( $product->get_image_id(), 'medium' ),
                        'description' => wp_trim_words( $product->get_description(), 20 ),
                        'categories' => $categories,
                        'purchase_date' => $order->get_date_created(),
                        'type' => 'product',
                        'url' => get_permalink( $product->get_id() ),
                        'is_digital' => $is_digital,
                        'is_subscription' => $is_subscription
                    );
                }
            }
        }
    }
}

// Get user's active subscriptions
if ( function_exists( 'wcs_get_users_subscriptions' ) ) {
    $user_subscriptions = wcs_get_users_subscriptions( $current_user_id );
    foreach ( $user_subscriptions as $subscription ) {
        if ( $subscription->has_status( array( 'active', 'on-hold', 'pending-cancel' ) ) ) {
            foreach ( $subscription->get_items() as $item ) {
                $product = $item->get_product();
                if ( $product ) {
                    // Check if this subscription product is already in our list
                    $already_added = false;
                    foreach ( $purchased_products as $existing_product ) {
                        if ( $existing_product['id'] == $product->get_id() ) {
                            $already_added = true;
                            break;
                        }
                    }

                    if ( ! $already_added ) {
                        $purchased_products[] = array(
                            'id' => $product->get_id(),
                            'name' => $product->get_name(),
                            'image' => wp_get_attachment_image_url( $product->get_image_id(), 'medium' ),
                            'description' => wp_trim_words( $product->get_description(), 20 ),
                            'categories' => wp_get_post_terms( $product->get_id(), 'product_cat', array( 'fields' => 'names' ) ),
                            'purchase_date' => $subscription->get_date_created(),
                            'type' => 'subscription',
                            'url' => get_permalink( $product->get_id() ),
                            'subscription_status' => $subscription->get_status(),
                            'next_payment' => $subscription->get_date( 'next_payment' )
                        );
                    }
                }
            }
        }
    }
}

// Combine and remove duplicates
$all_items = array_merge( $active_memberships, $purchased_products );
$unique_items = array();
$seen_ids = array();

foreach ( $all_items as $item ) {
    $key = $item['type'] . '_' . $item['id'];
    if ( ! in_array( $key, $seen_ids ) ) {
        $unique_items[] = $item;
        $seen_ids[] = $key;
    }
}

// Sort by purchase/start date (newest first)
usort( $unique_items, function( $a, $b ) {
    $date_a = isset( $a['purchase_date'] ) ? $a['purchase_date'] : $a['start_date'];
    $date_b = isset( $b['purchase_date'] ) ? $b['purchase_date'] : $b['start_date'];
    return $date_b <=> $date_a;
});
?>

<div class="active-memberships-section">
    <div class="row">
        <div class="col-md-12 mb-4">
            <h2 class="section-title">
                <i class="fas fa-star"></i>
                Your Training Programs
            </h2>
            <p class="section-subtitle">Access your purchased training plans, programs and memberships</p>
        </div>
    </div>

    <?php if ( ! empty( $all_membership_content ) ) : ?>
        <!-- Membership Content Grid -->
        <div class="content-grid">
            <?php foreach ( $all_membership_content as $content_item ) : ?>
                <div class="content-item">
                    <div class="content-header">
                        <?php if ( ! empty( $content_item['image'] ) ) : ?>
                            <div class="content-thumbnail">
                                <img src="<?php echo esc_url( $content_item['image'] ); ?>" alt="<?php echo esc_attr( $content_item['title'] ); ?>">
                            </div>
                        <?php else : ?>
                            <div class="content-thumbnail placeholder">
                                <i class="fas fa-file-alt"></i>
                            </div>
                        <?php endif; ?>
                        <div class="content-title-section">
                            <h4><a href="<?php echo esc_url( $content_item['url'] ); ?>"><?php echo esc_html( $content_item['title'] ); ?></a></h4>
                        </div>
                    </div>

                    <div class="content-membership">
                        <i class="fas fa-crown"></i>
                        <?php echo esc_html( $content_item['membership'] ); ?>
                    </div>

                    <?php if ( ! empty( $content_item['excerpt'] ) ) : ?>
                        <div class="content-excerpt">
                            <?php echo esc_html( $content_item['excerpt'] ); ?>
                        </div>
                    <?php endif; ?>

                    <div class="content-actions">
                        <a href="<?php echo esc_url( $content_item['url'] ); ?>" class="access-content-btn">
                            <i class="fas fa-external-link-alt"></i>
                            Access Content
                        </a>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>

    <?php elseif ( ! empty( $unique_items ) ) : ?>
        <!-- Regular Product Display (for non-membership products) -->
        <div class="row memberships-grid">
            <?php foreach ( $unique_items as $item ) : ?>
                <?php if ( $item['type'] !== 'membership' ) : ?>
                    <div class="col-lg-4 col-md-6 col-sm-12 mb-4">
                        <div class="membership-card <?php echo esc_attr( $item['type'] ); ?>-card">
                            <?php if ( $item['type'] === 'product' && ! empty( $item['image'] ) ) : ?>
                                <div class="membership-image">
                                    <img src="<?php echo esc_url( $item['image'] ); ?>" alt="<?php echo esc_attr( $item['name'] ); ?>" loading="lazy">
                                    <div class="membership-overlay">
                                        <div class="membership-type">
                                            <?php
                                            if ( ! empty( $item['categories'] ) ) {
                                                echo '<span class="category-badge">' . esc_html( $item['categories'][0] ) . '</span>';
                                            }
                                            ?>
                                        </div>
                                    </div>
                                </div>
                            <?php else : ?>
                                <div class="membership-image membership-placeholder">
                                    <div class="placeholder-icon">
                                        <i class="fas fa-play-circle"></i>
                                    </div>
                                    <div class="membership-overlay">
                                        <div class="membership-type">
                                            <span class="category-badge"><?php echo ucfirst( $item['type'] ); ?></span>
                                        </div>
                                    </div>
                                </div>
                            <?php endif; ?>

                            <div class="membership-content">
                                <h3 class="membership-title"><?php echo esc_html( $item['name'] ); ?></h3>
                                <?php if ( ! empty( $item['description'] ) ) : ?>
                                    <p class="membership-description"><?php echo esc_html( $item['description'] ); ?></p>
                                <?php endif; ?>
                                <div class="membership-meta">
                                    <div class="purchase-date">
                                        <i class="fas fa-shopping-bag"></i>
                                        Purchased: <?php echo esc_html( wc_format_datetime( $item['purchase_date'], 'M j, Y' ) ); ?>
                                    </div>
                                </div>
                                <div class="membership-actions">
                                    <a href="<?php echo esc_url( $item['url'] ); ?>" class="membership-btn primary-btn">
                                        <i class="fas fa-play"></i>
                                        Access Content
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                <?php endif; ?>
            <?php endforeach; ?>
        </div>


    <?php else : ?>
        <!-- No Memberships State -->
        <div class="row">
            <div class="col-md-12">
                <div class="no-memberships-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-star"></i>
                    </div>
                    <h3>No Active Memberships or Programs</h3>
                    <p>Discover our training programs and memberships to start your fitness journey.</p>
                    <div class="empty-state-actions">
                        <a href="https://samsaraexperience.com/shop/" class="btn btn-primary browse-programs-btn">
                            <i class="fas fa-search"></i>
                            Browse Programs
                        </a>
                        <a href="https://samsaraexperience.com/training-basecamp/" class="btn btn-secondary">
                            <i class="fas fa-info-circle"></i>
                            Learn More
                        </a>
                    </div>
                </div>
            </div>
        </div>
    <?php endif; ?>
</div>


<!-- Active Memberships CSS moved to main template to prevent duplication -->

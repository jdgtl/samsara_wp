<?php
/**
 * Samsara Custom View Order Template
 *
 * Modern order view optimized for digital products with conditional physical product content.
 *
 * @package Samsara
 * @version 1.0.0
 */

defined( 'ABSPATH' ) || exit;

// Debug: Add template indicator
echo '<!-- Custom View Order Template Loaded -->' . PHP_EOL;

// Get order data
$notes = $order->get_customer_order_notes();
$items = $order->get_items();

// Analyze order contents
$has_physical_products = false;
$has_digital_products = false;
$requires_shipping = false;

foreach ( $items as $item ) {
    $product = $item->get_product();
    if ( $product ) {
        if ( $product->is_virtual() ) {
            $has_digital_products = true;
        } else {
            $has_physical_products = true;
            $requires_shipping = true;
        }
    }
}

// Determine primary order type
$order_type = $has_physical_products ? 'mixed' : 'digital';
if ( !$has_digital_products && $has_physical_products ) {
    $order_type = 'physical';
}
?>

<div class="samsara-order-view">
    <!-- Order Header -->
    <div class="order-header-card">
        <div class="order-header-content">
            <div class="order-basic-info">
                <h1 class="order-title">Order #<?php echo esc_html( $order->get_order_number() ); ?></h1>
                <div class="order-meta">
                    <span class="order-date">
                        <i class="fas fa-calendar-alt"></i>
                        <?php echo esc_html( wc_format_datetime( $order->get_date_created(), 'F j, Y \a\t g:i A' ) ); ?>
                    </span>
                    <?php if ( $order->get_date_paid() ) : ?>
                        <span class="payment-date">
                            <i class="fas fa-credit-card"></i>
                            Paid on <?php echo esc_html( wc_format_datetime( $order->get_date_paid(), 'F j, Y' ) ); ?>
                        </span>
                    <?php endif; ?>
                </div>
            </div>
            <div class="order-status-total">
                <div class="order-status-badge status-<?php echo esc_attr( $order->get_status() ); ?>">
                    <?php echo esc_html( wc_get_order_status_name( $order->get_status() ) ); ?>
                </div>
                <div class="order-total">
                    <?php echo $order->get_formatted_order_total(); ?>
                </div>
            </div>
        </div>

        <!-- Order Type Indicator -->
        <div class="order-type-indicator">
            <?php if ( $order_type === 'digital' ) : ?>
                <div class="type-badge digital">
                    <i class="fas fa-star"></i>
                    <span>Membership Access</span>
                </div>
            <?php elseif ( $order_type === 'physical' ) : ?>
                <div class="type-badge physical">
                    <i class="fas fa-shipping-fast"></i>
                    <span>Physical Delivery</span>
                </div>
            <?php else : ?>
                <div class="type-badge mixed">
                    <i class="fas fa-box"></i>
                    <span>Membership + Physical</span>
                </div>
            <?php endif; ?>
        </div>
    </div>

    <div class="order-content-grid">
        <!-- Order Items Section -->
        <div class="order-section order-items-section">
            <h2 class="section-title">
                <i class="fas fa-list"></i>
                Items Ordered
            </h2>

            <div class="order-items-list">
                <?php foreach ( $items as $item_id => $item ) :
                    $product = $item->get_product();
                    if ( ! $product ) continue;

                    $is_virtual = $product->is_virtual();
                    $product_image = $product->get_image( 'thumbnail' );
                    ?>
                    <div class="order-item <?php echo $is_virtual ? 'digital-item' : 'physical-item'; ?>">
                        <div class="item-image">
                            <?php if ( $product_image ) : ?>
                                <?php echo $product_image; ?>
                            <?php else : ?>
                                <div class="placeholder-image">
                                    <i class="fas fa-<?php echo $is_virtual ? 'star' : 'box'; ?>"></i>
                                </div>
                            <?php endif; ?>
                        </div>

                        <div class="item-details">
                            <h3 class="item-name">
                                <a href="<?php echo esc_url( $product->get_permalink() ); ?>">
                                    <?php echo esc_html( $item->get_name() ); ?>
                                </a>
                            </h3>

                            <div class="item-meta">
                                <span class="item-type">
                                    <?php if ( $is_virtual ) : ?>
                                        <i class="fas fa-star"></i> Membership
                                    <?php else : ?>
                                        <i class="fas fa-box"></i> Physical Product
                                    <?php endif; ?>
                                </span>

                                <span class="item-quantity">
                                    Qty: <?php echo esc_html( $item->get_quantity() ); ?>
                                </span>
                            </div>

                        </div>

                        <div class="item-price">
                            <?php echo wc_price( $item->get_total() ); ?>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>

        <!-- Order Summary Sidebar -->
        <div class="order-sidebar">
            <!-- Payment Information -->
            <div class="order-section payment-section">
                <h3 class="section-title">
                    <i class="fas fa-credit-card"></i>
                    Payment Details
                </h3>
                <div class="payment-info">
                    <div class="payment-method">
                        <span class="label">Payment Method:</span>
                        <span class="value">
<?php echo esc_html( $order->get_payment_method_title() ); ?>
                        </span>
                    </div>

                    <div class="order-totals">
                        <div class="total-line">
                            <span>Subtotal:</span>
                            <span><?php echo wc_price( $order->get_subtotal() ); ?></span>
                        </div>

                        <?php if ( $order->get_total_tax() > 0 ) : ?>
                            <div class="total-line">
                                <span>Tax:</span>
                                <span><?php echo wc_price( $order->get_total_tax() ); ?></span>
                            </div>
                        <?php endif; ?>

                        <?php if ( $requires_shipping && $order->get_shipping_total() > 0 ) : ?>
                            <div class="total-line">
                                <span>Shipping:</span>
                                <span><?php echo wc_price( $order->get_shipping_total() ); ?></span>
                            </div>
                        <?php endif; ?>

                        <div class="total-line total">
                            <span>Total:</span>
                            <span><?php echo $order->get_formatted_order_total(); ?></span>
                        </div>
                    </div>
                </div>
            </div>

            <?php if ( $requires_shipping ) : ?>
                <!-- Shipping Information (only show for physical products) -->
                <div class="order-section shipping-section">
                    <h3 class="section-title">
                        <i class="fas fa-shipping-fast"></i>
                        Shipping Details
                    </h3>
                    <div class="shipping-info">
                        <div class="shipping-address">
                            <strong><?php echo esc_html( $order->get_shipping_first_name() . ' ' . $order->get_shipping_last_name() ); ?></strong><br>
                            <?php echo esc_html( $order->get_shipping_address_1() ); ?><br>
                            <?php if ( $order->get_shipping_address_2() ) : ?>
                                <?php echo esc_html( $order->get_shipping_address_2() ); ?><br>
                            <?php endif; ?>
                            <?php echo esc_html( $order->get_shipping_city() . ', ' . $order->get_shipping_state() . ' ' . $order->get_shipping_postcode() ); ?><br>
                            <?php echo esc_html( WC()->countries->countries[ $order->get_shipping_country() ] ); ?>
                        </div>

                        <?php if ( $order->get_shipping_method() ) : ?>
                            <div class="shipping-method">
                                <span class="label">Method:</span>
                                <span class="value"><?php echo esc_html( $order->get_shipping_method() ); ?></span>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            <?php endif; ?>

            <!-- Membership Access Section -->
            <?php if ( $has_digital_products ) :
                // Check for specific membership types in order
                $has_basecamp_access = false;
                $has_athlete_team_access = false;

                foreach ( $items as $item ) {
                    $product = $item->get_product();
                    if ( $product && $product->is_virtual() ) {
                        $product_name = strtolower( $product->get_name() );
                        if ( stripos( $product_name, 'basecamp' ) !== false ) {
                            $has_basecamp_access = true;
                        }
                        if ( stripos( $product_name, 'athlete' ) !== false || stripos( $product_name, 'team' ) !== false ) {
                            $has_athlete_team_access = true;
                        }
                    }
                }
            ?>
                <div class="order-section membership-access-section">
                    <h3 class="section-title">
                        <i class="fas fa-star"></i>
                        Membership Access
                    </h3>
                    <div class="membership-access-info">
                        <?php if ( $order->get_status() === 'completed' ) : ?>
                            <div class="access-granted">
                                <i class="fas fa-check-circle"></i>
                                <div>
                                    <strong>Access Activated</strong>
                                    <p>Your membership benefits are now active.</p>
                                </div>
                            </div>

                            <?php if ( $has_basecamp_access ) : ?>
                                <a href="https://videos.samsaraexperience.com" target="_blank" class="basecamp-access-btn">
                                    <i class="fas fa-video"></i>
                                    Access Basecamp Training
                                </a>
                            <?php endif; ?>

                        <?php else : ?>
                            <div class="access-pending">
                                <i class="fas fa-clock"></i>
                                <div>
                                    <strong>Access Pending</strong>
                                    <p>Membership access will be activated once payment is confirmed.</p>
                                </div>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            <?php endif; ?>
        </div>
    </div>

    <!-- Order Updates -->
    <?php if ( $notes ) : ?>
        <div class="order-section order-updates-section">
            <h2 class="section-title">
                <i class="fas fa-history"></i>
                Order Updates
            </h2>
            <div class="order-updates-timeline">
                <?php foreach ( $notes as $note ) : ?>
                    <div class="update-item">
                        <div class="update-date">
                            <?php echo esc_html( date_i18n( 'M j, Y \a\t g:i A', strtotime( $note->comment_date ) ) ); ?>
                        </div>
                        <div class="update-content">
                            <?php echo wpautop( wptexturize( wp_kses_post( $note->comment_content ) ) ); ?>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    <?php endif; ?>

    <!-- Order Actions -->
    <div class="order-actions-section">
        <a href="<?php echo esc_url( wc_get_endpoint_url( 'orders' ) ); ?>" class="back-to-orders-btn">
            <i class="fas fa-arrow-left"></i>
            Back to Orders
        </a>

        <?php if ( $order->get_status() === 'completed' ) : ?>
            <a href="<?php echo esc_url( wp_nonce_url( add_query_arg( 'reorder', $order->get_id() ), 'woocommerce-reorder' ) ); ?>" class="reorder-btn">
                <i class="fas fa-redo"></i>
                Reorder
            </a>
        <?php endif; ?>
    </div>
</div>

<style>
.samsara-order-view {
    font-family: "Montserrat", Sans-serif;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0;
}

/* Order Header Card */
.order-header-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16px;
    padding: 2rem;
    margin-bottom: 2rem;
    color: white;
    position: relative;
    overflow: hidden;
}

.order-header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
}

.order-title {
    font-size: 2rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
    color: white;
}

.order-meta {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.order-meta span {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    opacity: 0.9;
}

.order-status-total {
    text-align: right;
}

.order-status-badge {
    display: inline-block;
    padding: 0.5rem 1rem;
    border-radius: 25px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.5rem;
    background: rgba(255,255,255,0.2);
    backdrop-filter: blur(10px);
}

.order-total {
    font-size: 2rem;
    font-weight: 700;
    color: #E2B72D;
}

/* Order Type Indicator */
.order-type-indicator {
    display: flex;
    justify-content: center;
}

.type-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border-radius: 50px;
    font-weight: 600;
    backdrop-filter: blur(10px);
}

.type-badge.digital {
    background: rgba(34, 197, 94, 0.2);
    border: 1px solid rgba(34, 197, 94, 0.3);
}

.type-badge.physical {
    background: rgba(59, 130, 246, 0.2);
    border: 1px solid rgba(59, 130, 246, 0.3);
}

.type-badge.mixed {
    background: rgba(245, 158, 11, 0.2);
    border: 1px solid rgba(245, 158, 11, 0.3);
}

/* Order Content Grid */
.order-content-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 2rem;
    margin-bottom: 2rem;
}

/* Order Sections */
.order-section {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    border: 1px solid #f1f5f9;
}

.section-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1.3rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 1.5rem 0;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid #f8fafc;
}

.section-title i {
    color: #E2B72D;
    font-size: 1.1rem;
}

/* Order Items */
.order-items-section {
    margin-bottom: 2rem;
}

.order-items-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.order-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border: 1px solid #f1f5f9;
    border-radius: 12px;
    transition: all 0.2s ease;
    position: relative;
}

.order-item:hover {
    border-color: #E2B72D;
    box-shadow: 0 2px 8px rgba(226, 183, 45, 0.1);
}

.order-item.digital-item {
    border-left: 4px solid #22c55e;
    background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
}

.order-item.physical-item {
    border-left: 4px solid #3b82f6;
    background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%);
}

.item-image {
    width: 60px;
    height: 60px;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
}

.item-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.placeholder-image {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8fafc;
    color: #64748b;
    font-size: 1.5rem;
}

.item-details {
    flex: 1;
}

.item-name {
    margin: 0 0 0.5rem 0;
    font-size: 1.1rem;
    font-weight: 600;
}

.item-name a {
    color: #1e293b;
    text-decoration: none;
    transition: color 0.2s ease;
}

.item-name a:hover {
    color: #E2B72D;
}

.item-meta {
    display: flex;
    gap: 1rem;
    font-size: 0.875rem;
    color: #64748b;
}

.item-type i {
    margin-right: 0.25rem;
}

.digital-access-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
    color: #22c55e;
    font-size: 0.875rem;
    font-weight: 500;
}

.item-price {
    font-size: 1.2rem;
    font-weight: 600;
    color: #1e293b;
}

/* Sidebar */
.order-sidebar {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.order-sidebar .order-section {
    padding: 1.25rem;
}

.order-sidebar .section-title {
    font-size: 1.1rem;
    margin-bottom: 1rem;
}

/* Payment Section */
.payment-info {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.payment-method {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem;
    background: #f8fafc;
    border-radius: 8px;
}

.payment-method .label {
    font-weight: 500;
    color: #64748b;
}

.payment-method .value {
    font-weight: 600;
    color: #1e293b;
}

.order-totals {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.total-line {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px solid #f1f5f9;
}

.total-line.total {
    font-weight: 600;
    font-size: 1.1rem;
    border-bottom: none;
    border-top: 2px solid #E2B72D;
    padding-top: 0.75rem;
    margin-top: 0.5rem;
}

/* Shipping Section */
.shipping-info {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.shipping-address {
    padding: 1rem;
    background: #f8fafc;
    border-radius: 8px;
    line-height: 1.5;
    color: #334155;
}

.shipping-method {
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
}

/* Membership Access Section */
.membership-access-info {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.access-granted,
.access-pending {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem;
    border-radius: 8px;
}

.access-granted {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    color: #166534;
}

.access-pending {
    background: #fef3c7;
    border: 1px solid #fde68a;
    color: #a16207;
}

.access-granted i,
.access-pending i {
    font-size: 1.2rem;
    margin-top: 0.1rem;
}

.access-granted strong,
.access-pending strong {
    display: block;
    margin-bottom: 0.25rem;
}

.basecamp-access-btn,
.dashboard-access-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.2s ease;
    margin-bottom: 0.5rem;
}

.basecamp-access-btn {
    background: #667eea;
    color: white;
}

.basecamp-access-btn:hover {
    background: #5a67d8;
    transform: translateY(-1px);
    text-decoration: none;
    color: white;
}

.dashboard-access-btn {
    background: #E2B72D;
    color: #000;
}

.dashboard-access-btn:hover {
    background: #d4a429;
    transform: translateY(-1px);
    text-decoration: none;
    color: #000;
}

/* Order Updates */
.order-updates-section {
    margin-bottom: 2rem;
}

.order-updates-timeline {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.update-item {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 8px;
    border-left: 4px solid #E2B72D;
}

.update-date {
    font-size: 0.875rem;
    font-weight: 600;
    color: #64748b;
    min-width: 150px;
}

.update-content {
    flex: 1;
    color: #334155;
}

.update-content p {
    margin: 0;
}

/* Order Actions */
.order-actions-section {
    display: flex;
    gap: 1rem;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    border: 1px solid #f1f5f9;
}

.back-to-orders-btn,
.reorder-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.2s ease;
}

.back-to-orders-btn {
    background: #f1f5f9;
    color: #475569;
    border: 1px solid #e2e8f0;
}

.back-to-orders-btn:hover {
    background: #e2e8f0;
    color: #334155;
    text-decoration: none;
}

.reorder-btn {
    background: #E2B72D;
    color: #000;
    border: 1px solid #E2B72D;
}

.reorder-btn:hover {
    background: #d4a429;
    transform: translateY(-1px);
    text-decoration: none;
    color: #000;
}

/* Mobile Responsive */
@media (max-width: 768px) {
    .order-header-content {
        flex-direction: column;
        gap: 1rem;
    }

    .order-status-total {
        text-align: left;
    }

    .order-content-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }

    .order-item {
        flex-direction: column;
        text-align: center;
        gap: 0.75rem;
    }

    .item-details {
        width: 100%;
    }

    .item-meta {
        justify-content: center;
    }

    .order-actions-section {
        flex-direction: column;
        gap: 1rem;
    }

    .back-to-orders-btn,
    .reorder-btn {
        width: 100%;
        justify-content: center;
    }

    .update-item {
        flex-direction: column;
        gap: 0.5rem;
    }

    .update-date {
        min-width: auto;
    }
}

@media (max-width: 480px) {
    .samsara-order-view {
        padding: 0 0.5rem;
    }

    .order-header-card {
        padding: 1.5rem;
        margin-bottom: 1rem;
    }

    .order-title {
        font-size: 1.5rem;
    }

    .order-total {
        font-size: 1.5rem;
    }

    .order-section {
        padding: 1rem;
    }
}
</style>

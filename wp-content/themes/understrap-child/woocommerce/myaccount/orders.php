<?php
/**
 * Custom Orders Template with Status Filtering
 *
 * Shows orders in a modern card layout with status filters.
 *
 * This template can be overridden by copying it to yourtheme/woocommerce/myaccount/orders.php.
 *
 * HOWEVER, on occasion WooCommerce will need to update template files and you
 * (the theme developer) will need to copy the new files to your theme to
 * maintain compatibility. We try to do this as little as possible, but it does
 * happen. When this occurs the version of the template file will be bumped and
 * the readme will list any important changes.
 *
 * @see https://woocommerce.com/document/template-structure/
 * @package WooCommerce\Templates
 * @version 9.5.0
 */

defined( 'ABSPATH' ) || exit;

// Debug: Add a simple indicator that this template is loading
echo '<!-- Custom Orders Template Loaded -->' . PHP_EOL;

// Get all user orders (increase limit for better filtering)
$user_id = get_current_user_id();
$all_orders = wc_get_orders( array(
    'customer_id' => $user_id,
    'limit' => -1, // Get all orders
    'orderby' => 'date',
    'order' => 'DESC',
) );

// Get unique order statuses for filter tabs with priority ordering
$available_statuses = array();
$status_counts = array();

foreach ( $all_orders as $order ) {
    $status = $order->get_status();
    if ( ! in_array( $status, $available_statuses ) ) {
        $available_statuses[] = $status;
    }

    if ( ! isset( $status_counts[$status] ) ) {
        $status_counts[$status] = 0;
    }
    $status_counts[$status]++;
}

// Define priority order for statuses
$priority_order = array('completed', 'cancelled', 'processing', 'pending', 'on-hold', 'refunded');
$ordered_statuses = array();

// Add statuses in priority order if they exist
foreach ( $priority_order as $priority_status ) {
    if ( in_array( $priority_status, $available_statuses ) ) {
        $ordered_statuses[] = $priority_status;
    }
}

// Add any remaining statuses not in priority list
foreach ( $available_statuses as $status ) {
    if ( ! in_array( $status, $ordered_statuses ) ) {
        $ordered_statuses[] = $status;
    }
}

$available_statuses = $ordered_statuses;

do_action( 'woocommerce_before_account_orders', !empty( $all_orders ) ); ?>

<div class="samsara-orders">
    <?php if ( ! empty( $all_orders ) ) : ?>

        <!-- Status Filter Tabs -->
        <div class="orders-filter-tabs">
            <?php
            $first_tab = true;
            foreach ( $available_statuses as $status ) :
                $is_active = ($first_tab && $status === 'completed') ? 'active' : '';
                $first_tab = false;
            ?>
                <button class="filter-tab <?php echo $is_active; ?>" data-status="<?php echo esc_attr( $status ); ?>">
                    <?php echo esc_html( wc_get_order_status_name( $status ) ); ?>
                    <span class="count"><?php echo $status_counts[$status]; ?></span>
                </button>
            <?php endforeach; ?>
            <button class="filter-tab" data-status="all">
                All Orders <span class="count"><?php echo count( $all_orders ); ?></span>
            </button>
        </div>

        <!-- Orders Container -->
        <div class="orders-container">
            <?php foreach ( $all_orders as $order ) :
                $item_count = $order->get_item_count() - $order->get_item_count_refunded();
                $order_actions = wc_get_account_orders_actions( $order );
                ?>
                <div class="order-card" data-status="<?php echo esc_attr( $order->get_status() ); ?>">
                    <div class="order-card-header">
                        <div class="order-status-indicator status-<?php echo esc_attr( $order->get_status() ); ?>"></div>
                        <div class="order-meta">
                            <div class="order-number">
                                <a href="<?php echo esc_url( $order->get_view_order_url() ); ?>">
                                    #<?php echo esc_html( $order->get_order_number() ); ?>
                                </a>
                            </div>
                            <div class="order-date">
                                <?php echo esc_html( wc_format_datetime( $order->get_date_created(), 'M j, Y' ) ); ?>
                            </div>
                        </div>
                        <div class="order-total">
                            <?php echo $order->get_formatted_order_total(); ?>
                        </div>
                    </div>

                    <div class="order-card-body">
                        <div class="order-summary">
                            <span class="item-count">
                                <?php
                                /* translators: %s: number of items */
                                echo sprintf( _n( '%s item', '%s items', $item_count, 'understrap' ), $item_count );
                                ?>
                            </span>
                        </div>

                        <!-- Order Items List -->
                        <div class="order-items-list">
                            <?php
                            $items = $order->get_items();
                            $display_count = 0;
                            $max_display = 2;

                            foreach ( $items as $item ) :
                                if ( $display_count >= $max_display ) break;
                                $product = $item->get_product();
                                if ( $product ) :
                                    $display_count++;
                                    ?>
                                    <div class="order-item">
                                        <span class="item-name"><?php echo esc_html( $item->get_name() ); ?></span>
                                        <span class="item-qty">×<?php echo esc_html( $item->get_quantity() ); ?></span>
                                    </div>
                                    <?php
                                endif;
                            endforeach;

                            if ( count( $items ) > $max_display ) :
                                $remaining = count( $items ) - $max_display;
                                ?>
                                <div class="order-item-more">
                                    <span>+<?php echo $remaining; ?> more</span>
                                </div>
                                <?php
                            endif;
                            ?>
                        </div>
                    </div>

                    <div class="order-card-footer">
                        <div class="order-status-badge status-<?php echo esc_attr( $order->get_status() ); ?>">
                            <?php echo esc_html( wc_get_order_status_name( $order->get_status() ) ); ?>
                        </div>

                        <?php if ( ! empty( $order_actions ) ) : ?>
                            <div class="order-actions-group">
                                <?php foreach ( $order_actions as $key => $action ) : ?>
                                    <a href="<?php echo esc_url( $action['url'] ); ?>"
                                       class="order-action-btn <?php echo esc_attr( $key ); ?>">
                                        <?php echo esc_html( $action['name'] ); ?>
                                    </a>
                                <?php endforeach; ?>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>

        <!-- Empty State for Filtered Results -->
        <div class="no-orders-filtered" style="display: none;">
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No orders found</h3>
                <p>No orders match the selected status.</p>
            </div>
        </div>

    <?php else : ?>
        <div class="no-orders-state">
            <div class="empty-state">
                <i class="fas fa-shopping-cart"></i>
                <h3>No orders yet</h3>
                <p>You haven't placed any orders yet. Start shopping to see your orders here.</p>
                <a href="<?php echo esc_url( apply_filters( 'woocommerce_return_to_shop_redirect', wc_get_page_permalink( 'shop' ) ) ); ?>"
                   class="shop-btn">
                    <i class="fas fa-store"></i>
                    Browse Products
                </a>
            </div>
        </div>
    <?php endif; ?>
</div>

<style>
.samsara-orders {
    font-family: "Montserrat", Sans-serif;
    max-width: 1200px;
    margin: 0 auto;
}

/* Filter Tabs - Modern pill design */
.orders-filter-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-bottom: 2rem;
    padding: 1rem 0;
}

.filter-tab {
    background: #ffffff;
    border: 1px solid #e1e5e9;
    border-radius: 50px;
    padding: 0.6rem 1.2rem;
    font-family: "Montserrat", Sans-serif;
    font-weight: 500;
    font-size: 0.875rem;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.filter-tab:hover {
    background: #f8fafc;
    border-color: #E2B72D;
    color: #475569;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.filter-tab.active {
    background: #E2B72D;
    border-color: #E2B72D;
    color: #000;
    box-shadow: 0 2px 8px rgba(226, 183, 45, 0.25);
}

.filter-tab .count {
    background: rgba(100, 116, 139, 0.1);
    padding: 0.15rem 0.5rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    min-width: 1.5rem;
    text-align: center;
}

.filter-tab.active .count {
    background: rgba(0,0,0,0.15);
    color: #000;
}

/* Orders Container */
.orders-container {
    display: grid;
    gap: 1rem;
}

/* Order Cards - Clean minimalist design */
.order-card {
    background: #ffffff;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    overflow: hidden;
    transition: all 0.2s ease;
    position: relative;
}

.order-card:hover {
    border-color: #cbd5e1;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    transform: translateY(-1px);
}

/* Order Card Header */
.order-card-header {
    display: flex;
    align-items: center;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid #f1f5f9;
    background: #fafbfc;
}

.order-status-indicator {
    width: 4px;
    height: 40px;
    border-radius: 2px;
    margin-right: 1rem;
    flex-shrink: 0;
}

.order-meta {
    flex: 1;
}

.order-number a {
    font-size: 1.1rem;
    font-weight: 600;
    color: #1e293b;
    text-decoration: none;
    transition: color 0.2s ease;
}

.order-number a:hover {
    color: #E2B72D;
}

.order-date {
    color: #64748b;
    font-size: 0.875rem;
    margin-top: 0.25rem;
}

.order-total {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1e293b;
}

/* Order Card Body */
.order-card-body {
    padding: 1.5rem;
}

.order-status-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.375rem 0.875rem;
    border-radius: 50px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.025em;
    align-self: center;
}

.order-summary {
    margin-bottom: 1.25rem;
}

.item-count {
    color: #64748b;
    font-size: 0.875rem;
    font-weight: 500;
}

/* Order Items List */
.order-items-list {
    space-y: 0.5rem;
}

.order-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid #f1f5f9;
}

.order-item:last-child {
    border-bottom: none;
}

.item-name {
    color: #334155;
    font-size: 0.875rem;
    font-weight: 500;
    flex: 1;
}

.item-qty {
    color: #64748b;
    font-size: 0.875rem;
    font-weight: 600;
    margin-left: 1rem;
}

.order-item-more {
    padding: 0.5rem 0;
    text-align: center;
}

.order-item-more span {
    color: #E2B72D;
    font-size: 0.8rem;
    font-weight: 600;
    font-style: italic;
}

/* Order Card Footer */
.order-card-footer {
    padding: 1rem 1.5rem;
    background: #f8fafc;
    border-top: 1px solid #f1f5f9;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.order-actions-group {
    display: flex;
    gap: 0.75rem;
}

.order-action-btn {
    padding: 0.5rem 1rem;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.025em;
    transition: all 0.2s ease;
    border: 1px solid transparent;
}

.order-action-btn.view {
    background: #E2B72D;
    color: #000;
    border-color: #E2B72D;
}

.order-action-btn.view:hover {
    background: #d4a429;
    border-color: #d4a429;
    transform: translateY(-1px);
    text-decoration: none;
    color: #000;
}

.order-action-btn.cancel {
    background: #ef4444;
    color: white;
    border-color: #ef4444;
}

.order-action-btn.cancel:hover {
    background: #dc2626;
    border-color: #dc2626;
    transform: translateY(-1px);
    text-decoration: none;
    color: white;
}

/* Status Colors - Updated for new design */
.status-completed {
    background: #dcfce7;
    color: #166534;
    border: 1px solid #bbf7d0;
}

.order-status-indicator.status-completed {
    background: #22c55e;
}

.status-processing {
    background: #fef3c7;
    color: #a16207;
    border: 1px solid #fde68a;
}

.order-status-indicator.status-processing {
    background: #f59e0b;
}

.status-pending {
    background: #fecaca;
    color: #991b1b;
    border: 1px solid #fca5a5;
}

.order-status-indicator.status-pending {
    background: #ef4444;
}

.status-on-hold {
    background: #e0f2fe;
    color: #0c4a6e;
    border: 1px solid #bae6fd;
}

.order-status-indicator.status-on-hold {
    background: #0ea5e9;
}

.status-cancelled {
    background: #f3f4f6;
    color: #374151;
    border: 1px solid #d1d5db;
}

.order-status-indicator.status-cancelled {
    background: #6b7280;
}

.status-refunded {
    background: #f3e8ff;
    color: #6b21a8;
    border: 1px solid #e9d5ff;
}

.order-status-indicator.status-refunded {
    background: #a855f7;
}

/* Empty States */
.no-orders-state,
.no-orders-filtered {
    text-align: center;
    padding: 4rem 2rem;
}

.empty-state {
    max-width: 400px;
    margin: 0 auto;
}

.empty-state i {
    font-size: 4rem;
    color: #E2B72D;
    margin-bottom: 1rem;
}

.empty-state h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 0.5rem;
}

.empty-state p {
    color: #666;
    margin-bottom: 1.5rem;
}

.shop-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: #E2B72D;
    color: #000;
    padding: 0.8rem 1.5rem;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s ease;
}

.shop-btn:hover {
    background: #d4a429;
    transform: translateY(-2px);
    text-decoration: none;
    color: #000;
}

/* Mobile Responsive */
@media (max-width: 768px) {
    .orders-filter-tabs {
        flex-direction: column;
        align-items: stretch;
    }

    .filter-tab {
        justify-content: center;
        margin-bottom: 0.5rem;
    }

    .order-card-header {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
        padding: 1rem;
    }

    .order-status-indicator {
        display: none;
    }

    .order-card-footer {
        flex-direction: column;
        gap: 1rem;
        align-items: center;
    }

    .order-actions-group {
        width: 100%;
        justify-content: center;
    }

    .order-action-btn {
        text-align: center;
        flex: 1;
    }
}
</style>

<script>
jQuery(document).ready(function($) {
    // Status filtering functionality
    $('.filter-tab').on('click', function() {
        var status = $(this).data('status');

        // Update active tab
        $('.filter-tab').removeClass('active');
        $(this).addClass('active');

        // Filter orders
        if (status === 'all') {
            $('.order-card').show();
            $('.no-orders-filtered').hide();
        } else {
            $('.order-card').hide();
            var visibleCards = $('.order-card[data-status="' + status + '"]');
            visibleCards.show();

            // Show empty state if no cards match
            if (visibleCards.length === 0) {
                $('.no-orders-filtered').show();
            } else {
                $('.no-orders-filtered').hide();
            }
        }
    });

    // Set default view to "completed" on page load
    $(document).ready(function() {
        var $completedTab = $('.filter-tab[data-status="completed"]');
        if ($completedTab.length > 0) {
            // Hide all cards first
            $('.order-card').hide();

            // Show only completed orders
            var completedCards = $('.order-card[data-status="completed"]');
            completedCards.show();

            // Show empty state if no completed orders
            if (completedCards.length === 0) {
                $('.no-orders-filtered').show();
            } else {
                $('.no-orders-filtered').hide();
            }
        }
    });
});
</script>

<?php
do_action( 'woocommerce_after_account_orders', !empty( $all_orders ) );

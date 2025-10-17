<?php
/**
 * Payment Methods Component for Account Dashboard
 *
 * @package Understrap-Child
 */

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

// Get current user's saved payment methods
$user_id = get_current_user_id();
$saved_methods = wc_get_customer_saved_methods_list( $user_id );
$has_methods = (bool) $saved_methods;

// Get available payment gateways
$available_gateways = WC()->payment_gateways->get_available_payment_gateways();

// Check if we can add new payment methods
$can_add_payment_methods = ! empty( $available_gateways );
?>

<div class="section-header">
    <h2>Payment Methods</h2>
    <p>Manage your saved payment methods and billing information</p>
</div>

    <div class="row">
        <div class="col-md-12">
            <?php if ( $has_methods ) : ?>
                <!-- Saved Payment Methods Table -->
                <div class="payment-methods-section mb-4">
                    <h3>Saved Payment Methods</h3>

                    <div class="table-responsive">
                        <table class="table woocommerce-MyAccount-paymentMethods shop_table shop_table_responsive account-payment-methods-table">
                            <thead>
                                <tr>
                                    <?php foreach ( wc_get_account_payment_methods_columns() as $column_id => $column_name ) : ?>
                                        <th class="woocommerce-PaymentMethod woocommerce-PaymentMethod--<?php echo esc_attr( $column_id ); ?> payment-method-<?php echo esc_attr( $column_id ); ?>">
                                            <span class="nobr"><?php echo esc_html( $column_name ); ?></span>
                                        </th>
                                    <?php endforeach; ?>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ( $saved_methods as $type => $methods ) : ?>
                                    <?php foreach ( $methods as $method ) : ?>
                                        <tr class="payment-method<?php echo ! empty( $method['is_default'] ) ? ' default-payment-method' : ''; ?>">
                                            <?php foreach ( wc_get_account_payment_methods_columns() as $column_id => $column_name ) : ?>
                                                <td class="woocommerce-PaymentMethod woocommerce-PaymentMethod--<?php echo esc_attr( $column_id ); ?> payment-method-<?php echo esc_attr( $column_id ); ?>" data-title="<?php echo esc_attr( $column_name ); ?>">
                                                    <?php
                                                    if ( has_action( 'woocommerce_account_payment_methods_column_' . $column_id ) ) {
                                                        do_action( 'woocommerce_account_payment_methods_column_' . $column_id, $method );
                                                    } elseif ( 'method' === $column_id ) {
                                                        if ( ! empty( $method['method']['last4'] ) ) {
                                                            /* translators: 1: credit card type 2: last 4 digits */
                                                            echo sprintf( esc_html__( '%1$s ending in %2$s', 'woocommerce' ), esc_html( wc_get_credit_card_type_label( $method['method']['brand'] ) ), esc_html( $method['method']['last4'] ) );
                                                        } else {
                                                            echo esc_html( wc_get_credit_card_type_label( $method['method']['brand'] ) );
                                                        }

                                                        // Show default badge
                                                        if ( ! empty( $method['is_default'] ) ) {
                                                            echo '<span class="badge badge-primary ml-2">Default</span>';
                                                        }
                                                    } elseif ( 'expires' === $column_id ) {
                                                        echo esc_html( $method['expires'] );
                                                    } elseif ( 'actions' === $column_id ) {
                                                        foreach ( $method['actions'] as $key => $action ) {
                                                            echo '<a href="' . esc_url( $action['url'] ) . '" class="btn btn-sm btn-outline-primary ' . sanitize_html_class( $key ) . '">' . esc_html( $action['name'] ) . '</a>&nbsp;';
                                                        }
                                                    }
                                                    ?>
                                                </td>
                                            <?php endforeach; ?>
                                        </tr>
                                    <?php endforeach; ?>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            <?php else : ?>
                <!-- No Payment Methods -->
                <div class="no-payment-methods-section mb-4">
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle"></i>
                        <strong>No saved payment methods found.</strong>
                        <p class="mb-0">Add a payment method to make future purchases faster and easier.</p>
                    </div>
                </div>
            <?php endif; ?>

            <!-- Add Payment Method Section -->
            <?php if ( $can_add_payment_methods ) : ?>
                <div class="add-payment-method-section">
                    <h3>Add New Payment Method</h3>
                    <p>Securely save a new payment method for future purchases.</p>

                    <div class="payment-gateway-info mb-3">
                        <?php
                        // Show information about supported payment methods
                        if ( isset( $available_gateways['stripe'] ) ) : ?>
                            <div class="gateway-info stripe-info">
                                <div class="row align-items-center">
                                    <div class="col-auto">
                                        <i class="fab fa-stripe fa-2x text-primary"></i>
                                    </div>
                                    <div class="col">
                                        <h5 class="mb-1">Stripe Secure Payments</h5>
                                        <p class="mb-0 text-muted">We accept all major credit cards and process payments securely through Stripe.</p>
                                    </div>
                                </div>
                            </div>
                        <?php endif; ?>
                    </div>

                    <a href="<?php echo esc_url( wc_get_endpoint_url( 'add-payment-method' ) ); ?>" class="btn btn-primary">
                        <i class="fas fa-plus"></i> Add Payment Method
                    </a>
                </div>
            <?php else : ?>
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>Payment methods are not currently available.</strong>
                    <p class="mb-0">Please contact support if you need to add a payment method.</p>
                </div>
            <?php endif; ?>

            <!-- Billing Information Link -->
            <div class="billing-info-section mt-4">
                <h3>Billing Information</h3>
                <p>Update your billing address and contact information.</p>
                <a href="<?php echo esc_url( wc_get_endpoint_url( 'edit-address', 'billing' ) ); ?>" class="btn btn-outline-primary">
                    <i class="fas fa-edit"></i> Edit Billing Address
                </a>
            </div>
        </div>
    </div>

<style>
.account-payment-methods-table {
    background: #fff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.account-payment-methods-table th {
    background: #f8f9fa;
    border: none;
    font-weight: 600;
    color: #333;
    padding: 15px;
}

.account-payment-methods-table td {
    border: none;
    padding: 15px;
    vertical-align: middle;
}

.account-payment-methods-table tbody tr {
    border-bottom: 1px solid #eee;
}

.account-payment-methods-table tbody tr:last-child {
    border-bottom: none;
}

.default-payment-method {
    background: #f8f9ff;
}

.badge-primary {
    background: #E2B72D;
    color: #000;
    font-size: 0.75rem;
    padding: 4px 8px;
    border-radius: 12px;
}

.gateway-info {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 20px;
    border-left: 4px solid #E2B72D;
}

.btn-primary {
    background: #E2B72D;
    border-color: #E2B72D;
    color: #000;
    font-weight: 600;
}

.btn-primary:hover {
    background: #d4a429;
    border-color: #d4a429;
    color: #000;
}

.btn-outline-primary {
    border-color: #E2B72D;
    color: #E2B72D;
    font-weight: 600;
}

.btn-outline-primary:hover {
    background: #E2B72D;
    border-color: #E2B72D;
    color: #000;
}

.alert {
    border-radius: 8px;
    padding: 15px 20px;
}

.alert-info {
    background: #e7f3ff;
    border-color: #b3d9ff;
    color: #0066cc;
}

.alert-warning {
    background: #fff3cd;
    border-color: #ffeaa7;
    color: #856404;
}

.no-payment-methods-section,
.add-payment-method-section,
.billing-info-section {
    background: #fff;
    border-radius: 8px;
    padding: 25px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    margin-bottom: 20px;
}

.section-header h2 {
    color: #333;
    font-family: "Montserrat", Sans-serif;
    font-weight: 700;
    margin-bottom: 10px;
}

.section-header p {
    color: #666;
    font-family: "Montserrat", Sans-serif;
    margin-bottom: 30px;
}

/* Responsive table */
@media (max-width: 768px) {
    .account-payment-methods-table,
    .account-payment-methods-table thead,
    .account-payment-methods-table tbody,
    .account-payment-methods-table th,
    .account-payment-methods-table td,
    .account-payment-methods-table tr {
        display: block;
    }

    .account-payment-methods-table thead tr {
        position: absolute;
        top: -9999px;
        left: -9999px;
    }

    .account-payment-methods-table tr {
        border: 1px solid #ccc;
        margin-bottom: 10px;
        border-radius: 8px;
        overflow: hidden;
    }

    .account-payment-methods-table td {
        border: none;
        position: relative;
        padding-left: 50%;
        text-align: right;
    }

    .account-payment-methods-table td:before {
        content: attr(data-title) ": ";
        position: absolute;
        left: 15px;
        width: 45%;
        text-align: left;
        font-weight: 600;
        color: #333;
    }
}
</style>
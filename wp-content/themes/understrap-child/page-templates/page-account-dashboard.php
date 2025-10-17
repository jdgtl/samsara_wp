<?php
/**
 * Custom My Account Dashboard Template
 *
 * Template Name: Account Dashboard
 *
 * @package Understrap-Child
 */

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

// Check if user is logged in - show login form if not
if ( ! is_user_logged_in() ) {
    get_header();
    ?>
    <div class="wrapper" id="login-wrapper">
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-md-6 col-lg-4">
                    <div class="login-form-container">
                        <div class="login-header">
                            <h2>Member Login</h2>
                            <p>Please log in to access your account dashboard</p>
                        </div>

                        <?php
                        // Display WooCommerce login form
                        if ( function_exists( 'woocommerce_login_form' ) ) {
                            woocommerce_login_form( array( 'redirect' => get_permalink() ) );
                        } else {
                            // Fallback to WordPress login form
                            wp_login_form( array( 'redirect' => get_permalink() ) );
                        }
                        ?>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <style>
    #login-wrapper {
        min-height: 70vh;
        display: flex;
        align-items: center;
        background: #f8f9fa;
    }

    .login-form-container {
        background: #fff;
        border-radius: 15px;
        padding: 3rem;
        box-shadow: 0px 5px 25px rgba(0, 0, 0, 0.1);
        border: 1px solid #f0f0f0;
        width: 100%;
        max-width: 100%;
    }

    .login-form-container * {
        box-sizing: border-box !important;
    }

    .login-header {
        text-align: center;
        margin-bottom: 2rem;
    }

    .login-header h2 {
        font-family: "Montserrat", Sans-serif;
        font-weight: 700;
        color: #333;
        margin-bottom: 0.5rem;
    }

    .login-header p {
        font-family: "Montserrat", Sans-serif;
        color: #666;
        margin-bottom: 0;
    }

    .woocommerce-form-login {
        margin: 0 !important;
        width: 100% !important;
        max-width: 100% !important;
    }

    .woocommerce-form-login * {
        box-sizing: border-box !important;
    }

    .woocommerce-form-login .form-row,
    .woocommerce-form-login .form-row-wide,
    .woocommerce-form-login .form-row-first,
    .woocommerce-form-login .form-row-last {
        width: 100% !important;
        margin-bottom: 1rem !important;
        float: none !important;
        clear: both !important;
    }

    .woocommerce-form-login p {
        margin-bottom: 1.5rem;
        clear: both;
    }

    .woocommerce-form-login label {
        display: block;
        margin-bottom: 0.5rem;
        font-family: "Montserrat", Sans-serif;
        font-weight: 600;
        color: #333;
    }

    .woocommerce-form-login input[type="text"],
    .woocommerce-form-login input[type="password"],
    .woocommerce-form-login input[type="email"],
    .woocommerce-form-login input#username,
    .woocommerce-form-login input#password,
    .woocommerce-form-login .input-text,
    .woocommerce-form-login .form-control {
        width: 100% !important;
        max-width: 100% !important;
        min-width: 100% !important;
        padding: 0.75rem !important;
        border: 2px solid #e0e0e0 !important;
        border-radius: 8px !important;
        font-family: "Montserrat", Sans-serif !important;
        box-sizing: border-box !important;
        display: block !important;
        margin: 0 !important;
        float: none !important;
    }

    .woocommerce-form-login input[type="text"]:focus,
    .woocommerce-form-login input[type="password"]:focus,
    .woocommerce-form-login input[type="email"]:focus {
        border-color: #E2B72D !important;
        outline: none !important;
    }

    .woocommerce-form-login .woocommerce-form-login__rememberme {
        margin: 1rem 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .woocommerce-form-login input[type="checkbox"] {
        width: auto !important;
        margin: 0 !important;
    }

    .woocommerce-form-login input[type="submit"],
    .woocommerce-form-login button[type="submit"],
    .woocommerce-form-login .woocommerce-button,
    .woocommerce-form-login .btn,
    .woocommerce-form-login .btn-outline-primary,
    .woocommerce-form-login button[name="login"] {
        background: #E2B72D !important;
        color: #000 !important;
        border: none !important;
        padding: 0.75rem 1.5rem !important;
        border-radius: 25px !important;
        font-family: "Montserrat", Sans-serif !important;
        font-weight: 600 !important;
        cursor: pointer !important;
        transition: all 0.3s ease !important;
        width: 100% !important;
        max-width: 100% !important;
        min-width: 100% !important;
        margin-top: 1rem !important;
        box-sizing: border-box !important;
        display: block !important;
        float: none !important;
    }

    .woocommerce-form-login input[type="submit"]:hover {
        background: #d4a429 !important;
        transform: translateY(-1px);
    }

    .woocommerce-form-login .lost_password {
        text-align: center;
        margin-top: 1rem;
    }

    .woocommerce-form-login .lost_password a {
        color: #E2B72D;
        text-decoration: none;
        font-family: "Montserrat", Sans-serif;
    }

    .woocommerce-form-login .lost_password a:hover {
        color: #d4a429;
        text-decoration: underline;
    }

    /* Final override to ensure everything is full width */
    .login-form-container .woocommerce-form-login input,
    .login-form-container .woocommerce-form-login button,
    .login-form-container input,
    .login-form-container button {
        width: 100% !important;
        max-width: 100% !important;
        min-width: 100% !important;
        box-sizing: border-box !important;
        display: block !important;
        float: none !important;
        margin-left: 0 !important;
        margin-right: 0 !important;
    }

    .login-form-container .woocommerce-form-login input[type="checkbox"] {
        width: auto !important;
        min-width: auto !important;
        display: inline-block !important;
    }
    </style>

    <?php
    get_footer();
    exit;
}

get_header();

$current_user = wp_get_current_user();
$user_name = $current_user->display_name;
?>

<div class="wrapper" id="account-dashboard-wrapper">

    <!-- Main Content -->
    <div class="container" id="content" tabindex="-1">
        <div class="row">
            <main class="site-main col-md-12" id="main">

                <!-- Account Navigation -->
                <div class="account-navigation-section">
                    <div class="row account-nav-grid">

                        <!-- Dashboard -->
                        <div class="col-lg-5ths col-md-6 col-sm-6 mb-3">
                            <div class="account-nav-item active" data-target="dashboard">
                                <div class="nav-icon">
                                    <i class="fas fa-tachometer-alt"></i>
                                </div>
                                <h4>Dashboard</h4>
                                <p>Overview</p>
                            </div>
                        </div>

                        <!-- Orders -->
                        <div class="col-lg-5ths col-md-6 col-sm-6 mb-3">
                            <div class="account-nav-item" data-target="orders">
                                <div class="nav-icon">
                                    <i class="fas fa-shopping-bag"></i>
                                </div>
                                <h4>Orders</h4>
                                <p>History</p>
                            </div>
                        </div>

                        <!-- Subscriptions -->
                        <div class="col-lg-5ths col-md-6 col-sm-6 mb-3">
                            <div class="account-nav-item" data-target="subscriptions">
                                <div class="nav-icon">
                                    <i class="fas fa-sync-alt"></i>
                                </div>
                                <h4>Subscriptions</h4>
                                <p>Manage</p>
                            </div>
                        </div>

                        <!-- Payments -->
                        <div class="col-lg-5ths col-md-6 col-sm-6 mb-3">
                            <div class="account-nav-item" data-target="payments">
                                <div class="nav-icon">
                                    <i class="fas fa-credit-card"></i>
                                </div>
                                <h4>Payments</h4>
                                <p>Update</p>
                            </div>
                        </div>

                        <!-- Account -->
                        <div class="col-lg-5ths col-md-6 col-sm-6 mb-3">
                            <div class="account-nav-item" data-target="edit-account">
                                <div class="nav-icon">
                                    <i class="fas fa-user-edit"></i>
                                </div>
                                <h4>Account</h4>
                                <p>Details</p>
                            </div>
                        </div>

                    </div>

                    <!-- Mobile Navigation -->
                    <div class="mobile-nav-container">
                        <div class="mobile-nav-item active" data-target="dashboard">
                            <div class="nav-icon">
                                <i class="fas fa-tachometer-alt"></i>
                            </div>
                            <span class="nav-label">Dashboard</span>
                        </div>
                        <div class="mobile-nav-item" data-target="orders">
                            <div class="nav-icon">
                                <i class="fas fa-shopping-bag"></i>
                            </div>
                            <span class="nav-label">Orders</span>
                        </div>
                        <div class="mobile-nav-item" data-target="subscriptions">
                            <div class="nav-icon">
                                <i class="fas fa-sync-alt"></i>
                            </div>
                            <span class="nav-label">Subscriptions</span>
                        </div>
                        <div class="mobile-nav-item" data-target="payments">
                            <div class="nav-icon">
                                <i class="fas fa-credit-card"></i>
                            </div>
                            <span class="nav-label">Payments</span>
                        </div>
                        <div class="mobile-nav-item" data-target="edit-account">
                            <div class="nav-icon">
                                <i class="fas fa-user-edit"></i>
                            </div>
                            <span class="nav-label">Account</span>
                        </div>
                    </div>
                </div>

                <!-- Native WooCommerce My Account Content (Hidden by default) -->
                <div id="woocommerce-native-content" style="display: none;">
                    <?php echo do_shortcode('[woocommerce_my_account]'); ?>
                </div>

            </main>
        </div>
    </div>

    <!-- Account Content Sections -->

<!-- Custom CSS for Account Dashboard -->
<style>
/* Fix wrapper padding issue */
#account-dashboard-wrapper {
    padding: 0 !important;
    margin: 0 !important;
}

/* Account Navigation - Add proper top spacing */
.account-navigation-section {
    margin: 3rem 0 2rem 0;
    position: relative;
    z-index: 10;
    padding-top: 2rem;
}

/* Custom 5-column grid for equal width navigation */
.col-lg-5ths {
    width: 20%;
    flex: 0 0 20%;
    max-width: 20%;
}

/* Desktop/Tablet Navigation - Card Style */
.account-nav-grid {
    margin: 0 -3px !important;
}

.account-nav-grid [class*="col-"] {
    padding-left: 3px !important;
    padding-right: 3px !important;
}

.account-nav-item {
    background-color: #FFFFFF;
    border-radius: 5px;
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.14);
    margin: 0 !important;
    padding: 20px 15px;
    text-align: center;
    transition: background 0.3s, border 0.3s, border-radius 0.3s, box-shadow 0.3s;
    cursor: pointer;
    min-height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.account-nav-item:hover {
    box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.2);
    transform: translateY(-2px);
}

.account-nav-item.active {
    background-color: #E2B72D;
    color: #000000;
}

.account-nav-item.active:hover {
    background-color: #d4a429;
}

.nav-icon {
    margin-bottom: 15px;
}

.nav-icon i {
    font-size: 2rem;
    color: var(--e-global-color-accent, #E2B72D);
    margin: 0;
}

.account-nav-item.active .nav-icon i {
    color: #000000;
}

.account-nav-item h4 {
    font-family: "Montserrat", Sans-serif !important;
    font-weight: 600 !important;
    margin: 0 0 8px 0 !important;
    font-size: 1.5rem !important;
    word-wrap: break-word;
    hyphens: auto;
    text-align: center;
}

.account-nav-item p {
    font-family: "Montserrat", Sans-serif !important;
    font-size: 0.9rem !important;
    margin: 0 !important;
    opacity: 0.8;
    word-wrap: break-word;
    hyphens: auto;
    text-align: center;
    line-height: 1.2;
}

.account-nav-item.active p {
    color: #000000;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
    /* Reduce navigation icon size for tablets and smaller desktops */
    .nav-icon i {
        font-size: 1.5rem !important;
    }

    /* Reduce navigation text sizes */
    .account-nav-item h4 {
        font-size: 1.25rem !important;
    }

    .account-nav-item p {
        font-size: 0.85rem !important;
    }
}

/* Hide mobile nav on desktop/tablet */
.mobile-nav-container {
    display: none;
}

/* Mobile Navigation - Bottom Fixed with Updated Design */
@media (max-width: 768px) {
    /* Hide desktop navigation on mobile */
    .account-nav-grid {
        display: none;
    }

    /* Show mobile navigation */
    .mobile-nav-container {
        display: flex;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: #f8f9fa;
        z-index: 1000;
        padding: 0;
        margin: 0;
        border-top: 1px solid #e9ecef;
    }

    .mobile-nav-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 12px 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        background: #f8f9fa;
        color: #999;
        position: relative;
        border-right: 1px inset #e0e0e0;
    }

    .mobile-nav-item:last-child {
        border-right: none;
    }

    .mobile-nav-item:before {
        content: '';
        position: absolute;
        top: 8px;
        bottom: 8px;
        right: 0;
        width: 1px;
        background: linear-gradient(to bottom, transparent 0%, #d0d0d0 20%, #d0d0d0 80%, transparent 100%);
        box-shadow: inset -1px 0 0 rgba(255,255,255,0.5);
    }

    .mobile-nav-item:last-child:before {
        display: none;
    }

    .mobile-nav-item.active {
        background: rgba(226, 183, 45, 0.15);
        color: #333;
    }

    .mobile-nav-item .nav-icon {
        margin-bottom: 4px;
    }

    .mobile-nav-item .nav-icon i {
        font-size: 1.3rem;
        color: inherit;
    }

    .mobile-nav-item .nav-label {
        font-family: "Montserrat", Sans-serif;
        font-size: 0.6rem;
        font-weight: 500;
        text-align: center;
        line-height: 1.1;
    }

    /* Add bottom padding to content to account for fixed nav */

    .training-plans-section {
        padding-bottom: 100px; /* Extra padding for mobile nav */
    }

    /* Reset navigation positioning */
    .account-navigation-section {
        margin: 2rem 0;
        position: relative;
    }
}


/* WooCommerce Content Styling - Full Width */
.account-content-section {
    background: transparent !important;
    padding: 2rem 0 !important;
    margin: 1rem 0 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    width: 100% !important;
    max-width: 100% !important;
}

.account-content-section .woocommerce-MyAccount-content {
    background: transparent !important;
    padding: 0 !important;
    margin: 0 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    width: 100% !important;
    max-width: 100% !important;
}

/* Force full width on all content elements */
.account-content-section > div,
.account-content-section .woocommerce,
.account-content-section .woocommerce-account,
.account-content-section form,
.account-content-section table,
.account-content-section .woocommerce-orders-table {
    background: transparent !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
}

/* Ensure container uses full width */
.container #content {
    width: 100% !important;
    max-width: 100% !important;
    padding-left: 15px !important;
    padding-right: 15px !important;
}

/* Force main content to use full width */
.site-main {
    width: 100% !important;
    max-width: 100% !important;
}

/* Modern WooCommerce Content Styling - Flat Design with Samsara Branding */

/* Section Headers */
.account-content-section h2 {
    font-family: "Montserrat", Sans-serif !important;
    font-weight: 600 !important;
    /* Removed font-size to inherit from theme's typography scale */
    color: #333 !important;
    margin-bottom: 2rem !important;
    padding-bottom: 0.5rem !important;
    border-bottom: 3px solid #E2B72D !important;
    display: inline-block !important;
}

/* Modern Orders Table */
.account-content-section .woocommerce-orders-table,
.account-content-section .woocommerce-table {
    background: #fff !important;
    border-radius: 8px !important;
    box-shadow: 0 2px 10px rgba(0,0,0,0.08) !important;
    border: none !important;
    overflow: hidden !important;
    margin: 1rem 0 !important;
}

.account-content-section .woocommerce-orders-table thead,
.account-content-section .woocommerce-table thead {
    background: #6c757d !important;
    color: #fff !important;
}

.account-content-section .woocommerce-orders-table th,
.account-content-section .woocommerce-table th {
    font-family: "Montserrat", Sans-serif !important;
    font-weight: 600 !important;
    font-size: 0.9rem !important;
    text-transform: uppercase !important;
    letter-spacing: 0.5px !important;
    padding: 1.2rem 1rem !important;
    border: none !important;
    color: #fff !important;
    background: transparent !important;
}

.account-content-section .woocommerce-orders-table td,
.account-content-section .woocommerce-table td {
    font-family: "Montserrat", Sans-serif !important;
    font-size: 0.9rem !important;
    padding: 1rem !important;
    border: none !important;
    border-bottom: 1px solid #f5f5f5 !important;
    vertical-align: middle !important;
    color: #333 !important;
}

.account-content-section .woocommerce-orders-table tr:hover td,
.account-content-section .woocommerce-table tr:hover td {
    background-color: #f8f9fa !important;
    transition: background-color 0.3s ease !important;
}

/* Alternating row colors for tables with multiple rows */
.account-content-section .woocommerce-orders-table tbody tr:nth-child(even),
.account-content-section .woocommerce-table tbody tr:nth-child(even) {
    background-color: #f9f9f9 !important;
}

.account-content-section .woocommerce-orders-table tbody tr:nth-child(odd),
.account-content-section .woocommerce-table tbody tr:nth-child(odd) {
    background-color: #ffffff !important;
}

/* Order Status Badges */
.account-content-section .woocommerce-orders-table .order-status mark,
.account-content-section .woocommerce-table .order-status mark {
    background: transparent !important;
    padding: 0.4rem 1rem !important;
    border-radius: 20px !important;
    font-family: "Montserrat", Sans-serif !important;
    font-weight: 500 !important;
    font-size: 0.75rem !important;
    text-transform: uppercase !important;
    letter-spacing: 0.5px !important;
    border: 2px solid !important;
}

/* Status Colors */
.account-content-section .order-status .status-completed,
.account-content-section .order-status mark[class*="completed"] {
    color: #155724 !important;
    background-color: #d4edda !important;
    border-color: #c3e6cb !important;
}

.account-content-section .order-status .status-processing,
.account-content-section .order-status mark[class*="processing"] {
    color: #856404 !important;
    background-color: #fff3cd !important;
    border-color: #ffeaa7 !important;
}

.account-content-section .order-status .status-failed,
.account-content-section .order-status mark[class*="failed"] {
    color: #721c24 !important;
    background-color: #f8d7da !important;
    border-color: #f5c6cb !important;
}

.account-content-section .order-status .status-on-hold,
.account-content-section .order-status mark[class*="hold"] {
    color: #0c5460 !important;
    background-color: #d1ecf1 !important;
    border-color: #bee5eb !important;
}

/* Action Buttons */
.account-content-section .woocommerce-orders-table .woocommerce-button,
.account-content-section .woocommerce-table .woocommerce-button,
.account-content-section .button {
    background: transparent !important;
    color: #E2B72D !important;
    border: 2px solid #E2B72D !important;
    padding: 0.5rem 1rem !important;
    border-radius: 5px !important;
    font-family: "Montserrat", Sans-serif !important;
    font-weight: 500 !important;
    font-size: 0.8rem !important;
    text-transform: uppercase !important;
    letter-spacing: 0.3px !important;
    transition: all 0.3s ease !important;
    margin: 0.2rem !important;
    text-decoration: none !important;
}

.account-content-section .woocommerce-orders-table .woocommerce-button:hover,
.account-content-section .woocommerce-table .woocommerce-button:hover,
.account-content-section .button:hover {
    background: #E2B72D !important;
    color: #000 !important;
    border-color: #d4a429 !important;
    transform: translateY(-1px) !important;
    box-shadow: 0 2px 5px rgba(226, 183, 45, 0.3) !important;
}

/* Order Number Links */
.account-content-section .woocommerce-orders-table a,
.account-content-section .woocommerce-table a {
    color: #E2B72D !important;
    font-weight: 600 !important;
    text-decoration: none !important;
}

.account-content-section .woocommerce-orders-table a:hover,
.account-content-section .woocommerce-table a:hover {
    color: #d4a429 !important;
    text-decoration: underline !important;
}

/* Responsive Table */
@media (max-width: 768px) {
    .account-content-section .woocommerce-orders-table,
    .account-content-section .woocommerce-table {
        font-size: 0.8rem !important;
    }

    .account-content-section .woocommerce-orders-table th,
    .account-content-section .woocommerce-orders-table td,
    .account-content-section .woocommerce-table th,
    .account-content-section .woocommerce-table td {
        padding: 0.8rem 0.5rem !important;
    }
}

/* Modern Forms Styling */
.account-content-section .woocommerce-form-row,
.account-content-section .form-row {
    margin-bottom: 1.5rem !important;
}

.account-content-section label {
    font-family: "Montserrat", Sans-serif !important;
    font-weight: 600 !important;
    color: #333 !important;
    font-size: 0.9rem !important;
    text-transform: uppercase !important;
    letter-spacing: 0.3px !important;
    margin-bottom: 0.5rem !important;
    display: block !important;
}

.account-content-section input[type="text"],
.account-content-section input[type="email"],
.account-content-section input[type="password"],
.account-content-section input[type="tel"],
.account-content-section select,
.account-content-section textarea {
    width: 100% !important;
    padding: 0.8rem 1rem !important;
    border: 2px solid #e1e5e9 !important;
    border-radius: 5px !important;
    font-family: "Montserrat", Sans-serif !important;
    font-size: 0.9rem !important;
    background-color: #fff !important;
    transition: all 0.3s ease !important;
}

.account-content-section input[type="text"]:focus,
.account-content-section input[type="email"]:focus,
.account-content-section input[type="password"]:focus,
.account-content-section input[type="tel"]:focus,
.account-content-section select:focus,
.account-content-section textarea:focus {
    border-color: #E2B72D !important;
    box-shadow: 0 0 0 3px rgba(226, 183, 45, 0.1) !important;
    outline: none !important;
}

/* Submit Buttons */
.account-content-section input[type="submit"],
.account-content-section .woocommerce-form__button,
.account-content-section .woocommerce-Button {
    background: #E2B72D !important;
    color: #000 !important;
    border: none !important;
    padding: 1rem 2rem !important;
    border-radius: 5px !important;
    font-family: "Montserrat", Sans-serif !important;
    font-weight: 600 !important;
    font-size: 0.9rem !important;
    text-transform: uppercase !important;
    letter-spacing: 0.5px !important;
    transition: all 0.3s ease !important;
    cursor: pointer !important;
}

.account-content-section input[type="submit"]:hover,
.account-content-section .woocommerce-form__button:hover,
.account-content-section .woocommerce-Button:hover {
    background: #d4a429 !important;
    transform: translateY(-2px) !important;
    box-shadow: 0 4px 12px rgba(226, 183, 45, 0.3) !important;
}

/* Address Cards */
.woocommerce-native-content .woocommerce-Address {
    background: #fff !important;
    border: 2px solid #f5f5f5 !important;
    border-radius: 8px !important;
    padding: 1.5rem !important;
    margin-bottom: 1.5rem !important;
    transition: all 0.3s ease !important;
}

.account-content-section .woocommerce-Address:hover {
    border-color: #E2B72D !important;
    box-shadow: 0 2px 10px rgba(226, 183, 45, 0.1) !important;
}

.account-content-section .woocommerce-Address h3 {
    font-family: "Montserrat", Sans-serif !important;
    font-weight: 600 !important;
    color: #333 !important;
    margin-bottom: 1rem !important;
    padding-bottom: 0.5rem !important;
    border-bottom: 2px solid #E2B72D !important;
}

/* Subscription Status */
.account-content-section .subscription-status {
    padding: 0.5rem 1rem !important;
    border-radius: 20px !important;
    font-family: "Montserrat", Sans-serif !important;
    font-weight: 500 !important;
    font-size: 0.75rem !important;
    text-transform: uppercase !important;
    letter-spacing: 0.5px !important;
    border: 2px solid !important;
    display: inline-block !important;
}

.account-content-section .subscription-status.active {
    color: #155724 !important;
    background-color: #d4edda !important;
    border-color: #c3e6cb !important;
}

.account-content-section .subscription-status.cancelled {
    color: #721c24 !important;
    background-color: #f8d7da !important;
    border-color: #f5c6cb !important;
}

/* No Content Messages */
.account-content-section .woocommerce-message,
.account-content-section .woocommerce-info {
    background: #f8f9fa !important;
    border-left: 4px solid #E2B72D !important;
    border-radius: 0 5px 5px 0 !important;
    padding: 1rem 1.5rem !important;
    margin: 1rem 0 !important;
    font-family: "Montserrat", Sans-serif !important;
    font-size: 0.9rem !important;
    color: #333 !important;
}

/* Training Plans & Memberships Section - Separate */
.training-plans-section {
    background: #f8f9fa;
    padding: 3rem 0;
    margin-top: 0;
}

.training-plans-section .container {
    max-width: 1200px;
}

/* Legacy support */
.account-memberships-section {
    margin: 0;
    padding: 0;
}

/* Section Headers (applied via JavaScript for dynamic content) */
.newsletter-preferences-header {
    font-family: "Montserrat", Sans-serif !important;
    font-weight: 600 !important;
    color: #333 !important;
    margin: 2rem 0 1rem 0 !important;
    padding-bottom: 0.5rem !important;
    border-bottom: 2px solid #E2B72D !important;
    /* Removed font-size to inherit from theme's h2/h3 hierarchy */
}

/* Order Details Page Headers */
.account-content-section h3 {
    font-family: "Montserrat", Sans-serif !important;
    font-weight: 600 !important;
    color: #333 !important;
    margin: 2rem 0 1rem 0 !important;
    padding-bottom: 0.5rem !important;
    border-bottom: 2px solid #E2B72D !important;
    /* Inherit font-size from theme */
}

/* Override any red styling on order page headers */
.account-content-section .order-details h3,
.account-content-section .billing-address h3 {
    color: #333 !important;
    border-bottom-color: #E2B72D !important;
}

/* Order Details Page Spacing */
.account-content-section .order-actions {
    margin-top: 2rem !important;
    margin-bottom: 3rem !important;
    padding-bottom: 2rem !important;
}

.account-content-section .order-actions .button {
    margin-bottom: 1rem !important;
}

/* Ensure proper spacing between order content and training programs */
.account-content-section .woocommerce-MyAccount-content {
    margin-bottom: 3rem !important;
    padding-bottom: 2rem !important;
}

/* Custom Notification System */
.account-notification {
    display: flex !important;
    align-items: center !important;
    gap: 0.75rem !important;
    padding: 1rem 1.5rem !important;
    margin: 0 0 2rem 0 !important;
    border-radius: 8px !important;
    font-family: "Montserrat", Sans-serif !important;
    font-weight: 500 !important;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1) !important;
    position: relative !important;
    animation: slideInFromTop 0.3s ease-out !important;
}

.account-notification i {
    font-size: 1.2rem !important;
    flex-shrink: 0 !important;
}

.account-notification span {
    flex-grow: 1 !important;
}

.notification-close {
    background: none !important;
    border: none !important;
    font-size: 1.5rem !important;
    cursor: pointer !important;
    padding: 0 !important;
    margin-left: 0.5rem !important;
    opacity: 0.7 !important;
    transition: opacity 0.2s !important;
}

.notification-close:hover {
    opacity: 1 !important;
}

/* Notification Types */
.account-notification-success {
    background: #d4edda !important;
    color: #155724 !important;
    border-left: 4px solid #28a745 !important;
}

.account-notification-error {
    background: #f8d7da !important;
    color: #721c24 !important;
    border-left: 4px solid #dc3545 !important;
}

.account-notification-info {
    background: #d1ecf1 !important;
    color: #0c5460 !important;
    border-left: 4px solid #17a2b8 !important;
}

/* Animation */
@keyframes slideInFromTop {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Enhance native WooCommerce messages */
.account-content-section .woocommerce-message,
.account-content-section .woocommerce-error,
.account-content-section .woocommerce-info {
    font-family: "Montserrat", Sans-serif !important;
    font-weight: 500 !important;
    border-radius: 8px !important;
    padding: 1rem 1.5rem !important;
    margin: 0 0 2rem 0 !important;
    animation: slideInFromTop 0.3s ease-out !important;
}

/* Account Content Sections */
.account-content-sections {
    padding: 3rem 0;
    background: #f8f9fa;
    min-height: 60vh;
}


.account-content-section .section-header {
    text-align: left;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #f0f0f0;
}

.account-content-section .section-header h2 {
    color: #333;
    font-family: "Montserrat", Sans-serif;
    font-weight: 700;
    margin-bottom: 0.5rem;
}

.account-content-section .section-header p {
    color: #666;
    font-family: "Montserrat", Sans-serif;
    margin-bottom: 0;
}

.address-section {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1rem;
    border-left: 4px solid #E2B72D;
}

.address-section h3 {
    color: #333;
    font-family: "Montserrat", Sans-serif;
    font-weight: 600;
    margin-bottom: 1rem;
}

.address-display {
    margin-bottom: 1rem;
    min-height: 80px;
}

.account-subsection {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 2rem;
    margin-bottom: 2rem;
}

.account-subsection h3 {
    color: #333;
    font-family: "Montserrat", Sans-serif;
    font-weight: 600;
    margin-bottom: 1.5rem;
    font-size: 1.25rem;
}

.account-subsection h4 {
    color: #333;
    font-family: "Montserrat", Sans-serif;
    font-weight: 600;
    margin-bottom: 1rem;
    font-size: 1.1rem;
}

/* Active Memberships Section */
.active-memberships-section {
    margin: 3rem 0 2rem 0;
}

.section-title {
    font-family: "Montserrat", Sans-serif;
    font-weight: 700;
    color: #333;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.section-title i {
    color: #E2B72D;
    font-size: 1.5rem;
}

.section-subtitle {
    color: #666;
    font-family: "Montserrat", Sans-serif;
    margin-bottom: 2rem;
    font-size: 1.1rem;
}

/* Content Grid */
.content-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.content-item {
    background: #fff;
    border-radius: 10px;
    padding: 1.5rem;
    transition: all 0.3s ease;
    box-shadow: 0px 3px 15px rgba(0, 0, 0, 0.1);
    border: 1px solid #f0f0f0;
}

.content-item:hover {
    transform: translateY(-2px);
    box-shadow: 0px 5px 25px rgba(0, 0, 0, 0.15);
}

.content-header {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1rem;
}

.content-thumbnail {
    width: 60px;
    height: 60px;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
    background: #f8f9fa;
    display: flex;
    align-items: center;
    justify-content: center;
}

.content-thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.content-thumbnail.placeholder {
    background: #E2B72D;
    color: #000;
}

.content-thumbnail.placeholder i {
    font-size: 1.5rem;
}

.content-title-section h4 {
    font-family: "Montserrat", Sans-serif;
    font-weight: 700;
    font-size: 1.25rem !important;
    margin: 0;
    color: #333;
    line-height: 1.3;
}

.content-title-section h4 a {
    color: #333;
    text-decoration: none;
}

.content-title-section h4 a:hover {
    color: #E2B72D;
}

.content-membership {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    padding: 0.5rem;
    background: #f8f9fa;
    border-radius: 6px;
    font-family: "Montserrat", Sans-serif;
    font-weight: 600;
    font-size: 0.85rem;
    color: #666;
}

.content-membership i {
    color: #E2B72D;
    font-size: 0.9rem;
}

.content-excerpt {
    color: #666;
    font-family: "Montserrat", Sans-serif;
    font-size: 0.9rem;
    line-height: 1.5;
    margin-bottom: 1.5rem;
}

.access-content-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: transparent;
    color: #E2B72D;
    border: 2px solid #E2B72D;
    text-decoration: none;
    border-radius: 25px;
    font-family: "Montserrat", Sans-serif;
    font-weight: 600;
    font-size: 0.9rem;
    transition: all 0.3s ease;
}

.access-content-btn:hover {
    background: #E2B72D;
    color: #000;
    text-decoration: none;
    transform: translateY(-1px);
    box-shadow: 0px 3px 10px rgba(226, 183, 45, 0.3);
}

/* No Memberships State */
.no-memberships-state {
    text-align: center;
    padding: 4rem 2rem;
    background: #f8f9fa;
    border-radius: 15px;
    border: 2px dashed #E2B72D;
}

.empty-state-icon i {
    font-size: 4rem;
    color: #E2B72D;
    margin-bottom: 1rem;
}

.no-memberships-state h3 {
    font-family: "Montserrat", Sans-serif;
    font-weight: 700;
    color: #333;
    margin-bottom: 1rem;
}

.no-memberships-state p {
    font-family: "Montserrat", Sans-serif;
    color: #666;
    margin-bottom: 2rem;
    font-size: 1.1rem;
}

.empty-state-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
}

.browse-programs-btn {
    background: #E2B72D;
    border-color: #E2B72D;
    color: #000;
    font-family: "Montserrat", Sans-serif;
    font-weight: 600;
}

.browse-programs-btn:hover {
    background: #d4a429;
    border-color: #d4a429;
    color: #000;
}

/* Mobile Responsiveness for Active Memberships */
@media (max-width: 768px) {
    .content-grid {
        grid-template-columns: 1fr;
    }

    .empty-state-actions {
        flex-direction: column;
        align-items: center;
    }

    .empty-state-actions .btn {
        width: 100%;
        max-width: 300px;
    }
}

/* Hide default WooCommerce navigation when using custom navigation */
#woocommerce-native-content .woocommerce-MyAccount-navigation {
    display: none !important;
}

/* Style the native WooCommerce content to match our design */
#woocommerce-native-content .woocommerce-MyAccount-content {
    background: #ffffff;
    padding: 2rem 0;
    min-height: 60vh;
    width: 100% !important;
    max-width: none !important;
    margin: 0 !important;
    flex: 1 !important;
}

#woocommerce-native-content .woocommerce-MyAccount-content > * {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 15px;
    width: 100% !important;
}

/* Force the entire WooCommerce account wrapper to be full width */
#woocommerce-native-content .woocommerce-account {
    display: block !important;
    width: 100% !important;
}

/* Make sure content doesn't have the default two-column layout */
#woocommerce-native-content .woocommerce-account .woocommerce-MyAccount-content {
    width: 100% !important;
    margin-left: 0 !important;
    float: none !important;
}

/* Apply our custom styling to native WooCommerce content */
#woocommerce-native-content .woocommerce-MyAccount-content h2,
#woocommerce-native-content .woocommerce-MyAccount-content h3 {
    font-family: "Montserrat", Sans-serif !important;
    font-weight: 600 !important;
    color: #333 !important;
    text-align: left !important;
    margin-bottom: 1.5rem !important;
}

#woocommerce-native-content .woocommerce-MyAccount-content p {
    font-family: "Montserrat", Sans-serif !important;
    color: #666 !important;
    text-align: left !important;
}

/* Apply account subsection styling to forms and content areas */
#woocommerce-native-content .woocommerce form,
#woocommerce-native-content .woocommerce-orders-table,
#woocommerce-native-content .woocommerce-Addresses,
#woocommerce-native-content .woocommerce-PaymentMethods {
    background: #ffffff !important;
    border: none !important;
    border-radius: 12px !important;
    padding: 0 !important;
    margin-bottom: 2rem !important;
}

.woocommerce-payment-methods #woocommerce-native-content .woocommerce-MyAccount-content .button {
    background: #E2B72D !important;
    color: #000 !important;
    border: none !important;
    padding: 1.2rem 2.5rem !important;
    border-radius: 8px !important;
    font-family: "Montserrat", Sans-serif !important;
    font-weight: 600 !important;
    font-size: 0.95rem !important;
    text-transform: uppercase !important;
    letter-spacing: 0.5px !important;
    transition: all 0.3s ease !important;
    cursor: pointer !important;
    box-shadow: 0 4px 12px rgba(226, 183, 45, 0.2) !important;
    margin-top: 1rem !important;
}

.woocommerce-payment-methods #woocommerce-native-content .woocommerce-MyAccount-content .button:hover {
    background: #d4a429 !important;
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 20px rgba(226, 183, 45, 0.4) !important;
}

.woocommerce-payment-methods #woocommerce-native-content .woocommerce-MyAccount-content p {
    margin-top:  5rem;
}

#woocommerce-native-content .woocommerce-Addresses {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 1rem;
}

#woocommerce-native-content .woocommerce-Addresses .woocommerce-Address {
    width: 50%;
}

#woocommerce-native-content .woocommerce form fieldset {
    margin: 3rem 0;
    padding: 1rem;
    border: 1px dashed #cccccc;
}

#woocommerce-native-content .woocommerce form fieldset legend {
    width: auto;
    padding: 0 1rem;
    background: #fff;
}

#woocommerce-native-content .woocommerce form fieldset p {
    flex-direction: column;
}

#woocommerce-native-content .woocommerce form fieldset p label {
    margin-right: 0;
}

/* Enhanced styling for WooCommerce tables */
#woocommerce-native-content .woocommerce-orders-table,
#woocommerce-native-content .woocommerce-table {
    background: #fff !important;
    border-radius: 8px !important;
    border: none !important;
    overflow: hidden !important;
    margin: 1rem 0 !important;
}

#woocommerce-native-content .woocommerce-orders-table thead,
#woocommerce-native-content .woocommerce-table thead {
    background: #6c757d !important;
    color: #fff !important;
}

#woocommerce-native-content .woocommerce-orders-table th,
#woocommerce-native-content .woocommerce-table th {
    font-family: "Montserrat", Sans-serif !important;
    font-weight: 600 !important;
    font-size: 0.9rem !important;
    text-transform: uppercase !important;
    letter-spacing: 0.5px !important;
    padding: 1.2rem 1rem !important;
    border: none !important;
    color: #fff !important;
    background: transparent !important;
}

#woocommerce-native-content .woocommerce-orders-table td,
#woocommerce-native-content .woocommerce-table td {
    font-family: "Montserrat", Sans-serif !important;
    font-size: 0.9rem !important;
    padding: 1rem !important;
    border: none !important;
    border-bottom: 1px solid #f5f5f5 !important;
    vertical-align: middle !important;
    color: #333 !important;
}

/* Alternating row colors for tables with multiple rows */
#woocommerce-native-content .woocommerce-orders-table tbody tr:nth-child(even) td,
#woocommerce-native-content .woocommerce-table tbody tr:nth-child(even) td {
    background-color: #f9f9f9 !important;
}

#woocommerce-native-content .woocommerce-orders-table tbody tr:nth-child(odd) td,
#woocommerce-native-content .woocommerce-table tbody tr:nth-child(odd) td {
    background-color: #ffffff !important;
}

/* Hover effects should override alternating colors */
#woocommerce-native-content .woocommerce-orders-table tr:hover td,
#woocommerce-native-content .woocommerce-table tr:hover td {
    background-color: #f8f9fa !important;
    transition: background-color 0.3s ease !important;
}

/* Enhanced button styling */
#woocommerce-native-content .woocommerce-button,
#woocommerce-native-content .button,
#woocommerce-native-content .btn {
    background: transparent !important;
    color: #E2B72D !important;
    border: 2px solid #E2B72D !important;
    padding: 0.5rem 1rem !important;
    border-radius: 5px !important;
    font-family: "Montserrat", Sans-serif !important;
    font-weight: 500 !important;
    font-size: 0.8rem !important;
    text-transform: uppercase !important;
    letter-spacing: 0.3px !important;
    transition: all 0.3s ease !important;
    margin: 0.2rem !important;
    text-decoration: none !important;
}

#woocommerce-native-content .woocommerce-button:hover,
#woocommerce-native-content .button:hover,
#woocommerce-native-content .btn:hover {
    background: #E2B72D !important;
    color: #000 !important;
    border-color: #d4a429 !important;
    transform: translateY(-1px) !important;
    box-shadow: 0 2px 5px rgba(226, 183, 45, 0.3) !important;
}

/* Enhanced Form styling for payment methods */
#woocommerce-native-content input[type="text"],
#woocommerce-native-content input[type="email"],
#woocommerce-native-content input[type="password"],
#woocommerce-native-content input[type="tel"],
#woocommerce-native-content select,
#woocommerce-native-content textarea {
    width: 100% !important;
    padding: 1rem 1.2rem !important;
    border: 2px solid #e9ecef !important;
    border-radius: 8px !important;
    font-family: "Montserrat", Sans-serif !important;
    font-size: 0.95rem !important;
    background-color: #fff !important;
    color: #333 !important;
    transition: all 0.3s ease !important;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05) !important;
}

#woocommerce-native-content input:focus,
#woocommerce-native-content select:focus,
#woocommerce-native-content textarea:focus {
    border-color: #E2B72D !important;
    box-shadow: 0 0 0 4px rgba(226, 183, 45, 0.1), 0 4px 12px rgba(0,0,0,0.1) !important;
    outline: none !important;
    transform: translateY(-1px) !important;
}

/* Payment form specific styling */
#woocommerce-native-content .woocommerce-checkout .form-row {
    margin-bottom: 1.5rem !important;
}

#woocommerce-native-content .woocommerce-checkout label {
    font-family: "Montserrat", Sans-serif !important;
    font-weight: 600 !important;
    color: #333 !important;
    font-size: 0.9rem !important;
    margin-bottom: 0.5rem !important;
    display: block !important;
}

/* Payment method selection styling - target actual structure */
#woocommerce-native-content .woocommerce-Payment {
    background: transparent !important;
    border: none !important;
    padding: 0 !important;
    margin: 0 !important;
}

#woocommerce-native-content .woocommerce-PaymentMethods {
    background: transparent !important;
    border: none !important;
    padding: 0 !important;
    margin: 0 !important;
    list-style: none !important;
}

#woocommerce-native-content .woocommerce-PaymentMethod {
    background: transparent !important;
    border: none !important;
    padding: 0 !important;
    margin-bottom: 1rem !important;
}

#woocommerce-native-content .woocommerce-PaymentBox {
    background: transparent !important;
    border: none !important;
    padding: 0 !important;
    margin: 0 !important;
}

/* Card input field styling */
#woocommerce-native-content .StripeElement,
#woocommerce-native-content .stripe-card-element {
    padding: 1rem 1.2rem !important;
    border: 2px solid #e9ecef !important;
    border-radius: 8px !important;
    background-color: #fff !important;
    color: #333 !important;
    transition: all 0.3s ease !important;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05) !important;
}

#woocommerce-native-content .StripeElement:focus,
#woocommerce-native-content .stripe-card-element:focus {
    border-color: #E2B72D !important;
    box-shadow: 0 0 0 4px rgba(226, 183, 45, 0.1), 0 4px 12px rgba(0,0,0,0.1) !important;
}

/* Fix input text color visibility - target Stripe iframes */
#woocommerce-native-content .wc-upe-form {
    background: transparent !important;
    border: none !important;
    padding: 0 !important;
}

#woocommerce-native-content .wc-stripe-upe-element {
    background: #fff !important;
    border: 2px solid #e9ecef !important;
    border-radius: 8px !important;
    padding: 0 !important;
    margin-bottom: 1rem !important;
}

/* Stripe element container styling */
#woocommerce-native-content .wc-stripe-upe-element iframe {
    background: #fff !important;
    border: none !important;
    border-radius: 6px !important;
}

/* Remove grey backgrounds from all payment containers */
#woocommerce-native-content .payment_box {
    background: transparent !important;
    border: none !important;
    padding: 1rem 0 !important;
    margin: 0 !important;
}

/* Style payment method labels */
#woocommerce-native-content .woocommerce-PaymentMethod label {
    font-family: "Montserrat", Sans-serif !important;
    font-weight: 600 !important;
    color: #333 !important;
    font-size: 1rem !important;
    margin-bottom: 1rem !important;
    display: block !important;
}

/* Payment method radio buttons */
#woocommerce-native-content .woocommerce-PaymentMethod input[type="radio"] {
    margin-right: 0.75rem !important;
    transform: scale(1.2) !important;
}

/* Hide Klarna payment option */
#woocommerce-native-content .woocommerce-PaymentMethods .woocommerce-PaymentMethod--stripe_klarna,
#woocommerce-native-content .woocommerce-PaymentMethods .payment_method_stripe_klarna {
    display: none !important;
}

/* Hide payment box before element */
#woocommerce-native-content #add_payment_method #payment div.payment_box::before {
    display: none !important;
}

/* Ensure full width for payment form */
#woocommerce-native-content #add_payment_method {
    width: 100% !important;
    max-width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
    background: transparent !important;
    border: none !important;
}

/* Ensure Stripe iframe content has proper styling */
#woocommerce-native-content .StripeElement iframe {
    color: #333 !important;
}

/* Fix any grey backgrounds on payment containers */
#woocommerce-native-content .wc-stripe-elements-field,
#woocommerce-native-content .wc-stripe-card-element,
#woocommerce-native-content .payment_box {
    background: transparent !important;
    border: none !important;
    padding: 0 !important;
}

/* Enhanced Submit buttons */
#woocommerce-native-content input[type="submit"],
#woocommerce-native-content .woocommerce-form__button,
#woocommerce-native-content .woocommerce-Button,
#woocommerce-native-content button[type="submit"] {
    background: #E2B72D !important;
    color: #000 !important;
    border: none !important;
    padding: 1.2rem 2.5rem !important;
    border-radius: 8px !important;
    font-family: "Montserrat", Sans-serif !important;
    font-weight: 600 !important;
    font-size: 0.95rem !important;
    text-transform: uppercase !important;
    letter-spacing: 0.5px !important;
    transition: all 0.3s ease !important;
    cursor: pointer !important;
    box-shadow: 0 4px 12px rgba(226, 183, 45, 0.2) !important;
    margin-top: 1rem !important;
}

#woocommerce-native-content input[type="submit"]:hover,
#woocommerce-native-content .woocommerce-form__button:hover,
#woocommerce-native-content .woocommerce-Button:hover,
#woocommerce-native-content button[type="submit"]:hover {
    background: #d4a429 !important;
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 20px rgba(226, 183, 45, 0.4) !important;
}

/* Additional payment form styling - remove wrapper borders */
#woocommerce-native-content .woocommerce-checkout-payment {
    background: transparent !important;
    border: none !important;
    border-radius: 0 !important;
    padding: 0 !important;
    margin: 1rem 0 !important;
    box-shadow: none !important;
}

/* Radio button styling */
#woocommerce-native-content input[type="radio"] {
    margin-right: 0.75rem !important;
    transform: scale(1.2) !important;
}

/* Checkbox styling */
#woocommerce-native-content input[type="checkbox"] {
    margin-right: 0.75rem !important;
    transform: scale(1.1) !important;
}

/* Form section headers */
#woocommerce-native-content .woocommerce-checkout h3 {
    font-family: "Montserrat", Sans-serif !important;
    font-weight: 600 !important;
    color: #333 !important;
    margin-bottom: 1.5rem !important;
    padding-bottom: 0.75rem !important;
    border-bottom: 2px solid #E2B72D !important;
}

/* Address cards styling */
#woocommerce-native-content .woocommerce-Address {
    background: #fff !important;
    border: 1px solid #e9ecef !important;
    border-radius: 8px !important;
    padding: 1.5rem !important;
    margin-bottom: 1.5rem !important;
    transition: all 0.3s ease !important;
}

#woocommerce-native-content .woocommerce-Address:hover {
    border-color: #E2B72D !important;
}

/* Credit card layout styling - Target correct WooCommerce table class */
#woocommerce-native-content .woocommerce-MyAccount-paymentMethods {
    display: grid !important;
    grid-template-columns: 1fr 1fr 1fr !important;
    gap: 1.5rem !important;
    padding: 0 !important;
    background: transparent !important;
    border: none !important;
    max-width: 1200px !important;
}

/* Hide table header */
#woocommerce-native-content .woocommerce-MyAccount-paymentMethods thead {
    display: none !important;
}

/* Transform table rows into credit cards */
#woocommerce-native-content .woocommerce-MyAccount-paymentMethods tbody tr {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    border: none !important;
    border-radius: 16px !important;
    padding: 1.5rem !important;
    margin-bottom: 0 !important;
    transition: all 0.3s ease !important;
    position: relative !important;
    min-height: 200px !important;
    color: white !important;
    box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: space-between !important;
    aspect-ratio: 1.6 !important;
}

#woocommerce-native-content .woocommerce-MyAccount-paymentMethods tbody tr:hover {
    transform: translateY(-5px) !important;
    box-shadow: 0 12px 35px rgba(0,0,0,0.2) !important;
}

/* Default payment method styling */
#woocommerce-native-content .woocommerce-MyAccount-paymentMethods tbody tr.default-payment-method {
    border: 3px solid #E2B72D !important;
}

#woocommerce-native-content .woocommerce-MyAccount-paymentMethods tbody tr.default-payment-method::after {
    content: "DEFAULT" !important;
    position: absolute !important;
    top: 1rem !important;
    right: 1rem !important;
    background: #E2B72D !important;
    color: #000 !important;
    padding: 0.25rem 0.5rem !important;
    border-radius: 4px !important;
    font-size: 0.6rem !important;
    font-weight: 700 !important;
    letter-spacing: 1px !important;
}

/* Style table cells as card content */
#woocommerce-native-content .woocommerce-MyAccount-paymentMethods tbody td {
    border: none !important;
    padding: 0 !important;
    background: transparent !important;
    color: white !important;
    display: block !important;
}

/* Card brand styling - Use text content to determine brand */
#woocommerce-native-content .woocommerce-MyAccount-paymentMethods tbody tr:has(.payment-method-method:contains("Visa")) {
    background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%) !important;
}

#woocommerce-native-content .woocommerce-MyAccount-paymentMethods tbody tr:has(.payment-method-method:contains("Mastercard")) {
    background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%) !important;
}

#woocommerce-native-content .woocommerce-MyAccount-paymentMethods tbody tr:has(.payment-method-method:contains("American Express")) {
    background: linear-gradient(135deg, #007bc1 0%, #0096d6 100%) !important;
}

/* Simple payment method text styling */
#woocommerce-native-content .woocommerce-MyAccount-paymentMethods .payment-method-method {
    font-family: "Courier New", monospace !important;
    font-size: 1.1rem !important;
    letter-spacing: 2px !important;
    font-weight: 500 !important;
    position: absolute !important;
    bottom: 3rem !important;
    left: 1rem !important;
    color: white !important;
}

/* Card expiry styling */
#woocommerce-native-content .woocommerce-MyAccount-paymentMethods .payment-method-expires {
    font-family: "Courier New", monospace !important;
    font-size: 0.9rem !important;
    letter-spacing: 1px !important;
    position: absolute !important;
    bottom: 1rem !important;
    right: 1rem !important;
    opacity: 0.9 !important;
}

/* Card actions (Edit/Delete) */
#woocommerce-native-content .woocommerce-MyAccount-paymentMethods .payment-method-actions {
    position: absolute !important;
    bottom: 1rem !important;
    left: 1rem !important;
    display: flex !important;
    gap: 0.5rem !important;
    opacity: 0 !important;
    transition: opacity 0.3s ease !important;
}

#woocommerce-native-content .woocommerce-MyAccount-paymentMethods tbody tr:hover .payment-method-actions {
    opacity: 1 !important;
}

#woocommerce-native-content .woocommerce-MyAccount-paymentMethods .payment-method-actions .button {
    background: rgba(255,255,255,0.2) !important;
    border: 1px solid rgba(255,255,255,0.3) !important;
    color: white !important;
    padding: 0.3rem 0.6rem !important;
    border-radius: 4px !important;
    font-size: 0.7rem !important;
    text-decoration: none !important;
    font-weight: 500 !important;
    transition: all 0.3s ease !important;
}

#woocommerce-native-content .woocommerce-MyAccount-paymentMethods .payment-method-actions .button:hover {
    background: rgba(255,255,255,0.3) !important;
}

/* Payment methods container wrapper */
#woocommerce-native-content .payment-methods-wrapper {
    display: grid !important;
    grid-template-columns: 1fr 1fr 1fr !important;
    gap: 1.5rem !important;
    max-width: 1200px !important;
}

/* Style the add payment method button as a card */
#woocommerce-native-content .add-payment-method-card {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
    border: 2px dashed #E2B72D !important;
    border-radius: 16px !important;
    padding: 1.5rem !important;
    min-height: 200px !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: center !important;
    align-items: center !important;
    text-align: center !important;
    transition: all 0.3s ease !important;
    aspect-ratio: 1.6 !important;
    cursor: pointer !important;
    text-decoration: none !important;
    color: #666 !important;
    box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
}

#woocommerce-native-content .add-payment-method-card:hover {
    background: linear-gradient(135deg, #E2B72D 0%, #d4a429 100%) !important;
    border-color: #d4a429 !important;
    color: #000 !important;
    transform: translateY(-5px) !important;
    box-shadow: 0 12px 35px rgba(226, 183, 45, 0.3) !important;
    text-decoration: none !important;
}

#woocommerce-native-content a.add-payment-method-card {
    width: 33% !important;
    margin: 0 0 0 1rem;
}

#woocommerce-native-content .add-payment-method-card .add-icon {
    font-size: 3rem !important;
    margin-bottom: 1rem !important;
    opacity: 0.7 !important;
}

#woocommerce-native-content .add-payment-method-card .add-text {
    font-family: "Montserrat", Sans-serif !important;
    font-weight: 600 !important;
    font-size: 1rem !important;
    text-transform: uppercase !important;
    letter-spacing: 0.5px !important;
}

/* Responsive design */
@media (max-width: 1024px) {
    #woocommerce-native-content .woocommerce-MyAccount-paymentMethods,
    #woocommerce-native-content .payment-methods-wrapper {
        grid-template-columns: 1fr 1fr !important;
        gap: 1.5rem !important;
    }
}

@media (max-width: 768px) {
    /* Single column layout on mobile */
    #woocommerce-native-content .woocommerce-MyAccount-paymentMethods,
    #woocommerce-native-content .payment-methods-wrapper {
        grid-template-columns: 1fr !important;
        gap: 1.5rem !important;
    }

    /* ONLY mobile change: make delete button always visible */
    #woocommerce-native-content .woocommerce-MyAccount-paymentMethods .payment-method-actions {
        opacity: 1 !important;
    }

    /* Hide WooCommerce mobile labels (Method:, Expires:, etc.) */
    #woocommerce-native-content .woocommerce-MyAccount-paymentMethods td::before {
        display: none !important;
    }

    /* Form elements mobile optimization */
    #woocommerce-native-content input[type="text"],
    #woocommerce-native-content input[type="email"],
    #woocommerce-native-content input[type="password"],
    #woocommerce-native-content input[type="tel"],
    #woocommerce-native-content select,
    #woocommerce-native-content textarea {
        font-size: 16px !important; /* Prevents zoom on iOS */
    }

    /* Mobile submit buttons */
    #woocommerce-native-content input[type="submit"],
    #woocommerce-native-content .woocommerce-form__button,
    #woocommerce-native-content .woocommerce-Button,
    #woocommerce-native-content button[type="submit"] {
        width: 100% !important;
        touch-action: manipulation !important;
    }

    /* Mobile navigation adjustments */
    .account-content-section {
        padding-bottom: 100px !important; /* Account for mobile nav */
    }

    #woocommerce-native-content a.add-payment-method-card {
        width: 50% !important;
    }
}

/* Tablet specific adjustments */
@media (max-width: 1024px) and (min-width: 769px) {
    /* Show actions on tablet as well since many tablets are touch */
    #woocommerce-native-content .woocommerce-MyAccount-paymentMethods .payment-method-actions {
        opacity: 0.7 !important;
    }

    #woocommerce-native-content .woocommerce-MyAccount-paymentMethods tbody tr:hover .payment-method-actions {
        opacity: 1 !important;
    }
}

@media (max-width: 425px) {
    #woocommerce-native-content a.add-payment-method-card {
        width: 93% !important;
    }

    #woocommerce-native-content .woocommerce-Addresses {
        flex-direction: column;
    }

    #woocommerce-native-content .woocommerce-Addresses .woocommerce-Address {
        width: 100% !important;
    }
}

/* Hide empty notice wrappers */
#woocommerce-native-content .woocommerce-notices-wrapper:empty {
    display: none !important;
}

/* WooCommerce Notices Styling */
#woocommerce-native-content .woocommerce-message,
#woocommerce-native-content .woocommerce-error,
#woocommerce-native-content .woocommerce-info {
    background: #ffffff !important;
    border-radius: 8px !important;
    padding: 1rem 1.5rem !important;
    margin-bottom: 1.5rem !important;
    border: 1px solid #e9ecef !important;
    font-family: "Montserrat", Sans-serif !important;
}

/* Success messages */
#woocommerce-native-content .woocommerce-message {
    border-left: 4px solid #28a745 !important;
    color: #155724 !important;
}

#woocommerce-native-content .woocommerce-message::before {
    content: "✓" !important;
    color: #28a745 !important;
    font-weight: bold !important;
    margin-right: 0.5rem !important;
}

/* Error messages */
#woocommerce-native-content .woocommerce-error {
    border-left: 4px solid #dc3545 !important;
    color: #721c24 !important;
}

#woocommerce-native-content .woocommerce-error::before {
    content: "✗" !important;
    color: #dc3545 !important;
    font-weight: bold !important;
    margin-right: 0.5rem !important;
}

/* Info messages */
#woocommerce-native-content .woocommerce-info {
    border-left: 4px solid #17a2b8 !important;
    color: #0c5460 !important;
}

#woocommerce-native-content .woocommerce-info::before {
    content: "ℹ" !important;
    color: #17a2b8 !important;
    font-weight: bold !important;
    margin-right: 0.5rem !important;
}

.woocommerce-payment-methods #woocommerce-native-content .woocommerce-info {
    display: none;
}

/* Notice links styling */
#woocommerce-native-content .woocommerce-message a,
#woocommerce-native-content .woocommerce-error a,
#woocommerce-native-content .woocommerce-info a {
    color: #E2B72D !important;
    text-decoration: underline !important;
    font-weight: 600 !important;
}

#woocommerce-native-content .woocommerce-message a:hover,
#woocommerce-native-content .woocommerce-error a:hover,
#woocommerce-native-content .woocommerce-info a:hover {
    color: #d4a429 !important;
    text-decoration: none !important;
}

/* Notice dismiss buttons */
#woocommerce-native-content .woocommerce-message .button,
#woocommerce-native-content .woocommerce-error .button,
#woocommerce-native-content .woocommerce-info .button {
    background: transparent !important;
    border: 1px solid currentColor !important;
    padding: 0.3rem 0.8rem !important;
    border-radius: 4px !important;
    font-size: 0.8rem !important;
    margin-left: 1rem !important;
}

/* Make sure our navigation stays visible when showing native content */
.account-navigation-section {
    position: relative !important;
    z-index: 100 !important;
}
</style>

<script>
jQuery(document).ready(function($) {
    // Get current page URL to determine active navigation
    var currentUrl = window.location.pathname;
    var currentEndpoint = currentUrl.split('/').pop();

    // Debug: log current URL for troubleshooting
    console.log('Current URL:', currentUrl);
    console.log('Current Endpoint:', currentEndpoint);

    // Map navigation targets to WooCommerce endpoints (using absolute URLs)
    var urlMap = {
        'dashboard': '<?php echo wc_get_page_permalink('myaccount'); ?>',
        'orders': '<?php echo wc_get_page_permalink('myaccount'); ?>orders/',
        'subscriptions': '<?php echo wc_get_page_permalink('myaccount'); ?>subscriptions/',
        'payments': '<?php echo wc_get_page_permalink('myaccount'); ?>payment-methods/',
        'edit-account': '<?php echo wc_get_page_permalink('myaccount'); ?>edit-account/'
    };

    // Debug: log all URL mappings
    console.log('URL Mappings:', urlMap);

    // Set active navigation based on current URL
    function setActiveNavigation() {
        $('.account-nav-item, .mobile-nav-item').removeClass('active');

        // Orders section (includes all order-related endpoints)
        if (currentUrl.includes('/orders') ||
            currentUrl.includes('/view-order/') ||
            currentUrl.includes('/order-received/') ||
            currentUrl.includes('/order-pay/') ||
            currentUrl.includes('/order-again/')) {
            $('[data-target="orders"]').addClass('active');

        // Subscriptions section (includes all subscription-related endpoints)
        } else if (currentUrl.includes('/subscriptions') ||
                   currentUrl.includes('/view-subscription/') ||
                   currentUrl.includes('/subscription/') ||
                   currentUrl.includes('/switch-subscription/') ||
                   currentUrl.includes('/resubscribe/')) {
            $('[data-target="subscriptions"]').addClass('active');

        // Payments section (includes all payment-related endpoints)
        } else if (currentUrl.includes('/payment-methods') ||
                   currentUrl.includes('/add-payment-method') ||
                   currentUrl.includes('/delete-payment-method/') ||
                   currentUrl.includes('/set-default-payment-method/')) {
            $('[data-target="payments"]').addClass('active');

        // Account section (includes all account/address-related endpoints)
        } else if (currentUrl.includes('/edit-account') ||
                   currentUrl.includes('/edit-address') ||
                   currentUrl.includes('/lost-password') ||
                   currentUrl.includes('/customer-logout')) {
            $('[data-target="edit-account"]').addClass('active');

        // Training Programs section (custom endpoint)
        } else if (currentUrl.includes('/training-programs')) {
            $('[data-target="dashboard"]').addClass('active'); // or create separate nav if needed

        } else {
            $('[data-target="dashboard"]').addClass('active');
        }
    }

    // Handle navigation clicks
    $(document).on('click', '.account-nav-item, .mobile-nav-item', function(e) {
        e.preventDefault();

        var target = $(this).data('target');
        if (!target || !urlMap[target]) return;

        // Debug navigation
        console.log('Navigation clicked:', target);
        console.log('Target URL:', urlMap[target]);
        console.log('Current URL:', currentUrl);

        // Always navigate to the main section URL, even if on a sub-page
        window.location.href = urlMap[target];
    });

    // Initialize active navigation
    setActiveNavigation();

    // Show/hide content based on current endpoint
    console.log('URL Analysis:');
    console.log('- Exact dashboard match:', currentUrl === '/my-account/' || currentUrl === '/my-account');
    console.log('- Contains my-account:', currentUrl.includes('/my-account/'));

    if (currentUrl === '/my-account/' || currentUrl === '/my-account') {
        // On main dashboard, show WooCommerce native content (uses our custom dashboard.php template)
        console.log('Showing WooCommerce dashboard with custom template');
        $('.account-content-sections').hide();
        $('#woocommerce-native-content').show();

        // Add custom section headers for dashboard
        addSectionHeader();
    } else if (currentUrl.includes('/my-account/')) {
        // On WooCommerce endpoints, hide custom content and show native
        console.log('Showing native WooCommerce content');
        $('.account-content-sections').hide();
        $('#woocommerce-native-content').show();

        // Add custom section headers for each endpoint
        addSectionHeader();
    } else {
        // Default: show dashboard
        console.log('Showing default dashboard content');
        $('.account-content-section').hide();
        $('#dashboard-content').show();
        $('#woocommerce-native-content').hide();
    }

    // Function to add custom section headers to WooCommerce content
    function addSectionHeader() {
        var headerHtml = '';
        var subtitleHtml = '';

        // Orders section (all order-related endpoints)
        if (currentUrl.includes('/orders')) {
            headerHtml = '<h2>Order History</h2>';
            subtitleHtml = '<p>View and track your past orders</p>';
        } else if (currentUrl.includes('/view-order/')) {
            headerHtml = '<h2>Order Details</h2>';
            subtitleHtml = '<p>View order information and tracking details</p>';
        } else if (currentUrl.includes('/order-received/')) {
            headerHtml = '<h2>Order Confirmation</h2>';
            subtitleHtml = '<p>Your order has been received and is being processed</p>';
        } else if (currentUrl.includes('/order-pay/')) {
            headerHtml = '<h2>Pay for Order</h2>';
            subtitleHtml = '<p>Complete payment for your order</p>';
        } else if (currentUrl.includes('/order-again/')) {
            headerHtml = '<h2>Reorder Items</h2>';
            subtitleHtml = '<p>Add previous order items to your cart</p>';

        // Subscriptions section (all subscription-related endpoints)
        } else if (currentUrl.includes('/subscriptions')) {
            headerHtml = '<h2>Active Subscriptions</h2>';
            subtitleHtml = '<p>Manage your recurring subscriptions and memberships</p>';
        } else if (currentUrl.includes('/view-subscription/')) {
            headerHtml = '<h2>Subscription Details</h2>';
            subtitleHtml = '<p>Manage this subscription and view payment history</p>';
        } else if (currentUrl.includes('/switch-subscription/')) {
            headerHtml = '<h2>Switch Subscription</h2>';
            subtitleHtml = '<p>Change your subscription plan or options</p>';
        } else if (currentUrl.includes('/resubscribe/')) {
            headerHtml = '<h2>Reactivate Subscription</h2>';
            subtitleHtml = '<p>Reactivate your cancelled subscription</p>';

        // Payments section (all payment-related endpoints)
        } else if (currentUrl.includes('/payment-methods')) {
            headerHtml = '<h2>Payment Methods</h2>';
            subtitleHtml = '<p>Manage your saved payment methods and billing information</p>';
        } else if (currentUrl.includes('/add-payment-method')) {
            headerHtml = '<h2>Add Payment Method</h2>';
            subtitleHtml = '<p>Add a new payment method to your account</p>';
        } else if (currentUrl.includes('/delete-payment-method/')) {
            headerHtml = '<h2>Delete Payment Method</h2>';
            subtitleHtml = '<p>Remove this payment method from your account</p>';
        } else if (currentUrl.includes('/set-default-payment-method/')) {
            headerHtml = '<h2>Set Default Payment Method</h2>';
            subtitleHtml = '<p>Choose your preferred payment method</p>';

        // Account section (all account/address-related endpoints)
        } else if (currentUrl.includes('/edit-account')) {
            headerHtml = '<h2>Account Details</h2>';
            subtitleHtml = '<p>Update your personal information and password</p>';
        } else if (currentUrl.includes('/edit-address')) {
            if (currentUrl.includes('/edit-address/billing')) {
                headerHtml = '<h2>Edit Billing Address</h2>';
                subtitleHtml = '<p>Update your billing address information</p>';
            } else if (currentUrl.includes('/edit-address/shipping')) {
                headerHtml = '<h2>Edit Shipping Address</h2>';
                subtitleHtml = '<p>Update your shipping address information</p>';
            } else {
                headerHtml = '<h2>Edit Address</h2>';
                subtitleHtml = '<p>Update your address information</p>';
            }
        } else if (currentUrl.includes('/lost-password')) {
            headerHtml = '<h2>Reset Password</h2>';
            subtitleHtml = '<p>Enter your email to reset your password</p>';

        // Training Programs section (custom endpoint)
        } else if (currentUrl.includes('/training-programs')) {
            headerHtml = '<h2>Training Programs</h2>';
            subtitleHtml = '<p>Access your purchased training plans and programs</p>';
        }

        if (headerHtml) {
            var sectionHeader = '<div class="section-header" style="text-align: left; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 2px solid #f0f0f0;">' +
                               headerHtml + subtitleHtml +
                               '</div>';

            // Add header before WooCommerce content
            $('#woocommerce-native-content .woocommerce-MyAccount-content').prepend(sectionHeader);
        }
    }

    // Simple approach: hide table headers and style add button as card in grid
    if (currentUrl.includes('/payment-methods')) {
        setTimeout(function() {
            var $paymentTable = $('#woocommerce-native-content .woocommerce-MyAccount-paymentMethods');
            var $addButton = $('#woocommerce-native-content .button[href*="add-payment-method"]');

            // Change button class to add-payment-method-card if no table exists (no saved methods)
            if (!$paymentTable.length && $addButton.length) {
                $addButton.removeClass('button').addClass('add-payment-method-card');
                console.log('Changed add payment method button class to add-payment-method-card');
            }

            if ($paymentTable.length) {
                // Hide the table headers
                $paymentTable.find('thead').hide();
                console.log('Payment methods table headers hidden for card layout');
            }

            if ($addButton.length && $paymentTable.length) {
                // Create wrapper for grid layout
                var $wrapper = $('<div class="payment-methods-wrapper"></div>');

                // Wrap table in grid wrapper
                $paymentTable.wrap($wrapper);

                // Transform add button into card
                var addCardHtml = '<a href="' + $addButton.attr('href') + '" class="add-payment-method-card">' +
                    '<div class="add-icon"><i class="fas fa-plus-circle"></i></div>' +
                    '<div class="add-text">Add Payment Method</div>' +
                '</a>';

                // Replace the original button and add to grid
                $addButton.replaceWith(addCardHtml);

                // Move the card into the grid wrapper
                var $newCard = $('#woocommerce-native-content .add-payment-method-card');
                $paymentTable.parent('.payment-methods-wrapper').append($newCard);

                console.log('Add payment method button added to grid layout');
            }
        }, 500);
    }
});
</script>

<?php
get_footer();
?>
<?php
/**
 * Template Name: Samsara My Account (React)
 * Description: React-based My Account dashboard for WooCommerce
 *
 * @package Samsara
 */

// Redirect to login if not logged in
if (!is_user_logged_in()) {
    wp_redirect(wp_login_url());
    exit;
}

get_header();
?>

<div id="samsara-my-account-root"></div>

<?php
get_footer();

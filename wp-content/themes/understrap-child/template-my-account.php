<?php
/**
 * Template Name: Samsara My Account (React)
 * Description: React-based My Account dashboard for WooCommerce
 *
 * @package Samsara
 */

// Redirect to login if not logged in
if (!is_user_logged_in()) {
    // Pass current URL as redirect parameter so user returns here after login
    wp_redirect(wp_login_url(home_url('/account/')));
    exit;
}
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <?php wp_head(); ?>
</head>
<body <?php body_class('samsara-react-account'); ?>>
<?php wp_body_open(); ?>

<div id="samsara-my-account-root"></div>

<?php wp_footer(); ?>
</body>
</html>

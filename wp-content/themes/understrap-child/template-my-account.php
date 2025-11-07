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
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <?php wp_head(); ?>
</head>
<body <?php body_class('samsara-react-account'); ?>>
<?php wp_body_open(); ?>

<div id="samsara-my-account-root"></div>

<?php wp_footer(); ?>
</body>
</html>

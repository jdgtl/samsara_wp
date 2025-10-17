<?php
/**
 * Template Name: Portal: HUB
 *
 * Template for displaying the home page without sidebar even if a sidebar widget is published.
 *
 * @package UnderStrap
 */

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

get_header();
$container = get_theme_mod( 'understrap_container_type' );

while ( have_posts() ) {
    the_post();

?>

<div class="wrapper" id="full-width-page-wrapper">

	<div class="<?php echo esc_attr( $container ); ?>" id="mainContent">

		<div class="row">

			<div class="col-md-12 content-area" id="primary">

				<main class="site-main" id="main" role="main">

                    <div class="row">

                        <div class="col-lg-3 portal-nav-wrapper">

                            <?php get_template_part( 'sidebar-templates/portal-navigation', 'sidebar' ); ?>

                        </div>

                        <div class="col-lg-9 portal-content">

                            <h2><?php the_title(); ?></h2>

                            <?php echo do_shortcode('[wpc_client]' . the_content() . '[/wpc_client]'); ?>

                        </div>

                    </div>

				</main><!-- #main -->

			</div><!-- #primary -->

		</div><!-- .row end -->

	</div><!-- #contentOne -->

</div><!-- #full-width-page-wrapper -->

<?php
}
get_footer();

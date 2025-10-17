<?php
/**
 * Template Name: About Page
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

                    <?php the_content(); ?>

				</main><!-- #main -->

			</div><!-- #primary -->

		</div><!-- .row end -->

	</div><!-- #contentOne -->

    <?php get_template_part( 'template-parts/global/global', 'parallax' ); ?>

    <div id="featuresSection" class="about">

        <div class="<?php echo esc_attr( $container ); ?>">

            <div class="row">

                <div class="col-md-12 content-area" id="primary">

                    <main class="site-main" id="main" role="main">

                        <?php get_template_part( 'template-parts/sections/features', 'section' ); ?>

                        <?php get_template_part( 'template-parts/global/video', 'embed' ); ?>

                    </main>

                </div>

            </div>

        </div>

	</div><!-- #featuresSection -->

    <div id="coachSection">

        <div class="<?php echo esc_attr( $container ); ?>">

            <div class="row">

                <div class="col-md-12 content-area" id="primary">

                    <main class="site-main" id="main" role="main">

                        <?php get_template_part( 'template-parts/about/team', 'members' ); ?>

                    </main><!-- #main -->

                </div><!-- #primary -->

            </div><!-- .row end -->

        </div>

	</div><!-- #reasonSection -->

    <div id="athleteSection">

        <div class="<?php echo esc_attr( $container ); ?>">

            <div class="row">

                <div class="col-md-12 content-area" id="primary">

                    <main class="site-main" id="main" role="main">

                        <?php get_template_part( 'template-parts/about/athlete', 'section' ); ?>

                    </main><!-- #main -->

                </div><!-- #primary -->

            </div><!-- .row end -->

        </div>

	</div><!-- #reasonSection -->

</div><!-- #full-width-page-wrapper -->

<?php
}
get_footer();

<?php
/**
 * Template Name: Bodywieght Page
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

    <div id="featuresSection" class="bodyweight">

        <div class="<?php echo esc_attr( $container ); ?>">

            <div class="row">

                <div class="col-md-12 content-area" id="primary">

                    <main class="site-main" id="main" role="main">

                        <?php get_template_part( 'template-parts/sections/features', 'section' ); ?>

                    </main>

                </div>

            </div>

        </div>

	</div><!-- #featuresSection -->

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

    <div id="testimonialsSection" class="bodyweight">

        <div class="<?php echo esc_attr( $container ); ?>">

            <div class="row">

                <div class="col-md-12 content-area" id="primary">

                    <main class="site-main" id="main" role="main">

                        <?php get_template_part( 'template-parts/global/testimonials', 'section' ); ?>

                    </main><!-- #main -->

                </div><!-- #primary -->

            </div><!-- .row end -->

        </div>

	</div><!-- #reasonSection -->

    <div id="reasonsSection">

        <div class="<?php echo esc_attr( $container ); ?>">

            <div class="row">

                <div class="col-md-12 content-area" id="primary">

                    <main class="site-main" id="main" role="main">

                        <?php get_template_part( 'template-parts/sections/reasons-icon', 'section' ); ?>

                    </main><!-- #main -->

                </div><!-- #primary -->

            </div><!-- .row end -->

        </div>

	</div><!-- #reasonSection -->

    <div id="featuresSection" class="steps">

        <div class="<?php echo esc_attr( $container ); ?>">

            <div class="row">

                <div class="col-md-12 content-area" id="primary">

                    <main class="site-main" id="main" role="main">

                        <?php get_template_part( 'template-parts/bodyweight/features-section', 'bw' ); ?>

                    </main>

                </div>

            </div>

        </div>

	</div><!-- #featuresSection -->

    <div id="zQuote">

        <div class="<?php echo esc_attr( $container ); ?>">

            <div class="row">

                <div class="col-md-12 content-area" id="primary">

                    <main class="site-main" id="main" role="main">

                        <?php get_template_part( 'template-parts/global/testimonials-section', 'two' ); ?>

                    </main>

                </div>

            </div>

        </div>

	</div><!-- #zQuote -->

    <div id="pricingSection">

        <div class="<?php echo esc_attr( $container ); ?>">

            <div class="row">

                <div class="col-md-12 content-area" id="primary">

                    <main class="site-main" id="main" role="main">

                        <?php get_template_part( 'template-parts/bodyweight/pricing', 'section' ); ?>

                    </main>

                </div>

            </div>

        </div>

	</div><!-- #featuresSection -->

    <div id="FAQ">

        <div class="<?php echo esc_attr( $container ); ?>">

            <div class="row">

                <div class="col-md-12 content-area" id="primary">

                    <main class="site-main" id="main" role="main">

                        <?php get_template_part( 'template-parts/global/faq', 'section' ); ?>

                    </main>

                </div>

            </div>

        </div>

	</div><!-- #featuresSection -->

</div><!-- #full-width-page-wrapper -->

<?php
}
get_footer();

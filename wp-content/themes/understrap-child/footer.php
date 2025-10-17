<?php
/**
 * The template for displaying the footer
 *
 * Contains the closing of the #content div and all content after
 *
 * @package UnderStrap
 */

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

$container = get_theme_mod( 'understrap_container_type' );

if (
    is_page_template(
            array( 'page-templates/fullwidth-page.php',
                   'page-templates/page-about-template.php',
                   'page-templates/page-application-template.php',
                   'page-templates/page-blog-template.php',
                   'page-templates/page-bodyweight-template.php',
                   'page-templates/page-home-template.php',
                   'page-templates/page-private-coaching-template.php',
                   'page-templates/page-membership-template.php')
        )
    ) :

    get_template_part( 'template-parts/footer/newsletter', 'signup' );

elseif ( is_single() || is_tax() || is_category() ) :

    get_template_part( 'template-parts/footer/newsletter', 'signup' );

else :

endif; ?>

<div class="wrapper" id="wrapper-footer">

	<div class="<?php echo esc_attr( $container ); ?>">

		<div class="row">

			<div class="col-md-12">

				<footer class="site-footer row" id="colophon">

                    <div class="move col-md-3 col-sm-6">

                        <h5>Move With Us</h5>

                        <?php if ( have_rows( 'social_links', 'option' ) ) : ?>

                            <?php while ( have_rows( 'social_links', 'option' ) ) : the_row();
                            $link = get_sub_field( 'link', 'option' );
                            ?>

                                <div class="social-link">

                                    <a href="<?php echo esc_url( $link['url'] ); ?>">

                                        <?php the_sub_field( 'footer_icon' ); ?><?php the_sub_field( 'name' ); ?>

                                    </a>

                                </div>

                            <?php endwhile; ?>

                        <?php else : ?>

                            <?php // no rows found ?>

                        <?php endif; ?>

					</div>

                    <div class="about col-md-3 col-sm-6">

                        <h5>About</h5>

                        <?php
                        wp_nav_menu(
                            array(
                                'theme_location'  => 'footerAbout',
                                'container_class' => '',
                                'container_id'    => '',
                                'menu_class'      => 'about-nav',
                                'fallback_cb'     => '',
                                'menu_id'         => 'about-menu',
                                'depth'           => 2,
                                'walker'          => new Understrap_WP_Bootstrap_Navwalker(),
                            )
                        );
                        ?>

					</div>

                    <div class="terms col-md-3 col-sm-6">

                        <h5>Terms & Conditions</h5>

                        <?php
                        wp_nav_menu(
                            array(
                                'theme_location'  => 'footerTerms',
                                'container_class' => '',
                                'container_id'    => '',
                                'menu_class'      => 'terms-nav',
                                'fallback_cb'     => '',
                                'menu_id'         => 'terms-menu',
                                'depth'           => 2,
                                'walker'          => new Understrap_WP_Bootstrap_Navwalker(),
                            )
                        );
                        ?>

					</div>

                    <div class="resources col-md-3 col-sm-6">

                        <h5>Login</h5>

                        <?php
                        wp_nav_menu(
                            array(
                                'theme_location'  => 'footerlogin',
                                'container_class' => '',
                                'container_id'    => '',
                                'menu_class'      => 'cats-nav',
                                'fallback_cb'     => '',
                                'menu_id'         => 'cats-menu',
                                'depth'           => 2,
                                'walker'          => new Understrap_WP_Bootstrap_Navwalker(),
                            )
                        );
                        ?>

					</div>

                    <div class="site-info col-12">

                        <p>© Copyright 2021 The Samsara Experience</p>

					</div><!-- .site-info -->

				</footer><!-- #colophon -->

			</div><!--col end -->

		</div><!-- row end -->

	</div><!-- container end -->

</div><!-- wrapper end -->

</div> <!-- #page we need this extra closing tag here -->

<?php wp_footer(); ?>

<script type="text/javascript" src="<?php echo get_stylesheet_directory_uri(); ?>/owlcarousel/owl.carousel.min.js"></script>
<script type="text/javascript">

jQuery( document ).ready(function($){

    // Testimonial Slider Controls
    $('#testimonialSlider, #testimonialSlider2').owlCarousel({
        loop: true,
        nav: false,
        dots: true,
        margin: 15,
        navText : ['<i class="fas fa-caret-left"></i>','<i class="fas fa-caret-right"></i>'],
        responsive:{
            0:{
                items:1
            },
        }
      })

    $(".rotate").click(function(){
        $(this).toggleClass("down");
    })

    $(function () {
      $('[data-toggle="tooltip"]').tooltip()
    })

    $(function() {
        $('.blog-card').matchHeight();
    });

});
</script>

<!-- Start of HubSpot Embed Code -->
<script type="text/javascript" id="hs-script-loader" async defer src="//js.hs-scripts.com/48296755.js"></script>
<!-- End of HubSpot Embed Code -->

</body>

</html>


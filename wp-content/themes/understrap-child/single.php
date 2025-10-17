<?php
/**
 * The template for displaying all single posts
 *
 * @package UnderStrap
 */

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

get_header();
$container = get_theme_mod( 'understrap_container_type' );
?>

<div class="wrapper" id="single-wrapper">

	<div class="<?php echo esc_attr( $container ); ?>" id="content" tabindex="-1">

		<div class="row">

            <?php
				while ( have_posts() ) {

					the_post(); ?>


                    <?php
                    $postVideo = get_field( 'video_shortcode' );

                    if ( get_field( 'video_shortcode' ) ) : ?>

                        <div class="video-embed col-12">

                            <?php echo do_shortcode( get_field('video_shortcode', false, false) ) ; ?>

                        </div>

                    <?php else : ?>

                        <div class="single-featured-image col-12">

                            <?php echo get_the_post_thumbnail( $post->ID, 'large' ); ?>

                        </div>

                    <?php endif; ?>

                    <header class="entry-header col-12">

                        <div class="entry-meta">

                            <?php the_date(); ?>    |    Posted By: <?php the_author(); ?>

                        </div><!-- .entry-meta -->

                        <?php the_title( '<h1 class="entry-title">', '</h1>' ); ?>

                    </header><!-- .entry-header -->

			         <main class="site-main col-lg-8" id="main">

                         <?php get_template_part( 'loop-templates/content', 'single' ); ?>

			         </main><!-- #main -->

                    <div class="col-lg-4 sidebar-wrapper">

                        <?php get_template_part( 'sidebar-templates/sidebar', 'post' ); ?>

                    </div>

                <div class="comments col-12">

                <?php

                // If comments are open or we have at least one comment, load up the comment template.
				if ( comments_open() || get_comments_number() ) {
				    comments_template();
				}

                } ?>

                </div>

		</div><!-- .row -->

	</div><!-- #content -->

</div><!-- #single-wrapper -->

<?php
get_footer();

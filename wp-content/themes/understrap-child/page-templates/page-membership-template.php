<?php
/**
 * Template Name: Membership Template
 *
 * Learn more: http://codex.wordpress.org/Template_Hierarchy
 *
 * @package UnderStrap
 */

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

get_header();

$container = get_theme_mod( 'understrap_container_type' );
?>



<div class="wrapper" id="archive-wrapper">

	<div class="<?php echo esc_attr( $container ); ?>" id="content" tabindex="-1">

			<main class="site-main" id="main">

                <?php get_template_part( 'template-parts/global/category', 'filters' ); ?>

                <?php

                    get_template_part( 'loop-templates/content', 'membership' );

				?>

			</main><!-- #main -->

	</div><!-- #content -->

</div><!-- #archive-wrapper -->

<?php
get_footer();

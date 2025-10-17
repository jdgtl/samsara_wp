<?php
/**
 * Post rendering content according to caller of get_template_part.
 *
 * @package understrap
 */
?>

<?php
$cat = get_term_by('name', single_cat_title('', false), 'category');
$paged = ( get_query_var( 'paged' ) ) ? get_query_var( 'paged' ) : 1;
$args['category_name'] = $cat->slug;
$args['posts_per_page'] = -1;
$args['paged'] = $paged;

$query = new WP_Query( $args );

    if ( $query->have_posts() ) : ?>

        <div class="row">

	    <?php /* Start the Loop */ ?>
	    <?php while ( $query->have_posts() ) : $query->the_post();
            $cats = get_the_category();
            $cat_name = $cats[0]->name;
            $excerpt = get_the_excerpt();
        ?>

        <?php if( $query->current_post == 0 ) { ?>

        <div class="blog-card-wrapper col-12 first">

            <a href="<?php the_permalink(); ?>">

                <div class="blog-card row post-<?php the_ID(); ?>">

                    <div class="col-lg-8 featured-image">

                        <div class="image-wrapper">

                            <?php the_post_thumbnail(); ?>

                        </div>

                    </div>

                    <div class="col-lg-4 meta">

                        <div class="category"><?php echo $cat_name ?></div>

                        <h3><?php the_title(); ?></h3>

                        <p class="d-none d-lg-block excerpt"><?php echo $excerpt ?></p>

                    </div>

                </div>

            </a>

        </div>

        <?php } else { ?>

            <div class="blog-card-wrapper col-md-6 col-lg-4 col-xs-12 grid">

            <a href="<?php the_permalink(); ?>">

                <div class="blog-card">

                    <div class="post-<?php the_ID(); ?>">

                        <?php the_post_thumbnail('featured-medium-720'); ?>

                        <div class="meta">

                            <div class="category"><?php echo $cat_name ?></div>

                            <h3><?php the_title(); ?></h3>

                        </div>

                    </div>

                </div>

            </a>

        </div>

        <?php } ?>

        <?php endwhile;

            wp_reset_postdata();

            ?>

        </div>

	<?php

    endif; ?>
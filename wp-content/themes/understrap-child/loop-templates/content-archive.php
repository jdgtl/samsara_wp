<div class="blog-card-wrapper col-md-6 col-lg-4 col-xs-12 grid">

    <a href="<?php the_permalink(); ?>">

        <div class="blog-card">

            <div class="post-<?php the_ID(); ?>">

                <?php the_post_thumbnail('featured-medium-720'); ?>

                <div class="meta">

                    <div class="category"><?php //echo $cat_name ?></div>

                    <h3><?php the_title(); ?></h3>

                </div>

            </div>

        </div>

    </a>

</div>
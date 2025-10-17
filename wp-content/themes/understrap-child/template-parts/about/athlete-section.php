<?php if ( have_rows( 'athlete' ) ) : $i = 0; ?>

    <div class="athlete-wrapper row">

        <div class="top-section col-12">

            <h2><?php the_field( 'athelte_headline' ); ?></h2>

            <h4><?php the_field( 'athlete_sub-headline' ); ?></h4>

        </div>

	<?php while ( have_rows( 'athlete' ) ) : the_row(); $i++; ?>

        <div class="single-athlete col-lg-4 col-md-6">

            <div class="inside-wrapper">

                    <?php $headshot = get_sub_field( 'athlete_headshot' ); ?>

                <div class="headshot">

                    <a href="javascript:void(0);" data-fancybox data-src="#athlete-<?php echo $i; ?>" class="bio-link">

                        <img src="<?php echo esc_url( $headshot['sizes']['rta_thumb_no_cropped_700x700'] ); ?>" alt="<?php echo esc_attr( $headshot['alt'] ); ?>" />

                    </a>

                </div>

                <div class="meta">

                    <h5><?php the_sub_field( 'athlete_name' ); ?></h5>

                    <h6><?php the_sub_field( 'athlete_sport' ); ?></h6>

                </div>

            </div>

            <div class="fancybox athlete-bio" id="athlete-<?php echo $i; ?>">

                <?php $action_shot = get_sub_field( 'action_shot' ); ?>

                <img src="<?php echo esc_url( $action_shot['url'] ); ?>">

                <h5><?php the_sub_field( 'athlete_name' ); ?></h5>

                <h6><?php the_sub_field( 'athlete_sport' ); ?></h6>

                <?php the_sub_field( 'athlete_bio' ); ?>

            </div>

        </div>

	<?php endwhile; ?>

    </div>

<?php else : ?>

	<?php // no rows found ?>

<?php endif; ?>

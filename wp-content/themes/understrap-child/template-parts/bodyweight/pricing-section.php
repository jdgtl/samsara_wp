<div class="section-info">

    <div class="top-info">

        <?php if ( get_field( 'bwp_top_headline' ) ) : ?>

            <p class="top-headline"><?php the_field( 'bwp_top_headline' ); ?></p>

        <?php endif; ?>

        <h2><?php the_field( 'bwp_headline' ); ?></h2>

        <?php if ( get_field( 'bwp_sub-headline' ) ) : ?>

            <h4><?php the_field( 'bwp_sub-headline' ); ?></h4>

        <?php endif; ?>

        <?php if ( get_field( 'bwp_paragraph' ) ) :

            the_field( 'bwp_paragraph' );

        endif; ?>

    </div>

    <?php if ( have_rows( 'bwp_levels' ) ) : ?>

    <div class="row feature-set">

        <?php while ( have_rows( 'bwp_levels' ) ) : the_row(); ?>

        <div class="<?php if ( get_field( 'bwp_columns' ) == 'four' ) : ?>col-lg-3 col-md-6<?php else : ?>col-md-4<?php endif; ?> single-feature-wrapper">

            <div class="single-feature">

                <div class="level">

                    <h5><?php the_sub_field( 'bwp_level' ); ?></h5>

                </div>

                <div class="meta">

                    <h6>Price: <?php the_sub_field( 'level_price' ); ?></h6>

                    <div class="hrfull"></div>

                    <?php $bwp_button_link = get_sub_field( 'bwp_button_link' ); ?>

                    <div class="product-info">

                        <?php the_sub_field( 'bwp_full_text' ); ?>

                    </div>

                </div>

                <a href="<?php echo esc_url( $bwp_button_link['url'] ); ?>" class="button btn">Buy Now</a>

            </div>

        </div>

        <?php endwhile; ?>

        <?php else : ?>

            <?php // no rows found ?>

        <?php endif; ?>

    </div>

    <?php if ( have_rows( 'full_package_setup' ) ) : ?>

    <div class="row full-program">

	<?php while ( have_rows( 'full_package_setup' ) ) : the_row(); ?>

        <div class="col-12 full-package-info">

            <div class="meta">

                <?php the_sub_field( 'full_package_info' ); ?>

                <?php $fp_link = get_sub_field( 'fp_link' ); ?>

                <a class="button btn" href="<?php echo esc_url( $fp_link['url'] ); ?>" class="button btn">Buy Now</a>

            </div>

        </div>

	<?php endwhile; ?>

    </div>

    <div class="bottom-info">

    <?php the_field( 'bottom_info' ); ?>

        <?php if ( have_rows( 'bw_button' ) ) : ?>

        <?php while ( have_rows( 'bw_button' ) ) : the_row(); ?>

            <?php $link = get_sub_field( 'link' ); ?>

            <a class="button btn" href="<?php echo esc_url( $link['url'] ); ?>">

                <div class="button-text">

                    <div class="top-text"><?php the_sub_field( 'top_text' ); ?></div>

                    <span class="sub-button-text"><?php the_sub_field( 'bottom_text' ); ?></span>

                </div>

            </a>

        <?php endwhile; ?>

    <?php endif; ?>

    </div>

    <?php endif; ?>

</div>
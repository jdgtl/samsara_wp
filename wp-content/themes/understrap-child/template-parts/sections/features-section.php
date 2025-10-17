<div class="section-info">

    <div class="top-info">

        <?php if ( get_field( 'fb_top_headline' ) ) : ?>

            <p class="top-headline"><?php the_field( 'fb_top_headline' ); ?></p>

        <?php endif; ?>

        <h2><?php the_field( 'fb_headline' ); ?></h2>

        <?php if ( get_field( 'fb_sub-headline' ) ) : ?>

            <h4><?php the_field( 'fb_sub-headline' ); ?></h4>

        <?php endif; ?>

        <?php if ( get_field( 'fb_paragraph' ) ) :

            the_field( 'fb_paragraph' );

        endif; ?>

    </div>

    <?php if ( have_rows( 'feature' ) ) : ?>

    <div class="row feature-set">

        <?php while ( have_rows( 'feature' ) ) : the_row(); ?>

        <?php $image = get_sub_field( 'image' ); ?>

        <div class="<?php if ( get_field( 'columns' ) == 'four' ) : ?>col-lg-3 col-md-6<?php else : ?>col-md-4<?php endif; ?> single-feature-wrapper">

            <div class="single-feature">

                <div class="image-wrapper">

                    <div class="feature-image h-100 w-100" style="background: url('<?php echo esc_url( $image['url'] ); ?>');">

                        <div class="overlay row h-100 w-100 m-0">

                            <h5 class="my-auto col-12"><?php the_sub_field( 'headline' ); ?></h5>

                        </div>

                     </div>

                </div>

                <div class="meta">

                    <h6><?php the_sub_field( 'sub-headline' ); ?></h6>

                    <div class="hr"></div>

                    <?php the_sub_field( 'full_text' ); ?>

                </div>

            </div>

        </div>

        <?php endwhile; ?>

        <?php else : ?>

            <?php // no rows found ?>

        <?php endif; ?>

    </div>

    <?php if ( have_rows( 'buttons' ) ) : ?>

    <div class="button-set">

    <?php while ( have_rows( 'buttons' ) ) : the_row(); ?>

        <?php $button_link = get_sub_field( 'f_button_link' ); ?>

        <a class="btn button" href="<?php echo esc_url( $button_link['url'] ); ?>" >

            <div class="button-text">

                <div class="top-text"><?php the_sub_field( 'f_button_text' ); ?></div>

                <?php if ( get_sub_field( 'f_button_sub-text' ) ) : ?>

                    <span class="sub-button-text"><?php the_sub_field( 'f_button_sub-text' ); ?></span>

                <?php endif; ?>

            </div>

        </a>

	<?php endwhile; ?>

    </div>

    <?php else : ?>

        <?php // no rows found ?>

    <?php endif; ?>

</div>
<div class="section-info">

    <div class="top-info">

        <?php if ( get_field( 're_top_headline' ) ) : ?>

            <p class="top-headline"><?php the_field( 're_top_headline' ); ?></p>

        <?php endif; ?>

        <h2><?php the_field( 're_headline' ); ?></h2>

        <?php if ( get_field( 're_sub-headline' ) ) : ?>

            <h4><?php the_field( 're_sub-headline' ); ?></h4>

        <?php endif; ?>

        <?php if ( get_field( 're_paragraph' ) ) :

            the_field( 're_paragraph' );

        endif; ?>

    </div>

    <?php if ( have_rows( 'reason' ) ) : ?>

    <div class="row reason-set">

        <?php while ( have_rows( 'reason' ) ) : the_row(); ?>

        <div class="<?php if ( get_field( 're_columns' ) == 'four' ) : ?>col-lg-3 col-md-6<?php else : ?>col-md-4<?php endif; ?> single-reason-wrapper">

            <div class="single-reason">

                <div class="icon"><?php the_sub_field( 'icon' ); ?></div>

                <hr class="hr">

                <div class="top-text"><?php the_sub_field( 'r_headline' ); ?></div>

                <div class="bottom-text"><?php the_sub_field( 'r_sub-headline' ); ?></div>

            </div>

        </div>

        <?php endwhile; ?>

        <?php else : ?>

            <?php // no rows found ?>

        <?php endif; ?>

    </div>

    <?php if ( get_field( 're_bottom_info' ) ) : ?>

        <div class="bottom-info">

            <?php the_field( 're_bottom_info' ); ?>

        </div>

    <?php endif; ?>

    <?php if ( have_rows( 're_buttons' ) ) : ?>

    <div class="button-set">

    <?php while ( have_rows( 're_buttons' ) ) : the_row(); ?>

        <?php $button_link = get_sub_field( 're_button_link' ); ?>

        <a class="btn button" href="<?php echo esc_url( $button_link['url'] ); ?>" >

            <div class="button-text">

                <div class="top-text"><?php the_sub_field( 're_button_text' ); ?></div>

                <?php if ( get_sub_field( 're_sub-button_text' ) ) : ?>

                    <span class="sub-button-text"><?php the_sub_field( 're_sub-button_text' ); ?></span>

                <?php endif; ?>

            </div>

        </a>

	<?php endwhile; ?>

    </div>

    <?php else : ?>

        <?php // no rows found ?>

    <?php endif; ?>

</div>
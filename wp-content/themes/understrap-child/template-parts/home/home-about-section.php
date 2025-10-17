<div class="section-info">

    <div class="top-info">

        <h2><?php the_field( 'a_headline' ); ?></h2>

        <h4><?php the_field( 'a_sub-headline' ); ?></h4>

        <?php if ( get_field( 'a_content' ) ) :

            the_field( 'a_content' );

        endif; ?>

    </div>

    <?php if ( have_rows( 'a_button_setup' ) ) : ?>

    <div class="button-set">

    <?php while ( have_rows( 'a_button_setup' ) ) : the_row(); ?>

        <?php $button_link = get_sub_field( 'a_button_link' ); ?>

        <a class="btn button" href="<?php echo esc_url( $button_link['url'] ); ?>" >

            <div class="button-text">

                <div class="top-text"><?php the_sub_field( 'a_button_text' ); ?></div>

                <?php if ( get_sub_field( 'a_button_sub-text' ) ) : ?>

                    <span class="sub-button-text"><?php the_sub_field( 'a_button_sub-text' ); ?></span>

                <?php endif; ?>

            </div>

        </a>

	<?php endwhile; ?>

    </div>

    <?php else : ?>

        <?php // no rows found ?>

    <?php endif; ?>

</div>
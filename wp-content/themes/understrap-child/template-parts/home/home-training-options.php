<div class="section-info">

    <p><?php the_field( 'tr_top-headline' ); ?></p>

    <h2><?php the_field( 'tr_headline' ); ?></h2>

</div>

<?php if ( have_rows( 'training_options' ) ) : ?>

    <div class="row training-wrapper">

	<?php while ( have_rows( 'training_options' ) ) : the_row(); ?>

        <div class="single-option col-sm-6">

            <div class="inner-wrapper">

                <div class="type-wrapper">

                    <p class="type"><?php the_sub_field( 'tr_type' ); ?></p>

                </div>

                <div class="meta">

                    <h6><?php the_sub_field( 'tr_type_headline' ); ?></h6>

                    <hr class="hr">

                    <p><?php the_sub_field( 'tr_paragraph' ); ?></p>

                </div>

                <?php $tr_link = get_sub_field( 'tr_link' ); ?>

                <a href="<?php echo esc_url( $tr_link['url'] ); ?>">

                    <div class="cta-wrapper">

                        <?php the_sub_field( 'cta' ); ?>

                    </div>

                </a>

            </div>

        </div>

	<?php endwhile; ?>

    </div>

<?php else : ?>

	<?php // no rows found ?>

<?php endif; ?>
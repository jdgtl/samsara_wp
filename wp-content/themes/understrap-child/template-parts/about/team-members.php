<?php if ( have_rows( 'team_member' ) ) : ?>

    <div class="team-member-wrapper row">

        <h2 class="col-12">

            <?php the_field( 'team_headline' ); ?>

        </h2>

	<?php while ( have_rows( 'team_member' ) ) : the_row(); ?>

        <div class="single-member col-lg-4 col-md-6">

            <div class="inside-wrapper">

                <?php $headshot = get_sub_field( 'headshot' ); ?>

                <div class="headshot">

                    <img src="<?php echo esc_url( $headshot['sizes']['rta_thumb_no_cropped_700x700'] ); ?>" alt="<?php echo esc_attr( $headshot['alt'] ); ?>" />

                </div>

                <div class="meta">

                    <h5><?php the_sub_field( 'name' ); ?></h5>

                    <h6><?php the_sub_field( 'position' ); ?></h6>

                    <hr class="hr">

                    <p><?php the_sub_field( 'info' ); ?></p>

                </div>

                <?php $link = get_sub_field( 'link' ); ?>

                <a class="button btn" href="<?php echo esc_url( $link['url'] ); ?>">

                    <?php the_sub_field( 'button_text' ); ?>

                </a>

            </div>

        </div>

	<?php endwhile; ?>

    </div>

<?php else : ?>

	<?php // no rows found ?>

<?php endif; ?>
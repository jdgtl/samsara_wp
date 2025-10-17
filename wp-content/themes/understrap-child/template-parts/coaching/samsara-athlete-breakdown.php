<div class="section-info">

    <?php if ( have_rows( 'athlete_info' ) ) : ?>

        <div class="top-info">

        <h2><?php the_field( 'athlete_header' ); ?></h2>

        <?php if ( get_field( 'athlete_sub-header' ) ) : ?>

            <h4><?php the_field( 'athlete_sub-header' ); ?></h4>

        <?php endif; ?>

        </div>

        <div class="row">

        <?php while ( have_rows( 'athlete_info' ) ) : the_row(); ?>

            <div class="col-md-6 single-info">

                <h5><i class="far fa-check"></i><?php the_sub_field( 'header' ); ?></h5>

                <p><?php the_sub_field( 'info' ); ?></p>

            </div>

        <?php endwhile; ?>

        </div>

    <?php else : ?>

        <?php // no rows found ?>

    <?php endif; ?>

</div>
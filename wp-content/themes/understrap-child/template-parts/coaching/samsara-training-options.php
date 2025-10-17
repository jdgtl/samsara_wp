<div class="section-info">

    <div class="top-info">

    <?php if ( get_field( 'c_top_headline' ) ) : ?>

        <p class="top-headline"><?php the_field( 'c_top_headline' ); ?></p>

    <?php endif; ?>

    <h2><?php the_field( 'c_headline' ); ?></h2>

    <?php if ( get_field( 'c_sub-headline' ) ) : ?>

        <h4><?php the_field( 'c_sub-headline' ); ?></h4>

    <?php endif; ?>

    <?php if ( get_field( 'c_paragraph' ) ) : ?>

        <?php the_field( 'c_paragraph' ); ?>

    <?php endif; ?>

    </div>

    <div class="table-responsive">

    <?php if ( have_rows( 'training_table' ) ) : ?>

        <table class="table table-striped">

            <thead>

                <tr class="top">

                    <th>The Samsara Experience</th>

                    <th>MANDALA<br>$290/month</th>

                    <th>MOMENTUM<br>$490/month</th>

                    <th>MATRIX<br>$990/month</th>

                </tr>

                <tr class="apply">

                    <th>Hover For Info</th>

                    <th><a href="<?php site_url(); ?>/samsara-experience-application">Apply</a></th>

                    <th><a href="<?php site_url(); ?>/samsara-experience-application">Apply</a></th>

                    <th><a href="<?php site_url(); ?>/samsara-experience-application">Apply</a></th>

                </tr>

            </thead>

            <tbody>

                <?php while ( have_rows( 'training_table' ) ) : the_row(); ?>

                    <tr>

                        <td class="experience">

                            <a data-toggle="tooltip" data-placement="top" data-original-title="<?php the_sub_field( 'more_info' ); ?>">

                                <?php the_sub_field( 'experience' ); ?>
                            </a>

                        </td>

                        <td><?php the_sub_field( 'mandala' ); ?></td>

                        <td><?php the_sub_field( 'momentum' ); ?></td>

                        <td><?php the_sub_field( 'matrix' ); ?></td>

                    </tr>

                <?php endwhile; ?>

            </tbody>

        </table>

    </div>

    <div class="bottom-info">

        <?php the_field( 'c_bottom_table' ); ?>

        <?php if ( have_rows( 'c_button_setup' ) ) : ?>

            <?php while ( have_rows( 'c_button_setup' ) ) : the_row(); ?>

            <?php $c_button_link = get_sub_field( 'c_button_link' ); ?>

            <a class="btn button top" href="<?php echo esc_url( $c_button_link['url'] ); ?>">

                <div class="button-text">

                    <div class="top-text"><?php the_sub_field( 'c_button_text' ); ?></div>

                    <span class="sub-button-text"><?php the_sub_field( 'c_button_sub-text' ); ?></span>

                </div>


            </a>

            <?php endwhile; ?>

        <?php endif; ?>

        <?php the_field( 'c_bottom_table_2' ); ?>

        <?php if ( have_rows( 'c_button_setup_2' ) ) : ?>

            <?php while ( have_rows( 'c_button_setup_2' ) ) : the_row(); ?>

            <?php $c_button_link = get_sub_field( 'c_button_link' ); ?>

            <a class="btn button bottom" href="<?php echo esc_url( $c_button_link['url'] ); ?>">

                <div class="button-text">

                    <div class="top-text"><?php the_sub_field( 'c_button_text' ); ?></div>

                    <span class="sub-button-text"><?php the_sub_field( 'c_button_sub-text' ); ?></span>

                </div>


            </a>

            <?php endwhile; ?>

        <?php endif; ?>

    </div>

    <?php else : ?>

        <?php // no rows found ?>

    <?php endif; ?>

</div>
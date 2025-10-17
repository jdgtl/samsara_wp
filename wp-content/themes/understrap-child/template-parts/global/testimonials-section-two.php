<?php if ( have_rows( '2_testimonial' ) ) : ?>

    <div class="testimonials-wrapper">

        <div class="owl-carousel owl-theme" id="testimonialSlider2">

        <?php while ( have_rows( '2_testimonial' ) ) : the_row(); ?>

            <?php
            $headshot = get_sub_field('2_headshot');
            $size = 'rta_thumb_no_cropped_200x200';
            $image_url = $headshot['sizes'][$size];
            ?>

            <div class="single-testimonial row">

                <div class="headshot col-md-3">

                    <img src="<?php echo $image_url; ?>" />

                </div>

                <div class="testimonial col-md-9">

                    <i class="fas fa-quote-left"></i>

                    <div class="meta">

                        <p><?php the_sub_field( '2_text' ); ?></p>

                        <span><?php the_sub_field( '2_credit' ); ?></span>

                    </div>

                </div>

            </div>

        <?php endwhile; ?>

        </div>

    </div>

<?php else : ?>

	<?php // no rows found ?>

<?php endif; ?>
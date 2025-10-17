<?php
$counter = 1;
if ( have_rows( 'question' ) ) : ?>

    <div class="top-info">


        <h2><?php the_field( 'faq_headline' ); ?></h2>

        <?php if ( get_field( 'faq_sub-headline' ) ) : ?>

            <h4><?php the_field( 'faq_sub-headline' ); ?></h4>

        <?php endif; ?>

    </div>

    <div class="faq-wrapper">

	<?php while ( have_rows( 'question' ) ) : the_row(); ?>

        <div class="single-faq">

            <a class="btn" data-toggle="collapse" href="#collapseExample-<?php echo $counter; ?>" role="button" aria-expanded="false" aria-controls="collapseExample-<?php echo $counter; ?>"><i class="fas fa-plus rotate"></i></a>

            <h5><?php the_sub_field( 'question' ); ?></h5>

            <div class="collapse" id="collapseExample-<?php echo $counter; ?>">

                <div class="answer answer-body">

                    <p>

                        <?php the_sub_field( 'answer' ); ?>

                    </p>

                </div>

            </div>

        </div>

	<?php
    $counter++;
    endwhile;
    ?>

    </div>

<?php else : ?>

	<?php // no rows found ?>

<?php endif; ?>
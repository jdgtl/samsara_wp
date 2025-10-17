<?php
// Variables
$image = get_field( 'image' , 'option' );
$url = $image['url'];
$size = "rta_thumb_no_cropped_800x";
$mobileImage = $image['sizes'][ $size ];
$detect = new Mobile_Detect;
?>

<?php

if ( $detect->isMobile() ) : ?>

<div class="mobile-hero">

    <div class="mobile-hero-img">

        <img src="<?php echo esc_url($mobileImage); ?>" />

        <div class="container">

            <div class="row">

                <div class="meta pt-3 pb-5 col-12">

                    <?php if ( get_field( 'top-headline' , 'option' ) ) : ?>

                        <p class="top-headline"><?php the_field( 'top-headline' , 'option' ); ?></p>

                    <?php endif; ?>

                    <h1 class="headline">

                        <?php if ( get_field( 'headline' , 'option' ) ) :

                            the_field( 'headline' , 'option' );

                        else :

                            the_title();

                        endif; ?>

                    </h1>

                    <?php if ( get_field( 'sub-headline' , 'option' ) ) : ?>

                        <h4 class="sub-headline mt-4 mb-4"><?php the_field( 'sub-headline' , 'option' ); ?></h4>

                    <?php endif; ?>

                    <?php if ( have_rows( 'button_setup' , 'option' ) ) : ?>

                        <?php while ( have_rows( 'button_setup' ) ) : the_row(); ?>

                        <?php $button_link = get_sub_field( 'button_link' , 'option' ); ?>

                            <a class="btn button" href="<?php echo esc_url( $button_link['url'] ); ?>" >

                                <div class="button-text">

                                    <div class="top-text"><?php the_sub_field( 'button_text' , 'option' ); ?></div>

                                    <?php if ( get_sub_field( 'button_sub-text' , 'option' ) ) : ?>

                                    <span class="sub-button-text"><?php the_sub_field( 'button_sub-text' , 'option' ); ?></span>

                                    <?php endif; ?>

                                </div>

                            </a>

                        <?php endwhile; ?>

                    <?php else : ?>

                        <?php // no rows found ?>

                    <?php endif; ?>

                    <?php if ( get_field( 'photo_credit' , 'option' ) ) : ?>

                    <?php endif; ?>

                </div>

            </div>

        </div>

    </div>

</div>

<?php else : ?>

<div class="full-width-hero-wrapper" style="height:<?php if ( get_field( 'hero_height' , 'option' ) == 'full' ) : ?>100vh;<?php else :?>50vh;<?php endif; ?> background-image: url('<?php if ( $detect->isMobile() ) { echo esc_url($mobileImage); } else { echo esc_url( $image['url'] ); } ?>'); background-position:<?php if ( get_field( 'photo_alignment' ) == 'left' ) : ?>left center;<?php elseif ( get_field( 'photo_alignment' ) == 'right' ) : ?>right center;<?php else : ?>center center;<?php endif; ?>">

    <div class="<?php if ( get_field( 'hero_height' , 'option' ) == 'full' ) : ?>overlay-full<?php else :?>overlay-half<?php endif; ?> row h-100 w-100 m-0">

        <div class="meta col-12 <?php if ( get_field( 'text_alignment' , 'option' ) == 'bottom' ) : ?>my-auto<?php else : ?>my-auto <?php endif; ?>" style="text-align: <?php if ( get_field( 'text_alignment' , 'option' ) == 'bottom' ) : ?>center; margin-bottom: 200px;<?php else : the_field( 'text_alignment' , 'option' ); endif; ?>">

            <div class="container">

                <?php if ( get_field( 'top-headline' , 'option' ) ) : ?>

                    <p class="top-headline"><?php the_field( 'top-headline' , 'option' ); ?></p>

                <?php endif; ?>

                <h1 class="headline">

                    <?php if ( get_field( 'headline' , 'option' ) ) :

                        the_field( 'headline' , 'option' );

                    else :

                        the_title();

                    endif; ?>

                </h1>

                <?php if ( get_field( 'sub-headline' , 'option' ) ) : ?>

                    <h4 class="sub-headline"><?php the_field( 'sub-headline' , 'option' ); ?></h4>

                <?php endif; ?>

                <?php if ( have_rows( 'button_setup' , 'option' ) ) : ?>

                    <?php while ( have_rows( 'button_setup' , 'option' ) ) : the_row(); ?>

                    <?php $button_link = get_sub_field( 'button_link' , 'option' ); ?>

                        <a class="btn button" href="<?php echo esc_url( $button_link['url'] ); ?>" >

                            <div class="button-text">

                                <div class="top-text"><?php the_sub_field( 'button_text' , 'option' ); ?></div>

                                <?php if ( get_sub_field( 'button_sub-text' , 'option' ) ) : ?>

                                <span class="sub-button-text"><?php the_sub_field( 'button_sub-text' , 'option' ); ?></span>

                                <?php endif; ?>

                            </div>

                        </a>

                    <?php endwhile; ?>

                <?php else : ?>

                    <?php // no rows found ?>

                <?php endif; ?>

                <?php if ( get_field( 'photo_credit' , 'option' ) ) : ?>

                <?php endif; ?>

            </div>

        </div>

    </div>

</div>

<div class="photo-credit"><i class="fas fa-camera"></i><?php the_field( 'photo_credit' , 'option' ); ?></div>

<?php endif; ?>
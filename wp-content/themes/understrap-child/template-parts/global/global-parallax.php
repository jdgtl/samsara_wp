<?php
$background_image = get_field( 'background_image' );
$url = $background_image['url'];
$size = "rta_thumb_no_cropped_800x";
$mobileParallax = $background_image['sizes'][ $size ];
$detect = new Mobile_Detect;
?>

<?php if ( $background_image ) : ?>

    <?php if ( $detect->isMobile() ) : ?>

        <img src="<?php echo $mobileParallax; ?>" />

    <?php else : ?>

        <div class="parallax" id="parallax" style="background-image: url('<?php echo esc_url( $background_image['url'] ); ?>');"></div>

    <?php endif; ?>

<?php else : ?>

<?php endif; ?>

<?php if ( get_field( 'p_photo_credit' ) ) : ?>

    <div class="photo-credit parallax-pc"><i class="fas fa-camera"></i><?php the_field( 'p_photo_credit' ); ?></div>

<?php endif; ?>
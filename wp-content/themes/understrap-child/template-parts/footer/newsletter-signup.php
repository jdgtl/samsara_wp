<?php $newsletter_background_image = get_field( 'newsletter_background_image', 'option' ); ?>

<div class="newsletter-signup" id="wrapper-newsletter" style="background: url('<?php echo esc_url( $newsletter_background_image['url'] ); ?>')">

    <div class="overlay h-100 w-100 m-0">

        <div class="container h-100 w-100">

            <div class="row h-100 w-100 m-0">

                <div class="meta col-12 my-auto">

                    <h2><?php the_field( 'newsletter_headline', 'option' ); ?></h2>

                    <p><?php the_field( 'newsletter_sub-headline', 'option' ); ?></p>

                    <!-- Begin Mailchimp Signup Form -->
                    <link href="//cdn-images.mailchimp.com/embedcode/slim-10_7.css" rel="stylesheet" type="text/css">

                    <div id="mc_embed_signup">

                        <form action="https://samsaraexperience.us17.list-manage.com/subscribe/post?u=1bc9b89d4979fa042741bf6fb&amp;id=7e10fc425b" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" class="validate" target="_blank" novalidate>
                            <div id="mc_embed_signup_scroll">

                            <input type="email" value="" name="EMAIL" class="email" id="mce-EMAIL" placeholder="email address" required>

                            <!-- real people should not fill this in and expect good things - do not remove this or risk form bot signups-->
                            <div style="position: absolute; left: -5000px;" aria-hidden="true">

                                <input type="text" name="b_1bc9b89d4979fa042741bf6fb_7e10fc425b" tabindex="-1" value="">

                            </div>

                            <div class="clear"><input type="submit" value="Subscribe" name="subscribe" id="mc-embedded-subscribe" class="button"></div>

                            </div>

                        </form>

                    </div>

<!--End mc_embed_signup-->

                </div>

            </div>

        </div>

    </div>

</div>

<?php if ( get_field( 'e_photo_credit', 'option' ) ) : ?>

    <div class="photo-credit footer-pc">

        <i class="fas fa-camera"></i><?php the_field( 'e_photo_credit', 'option' ); ?>

    </div>

<?php endif; ?>
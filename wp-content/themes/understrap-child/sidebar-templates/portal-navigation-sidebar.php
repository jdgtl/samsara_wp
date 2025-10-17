<div class="portal-nav-mobile d-block d-lg-none">

    <div class="row align-items-center">

        <div class="client-avatar col-6">

            <?php echo do_shortcode('[wpc_client_avatar_preview]'); ?>

            <?php //echo do_shortcode('[wpc_client_profile]'); ?>

        </div>

         <div class="portal-nav-icon col-6">

             <a class="btn btn-primary" data-toggle="collapse" href="#mobileNav" role="button" aria-expanded="false" aria-controls="mobileNav">

                <i class="fas fa-ellipsis-v"></i>

             </a>

        </div>

        <div class="portal-nav-block col-12 collapse" id="mobileNav">

            <ul class="hub-link">

                <li><?php echo do_shortcode('[wpc_client_get_page_link page="hub" text="Athlete Home"]'); ?></li>

            </ul>

            <?php dynamic_sidebar( 'sidebar-portal' ); ?>

            <ul class="logout">

                <li><?php echo do_shortcode('[wpc_client_logoutb]'); ?></li>

            </ul>

        </div>

    </div>

</div>

<div class="portal-nav d-none d-lg-block">

    <div class="client-avatar-d">

        <?php echo do_shortcode('[wpc_client_avatar_preview]'); ?>

    </div>

    <div class="portal-nav-block">

        <ul class="hub-link">

            <li><?php echo do_shortcode('[wpc_client_get_page_link page="hub" text="Athlete HUB"]'); ?></li>

        </ul>

        <?php dynamic_sidebar( 'sidebar-portal' ); ?>

        <ul class="logout">

            <li><?php echo do_shortcode('[wpc_client_logoutb]'); ?></li>

        </ul>

    </div>

</div>
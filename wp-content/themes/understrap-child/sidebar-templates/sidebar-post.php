<div class="right-sidebar">

    <?php

    if ( is_singular( 'membership' ) ) :

    dynamic_sidebar( 'members-sidebar-area' );

    else :

    dynamic_sidebar( 'right-sidebar' );

    endif; ?>

</div>

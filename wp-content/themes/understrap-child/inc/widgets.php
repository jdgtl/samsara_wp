<?php

if(!function_exists('woosidebar')) {

    function woosidebar() {
        register_sidebar( array(
            'name'          => __( 'Woocommerce Sidebar', 'textdomain' ),
            'id'            => 'woosidebar',
            'description'   => __( 'Widgets in this area will be shown on all woocommerce build a box pages and curated box pages.', 'textdomain' ),
            'before_widget' => '<li id="%1$s" class="widget %2$s">',
            'after_widget'  => '</li>',
            'before_title'  => '<h2 class="widgettitle">',
            'after_title'   => '</h2>',
        ) );
    }
    add_action( 'widgets_init', 'woosidebar' );

}

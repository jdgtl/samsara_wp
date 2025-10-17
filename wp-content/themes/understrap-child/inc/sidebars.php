<?php

function wpb_widgets_init() {

    register_sidebar( array(
        'name' => __( 'Portal Sidebar', 'wpb' ),
        'id' => 'sidebar-portal',
        'description' => __( 'The main sidebar for portal pages', 'wpb' ),
        'before_widget' => '<aside class="widget %2$s portal-list">',
        'after_widget' => '</aside>',
        'before_title' => '<h3 class="widget-title">',
        'after_title' => '</h3>',
    ) );
}

add_action( 'widgets_init', 'wpb_widgets_init' );
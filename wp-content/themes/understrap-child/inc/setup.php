<?php

/**
* Child Theme Setup
*/

// Set the content width based on the theme's design and stylesheet.
if ( ! isset( $content_width ) ) {
	$content_width = 840; /* pixels */
}

function understrap_child_setup() {

    // Register other image sizes for media uploader
    //add_filter( 'image_size_names_choose', 'my_image_sizes' );
    //function my_image_sizes( $sizes ) {
    //    $addsizes = array(
    //        'small' => __( 'Small' ),
    //    );
    //    $newsizes = array_merge( $sizes, $addsizes );
    //    return $newsizes;
    //}

    //Set up the WordPress Theme logo feature.
    add_theme_support( 'custom-logo' );

    add_theme_support( 'post-thumbnails' );

    add_post_type_support( 'page', 'excerpt' );

    add_theme_support( 'responsive-embeds' );

    add_theme_support( 'woocommerce' );

    add_theme_support( 'align-wide' );

}

/**
 * Filter the except length to 20 words.
 *
 * @param int $length Excerpt length.
 * @return int (Maybe) modified excerpt length.
 */
function wpdocs_custom_excerpt_length( $length ) {
    return 20;
}
add_filter( 'excerpt_length', 'wpdocs_custom_excerpt_length', 999 );

add_action( 'after_setup_theme', 'understrap_child_setup', 11 );

// End Understrap Child Setup


/**
* Remove "Read More" link on the_excerpt script
*/

function understrap_all_excerpts_get_more_link( $post_excerpt ) {

	return $post_excerpt . '';
}

add_filter( 'wp_trim_excerpt', 'understrap_all_excerpts_get_more_link' );

/**
* Theme Options
*/

if ( function_exists( 'acf_add_options_page' ) ) {

	acf_add_options_page( array(
		'page_title'	=> 'Theme Options',
		'menu_title'	=> 'Theme Options',
		'menu_slug' 	=> 'acf-theme-options',
		'capability'	=> 'edit_posts',
		'redirect'		=> false,
	));

}

/**
* Auto-Complete Virtual Product Purchases
*/

add_action('woocommerce_order_status_changed', 'ts_auto_complete_virtual');

function ts_auto_complete_virtual($order_id)
{

if ( ! $order_id ) {
return;
}

global $product;
$order = wc_get_order( $order_id );

if ($order->data['status'] == 'processing') {

$virtual_order = null;

if ( count( $order->get_items() ) > 0 ) {

foreach( $order->get_items() as $item ) {

if ( 'line_item' == $item['type'] ) {

$_product = $order->get_product_from_item( $item );

if ( ! $_product->is_virtual() ) {
// once we find one non-virtual product, break out of the loop
$virtual_order = false;
break;
}
else {
$virtual_order = true;
}
}
}
}

// if all are virtual products, mark as completed
if ( $virtual_order ) {
$order->update_status( 'completed' );
}
}
}

function register_members_sidebar_area() {
register_sidebar(
array(
'id' => 'members-sidebar-area',
'name' => esc_html__( 'Members Sidebar', 'theme-domain' ),
'description' => esc_html__( 'Sidebar for member content', 'theme-domain' ),
'before_widget' => '<div id="%1$s" class="widget %2$s">',
'after_widget' => '</div>',
'before_title' => '<div class="widget-title-holder"><h3 class="widget-title">',
'after_title' => '</h3></div>'
)
);
}
add_action( 'widgets_init', 'register_members_sidebar_area' );
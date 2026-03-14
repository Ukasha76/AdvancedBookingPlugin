<?php
/*
Plugin Name: Celltech Booking Form
Description: A React-based booking form built with Vite. Use the [celltech_booking_form] shortcode to display the form.
Version: 1.0.0
Author: Your Name
Text Domain: celltech-booking-form
*/

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * Shortcode: renders the root element for the React app.
 */
function celltech_booking_shortcode() {
    return '<div id="cell-tech-booking-root" class="celltech-booking-isolated"></div>';
}
add_shortcode( 'celltech_booking_form', 'celltech_booking_shortcode' );

/**
 * Enqueue assets only when shortcode is used on the page.
 */
function celltech_booking_enqueue_assets() {
    global $post;
    if ( ! is_a( $post, 'WP_Post' ) || ! has_shortcode( $post->post_content, 'celltech_booking_form' ) ) {
        return;
    }

    $plugin_url = plugin_dir_url( __FILE__ );
    $plugin_path = plugin_dir_path( __FILE__ );

    $manifest_path = $plugin_path . 'dist/.vite/manifest.json';
    if ( ! file_exists( $manifest_path ) ) {
        return; // no build yet
    }

    $manifest = json_decode( file_get_contents( $manifest_path ), true );
    if ( ! $manifest || empty( $manifest['index.html'] ) ) {
        return;
    }

    $entry = $manifest['index.html'];

    // enqueue css first so it's available before JS boots
    if ( ! empty( $entry['css'] ) ) {
        $deps = array();
        if ( wp_style_is( get_stylesheet(), 'registered' ) ) {
            $deps[] = get_stylesheet();
        }
        foreach ( $entry['css'] as $i => $css ) {
            wp_enqueue_style(
                'celltech-booking-style' . ( $i > 0 ? '-' . $i : '' ),
                $plugin_url . 'dist/' . $css,
                $deps,
                filemtime( $plugin_path . 'dist/' . $css )
            );
        }
    }

    if ( ! empty( $entry['file'] ) ) {
        wp_enqueue_script(
            'celltech-booking-script',
            $plugin_url . 'dist/' . $entry['file'],
            array(),
            filemtime( $plugin_path . 'dist/' . $entry['file'] ),
            true
        );
    }
}
add_action( 'wp_enqueue_scripts', 'celltech_booking_enqueue_assets', 20 );

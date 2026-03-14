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
 * Shortcode: renders the booking form in an iframe for full style isolation from WordPress theme.
 */
function celltech_booking_shortcode() {
    $plugin_url   = plugin_dir_url( __FILE__ );
    $ajax_url     = admin_url( 'admin-ajax.php' );
    $form_url     = $plugin_url . 'dist/index.html';
    $form_url_add = add_query_arg( 'ajax_url', $ajax_url, $form_url );
    return sprintf(
        '<iframe src="%s" title="Celltech Booking Form" class="celltech-booking-iframe" style="width:100%%;min-height:800px;border:none;display:block;"></iframe>',
        esc_attr( $form_url_add )
    );
}
add_shortcode( 'celltech_booking_form', 'celltech_booking_shortcode' );

/**
 * AJAX handler: send booking data to email.
 */
function celltech_booking_ajax_submit() {
    if ( empty( $_POST['action'] ) || $_POST['action'] !== 'celltech_booking_submit' ) {
        wp_send_json_error( array( 'message' => 'Invalid request' ) );
    }

    $fields = array(
        'firstName'  => isset( $_POST['firstName'] ) ? sanitize_text_field( wp_unslash( $_POST['firstName'] ) ) : '',
        'lastName'   => isset( $_POST['lastName'] ) ? sanitize_text_field( wp_unslash( $_POST['lastName'] ) ) : '',
        'email'      => isset( $_POST['email'] ) ? sanitize_email( wp_unslash( $_POST['email'] ) ) : '',
        'phone'      => isset( $_POST['phone'] ) ? sanitize_text_field( wp_unslash( $_POST['phone'] ) ) : '',
        'notes'      => isset( $_POST['notes'] ) ? sanitize_textarea_field( wp_unslash( $_POST['notes'] ) ) : '',
        'device'     => isset( $_POST['device'] ) ? sanitize_text_field( wp_unslash( $_POST['device'] ) ) : '',
        'brand'      => isset( $_POST['brand'] ) ? sanitize_text_field( wp_unslash( $_POST['brand'] ) ) : '',
        'model'      => isset( $_POST['model'] ) ? sanitize_text_field( wp_unslash( $_POST['model'] ) ) : '',
        'repair'     => isset( $_POST['repair'] ) ? sanitize_text_field( wp_unslash( $_POST['repair'] ) ) : '',
        'location'   => isset( $_POST['location'] ) ? sanitize_text_field( wp_unslash( $_POST['location'] ) ) : '',
        'date'       => isset( $_POST['date'] ) ? sanitize_text_field( wp_unslash( $_POST['date'] ) ) : '',
        'time'       => isset( $_POST['time'] ) ? sanitize_text_field( wp_unslash( $_POST['time'] ) ) : '',
    );

    if ( empty( $fields['firstName'] ) || empty( $fields['lastName'] ) || empty( $fields['email'] ) ) {
        wp_send_json_error( array( 'message' => 'Name and email are required' ) );
    }

    /**
     * Destination email(s) for booking notifications.
     *
     * Developers can override this in themes/plugins using:
     * add_filter( 'celltech_booking_to_email', function( $emails ) { return array( 'you@example.com' ); } );
     */
    $default_to = array(
        'change-me@example.com',
    );
    $to = apply_filters( 'celltech_booking_to_email', $default_to );
    $subject = 'New Repair Booking: ' . $fields['firstName'] . ' ' . $fields['lastName'];
    $message = "New booking request from your website:\n\n";
    $message .= "--- CUSTOMER ---\n";
    $message .= "Name: {$fields['firstName']} {$fields['lastName']}\n";
    $message .= "Email: {$fields['email']}\n";
    $message .= "Phone: {$fields['phone']}\n";
    $message .= "\n--- APPOINTMENT ---\n";
    $message .= "Device: {$fields['device']} / {$fields['brand']} {$fields['model']}\n";
    $message .= "Repair: {$fields['repair']}\n";
    $message .= "Location: {$fields['location']}\n";
    $message .= "Booking Date & Time: {$fields['date']} at {$fields['time']}\n";
    if ( ! empty( $fields['notes'] ) ) {
        $message .= "\n--- NOTES ---\n{$fields['notes']}\n";
    }
    $message .= "\n---\nSent from " . get_bloginfo( 'name' ) . "\n";

    $headers = array(
        'Content-Type: text/plain; charset=UTF-8',
        'From: ' . get_bloginfo( 'name' ) . ' <wordpress@' . ( isset( $_SERVER['HTTP_HOST'] ) ? sanitize_text_field( wp_unslash( $_SERVER['HTTP_HOST'] ) ) : 'localhost' ) . '>',
    );

    $sent = wp_mail( $to, $subject, $message, $headers );

    if ( $sent ) {
        wp_send_json_success( array( 'message' => 'Booking submitted successfully' ) );
    } else {
        wp_send_json_error( array( 'message' => 'Failed to send email. Please try again or contact us directly.' ) );
    }
}
add_action( 'wp_ajax_celltech_booking_submit', 'celltech_booking_ajax_submit' );
add_action( 'wp_ajax_nopriv_celltech_booking_submit', 'celltech_booking_ajax_submit' );

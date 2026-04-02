 # Celltech Booking Form
 
https://github.com/user-attachments/assets/363272e5-f247-4012-b48c-5c32b35b001d

 A React-based booking form application built with Vite and bundled as a WordPress plugin. The plugin renders the booking UI inside an isolated iframe and sends booking requests via WordPress AJAX to your email.

 ## Features

 - React + TypeScript single-page booking form
 - Built with Vite for fast development and optimized builds
 - Tailwind-based styling pipeline
 - WordPress plugin wrapper with shortcode: `[celltech_booking_form]`
 - AJAX submission that sends booking details to configured email addresses

 ## Project Structure

 - `src/` – React application source code
 - `public/` – Static assets
 - `wordpress-plugin/celltech-booking/` – WordPress plugin (PHP bootstrap + built assets in `dist/`)
 - `vite.config.ts` – Vite configuration

 ## Requirements

 - Node.js 18+ and npm
 - A WordPress site (for using the plugin)

 ## Installation (Development)

 1. Clone this repository.
 2. Install dependencies:

    ```bash
    npm install
    ```

 3. Start the development server:

    ```bash
    npm run dev
    ```

 4. Open the URL printed in the terminal to work on the booking form UI.

 ## Build

 To build the React app for production (the output is used by the WordPress plugin):

 ```bash
 npm run build
 ```

 This will run TypeScript type-checking and Vite build, outputting the production bundle into the appropriate `dist/` directory.

 ## WordPress Plugin Usage

 1. Run `npm run build` to generate the latest frontend bundle.
 2. Copy or symlink the `wordpress-plugin/celltech-booking` directory into your WordPress installation's `wp-content/plugins/` directory (or install it as a zipped plugin).
 3. In the WordPress admin, activate **Celltech Booking Form**.
 4. Add the shortcode to a page or post:

    ```text
    [celltech_booking_form]
    ```

 5. View the page on the frontend; the booking form will render inside an iframe.

 ## Configuring Notification Email

 By default, booking submissions are sent to `change-me@example.com`. To change this without editing the plugin file directly, use the `celltech_booking_to_email` filter in your theme or a custom plugin:

 ```php
 add_filter( 'celltech_booking_to_email', function( $emails ) {
     return array( 'you@example.com' );
 } );
 ```

 ## Scripts

 - `npm run dev` – Start Vite dev server
 - `npm run build` – Type-check and build for production
 - `npm run build:dev` – Build using development mode
 - `npm run lint` – Run ESLint on the codebase

 ## License

 MIT or your preferred license here.

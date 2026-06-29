<?php
/*
Plugin Name: TTCQN Google Analytics Tag
Description: Adds the Google Analytics 4 tracking tag (gtag.js) to every frontend page. Uses WP Option 'ttcqn_ga4_measurement_id'.
Version: 1.0.0
Author: Codex
*/

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

add_action( 'wp_head', 'ttcqn_add_ga4_tag', 1 );
function ttcqn_add_ga4_tag() {
    $measurement_id = get_option( 'ttcqn_ga4_measurement_id' );
    
    if ( ! $measurement_id ) {
        return;
    }
    
    if ( is_user_logged_in() && current_user_can( 'manage_options' ) ) {
        echo "<!-- GA4 Tracking omitted for Admin -->\n";
        return;
    }
    
    ?>
    <!-- Global site tag (gtag.js) - Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=<?php echo esc_attr( $measurement_id ); ?>"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '<?php echo esc_js( $measurement_id ); ?>');
    </script>
    <?php
}

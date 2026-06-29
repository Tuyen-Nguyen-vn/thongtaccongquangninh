<?php
/*
Plugin Name: TTCQN News Sitemap
Description: Khai báo news-sitemap.xml vào robots.txt để Google News có thể tìm thấy.
Version: 1.0.0
Author: TTCQN
*/

if ( ! defined( 'ABSPATH' ) ) exit;

add_filter( 'robots_txt', 'ttcqn_add_news_sitemap_to_robots', 20, 2 );
function ttcqn_add_news_sitemap_to_robots( $output, $public ) {
    if ( '1' !== $public ) return $output;
    $news_url = home_url( '/news-sitemap.xml' );
    if ( strpos( $output, $news_url ) === false ) {
        $output .= "\nSitemap: {$news_url}\n";
    }
    return $output;
}

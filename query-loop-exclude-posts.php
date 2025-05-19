<?php
/**
 * Plugin Name: Query Loop Exclude Posts
 * Description: Extends the Query Loop Block to allow excluding specific posts. Select specific posts by title as well as toggle the option to exclude the current post.
 * Version: 1.1.1
 * Author: Colin Duwe
 * Author URI: https://www.colinduwe.com/
 * License: GPL2+
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Enqueue block editor script.
 */
function qlep_enqueue_block_editor_assets() {
    $asset_path = plugin_dir_path(__FILE__) . 'build/index.asset.php';
    if ( file_exists( $asset_path ) ) {
        $asset_file = include $asset_path;
        wp_enqueue_script(
            'query-loop-exclude-posts',
            plugin_dir_url(__FILE__) . 'build/index.js',
            $asset_file['dependencies'],
            $asset_file['version'],
            true
        );
}

}
add_action( 'enqueue_block_editor_assets', 'qlep_enqueue_block_editor_assets' );

/**
 * Remove the current post from the query
 */
function qlep_query_loop_block_query_vars( $query ){
    if( array_key_exists( 'post__not_in', $query )
        && is_array( $query['post__not_in'] )
            ){ 
                $query['post__not_in'][] = get_the_ID();
            } elseif ( isset( $query['post__not_in'] ) ){
                $temp_array = array( $query['post__not_in'], get_the_ID() );
                $query['post__not_in'] = $temp_array;
            } else {
                $query['post__not_in'] = array( get_the_ID() );
            }
    return $query;
}
/**
 * Check if the current post should be excluded from the query
 */
function qlep_pre_render_block( $pre_render, $block, $parent_block ){
    if( 'core/query' === $block[ 'blockName' ] 
        && isset( $block['attrs']['excludeCurrent'] )
        && $block['attrs']['excludeCurrent'] === true
        && get_the_ID()
    ) {
        add_filter( 'query_loop_block_query_vars', 'qlep_query_loop_block_query_vars' );
    }

    return $pre_render;
}

add_filter( 'pre_render_block', 'qlep_pre_render_block', 10, 3 );
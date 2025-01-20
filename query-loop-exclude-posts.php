<?php
/**
 * Plugin Name: Query Loop Exclude Posts
 * Description: Extends the Query Loop Block to allow excluding specific posts. Select specific posts by title as well as toggle the option to exclude the current post.
 * Version: 1.1.0
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
function qlep__enqueue_block_editor_assets() {
    $asset_file = include plugin_dir_path( __FILE__ ) . 'build/index.asset.php';

    wp_enqueue_script(
        'query-loop-exclude-posts',
        plugins_url( 'build/index.js', __FILE__ ),
        $asset_file['dependencies'],
        $asset_file['version'],
        true
    );

}
add_action( 'enqueue_block_editor_assets', 'qlep__enqueue_block_editor_assets' );

function qlep__pre_render_block( $pre_render, $block, $parent_block ){
    if( 'core/query' === $block[ 'blockName' ] 
        && isset( $block['attrs']['excludeCurrent'] )
        && get_the_ID()
    ) {
        add_filter(
            'query_loop_block_query_vars',
            function( $query ) {
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
        );
    }

    return $pre_render;
}

add_filter( 'pre_render_block', 'qlep__pre_render_block', 10, 3 );
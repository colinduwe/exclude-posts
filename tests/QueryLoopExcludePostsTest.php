<?php
declare(strict_types=1);

class QueryLoopExcludePostsTest extends WP_UnitTestCase {

    public function test_plugin_loaded() {
        $this->assertTrue( function_exists( 'qlep_enqueue_block_editor_assets' ) );
    }

    public function test_enqueue_script_action_hooked() {
        global $wp_filter;

        $hooked = false;
        if ( isset( $wp_filter['enqueue_block_editor_assets'] ) ) {
            foreach ( $wp_filter['enqueue_block_editor_assets'] as $priority => $functions ) {
                foreach ( $functions as $function ) {
                    if ( is_array($function['function']) ) continue; // Skip methods
                    if ( $function['function'] === 'qlep_enqueue_block_editor_assets' ) {
                        $hooked = true;
                        break 2;
                    }
                }
            }
        }

        $this->assertTrue( $hooked, 'The script enqueue function is not hooked properly.' );
    }

    public static function setUpBeforeClass(): void {
        parent::setUpBeforeClass();
        require_once WP_PLUGIN_DIR . '/query-loop-exclude-posts/query-loop-exclude-posts.php';
    }

    public function test_qlep_pre_render_block_adds_filter_and_excludes_post() {
        // Create a post and set it as current
        $post_id = self::factory()->post->create();
        global $post;
        $post = get_post( $post_id );
        setup_postdata( $post );
    
        // Block with excludeCurrent = true
        $block = array(
            'blockName' => 'core/query',
            'attrs'     => array(
                'excludeCurrent' => true,
            ),
        );
    
        // Initial block context
        $context = array();
    
        // Trigger the pre-render logic that conditionally adds the filter
        $content = '';
        qlep_pre_render_block( $content, $block, $context );
    
        // Simulate how WordPress calls the query var filter
        $query_vars = apply_filters( 'query_loop_block_query_vars', array(), $block, $context );
    
        // Assert post__not_in contains current post
        $this->assertArrayHasKey( 'post__not_in', $query_vars );
        $this->assertContains( $post_id, $query_vars['post__not_in'] );
    }

    public function test_qlep_pre_render_block_does_not_add_filter_when_excludeCurrent_is_false() {
        // Create and set current post
        $post_id = self::factory()->post->create();
        global $post;
        $post = get_post( $post_id );
        setup_postdata( $post );

        $block = [
            'blockName' => 'core/query',
            'attrs'     => [
                'excludeCurrent' => false,
            ],
        ];

        $context = [];

        // The filter should not be added here
        qlep_pre_render_block( '', $block, $context );

        $query_vars = apply_filters( 'query_loop_block_query_vars', [], $block, $context );

        print_r( $query_vars );

        // No post__not_in should be present
        $this->assertArrayNotHasKey( 'post__not_in', $query_vars );
    }

    public function test_qlep_pre_render_block_does_not_add_filter_when_excludeCurrent_is_missing() {
        $block = [
            'blockName' => 'core/query',
            'attrs'     => [], // no excludeCurrent
        ];

        $context = [];

        qlep_pre_render_block( '', $block, $context );

        $query_vars = apply_filters( 'query_loop_block_query_vars', [], $block, $context );

        $this->assertArrayNotHasKey( 'post__not_in', $query_vars );
    }

}

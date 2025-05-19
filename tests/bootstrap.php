<?php
/**
 * PHPUnit bootstrap file for Query Loop Exclude Posts.
 */

define( 'TESTS_PLUGIN_DIR', dirname( __DIR__ ) );

// Load Yoast PHPUnit Polyfills if available.
$polyfills_autoload = dirname( __DIR__ ) . '/vendor/yoast/phpunit-polyfills/phpunitpolyfills-autoload.php';
if ( file_exists( $polyfills_autoload ) ) {
    require_once $polyfills_autoload;
}

// Load the WordPress test functions (includes `tests_add_filter`)
$tests_dir = getenv( 'WP_TESTS_DIR' ) ?: '/tmp/wordpress-tests-lib';
require_once $tests_dir . '/includes/functions.php';

/**
 * Load plugin in test env.
 */
function qlep_load_plugin() {
	require_once TESTS_PLUGIN_DIR . '/query-loop-exclude-posts.php';
}
tests_add_filter( 'muplugins_loaded', 'qlep_load_plugin' );

// Load the WordPress test environment FIRST.
require getenv( 'WP_TESTS_DIR' ) . '/includes/bootstrap.php';
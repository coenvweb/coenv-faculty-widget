<?php
/*
Plugin Name: CoEnv Faculty Widget
Description: University of Washington College of the Environment Faculty Widget
Version: 0.1
Author: <a href="http://elcontraption.com/">Darin Reid</a>
*/

global $coenv_faculty_widget;
$coenv_faculty_widget = new CoEnvFacultyWidget();

require 'widget.php';

class CoEnvFacultyWidget {

	function __construct() {

		// Plugin version
		if ( !defined('COENVFW_VERSION') ) define( 'COENVFW_VERSION', '0.1' );

		// Plugin directory
		if ( !defined('COENVFW_DIRNAME') ) define( 'COENVFW_DIRNAME', plugin_dir_url( __FILE__ ) );

		// Text domain (for translation)
		if ( !defined('COENVFW_DOMAIN') ) define( 'COENVFW_DOMAIN', 'coenvfw' );

		// Plugin noncename (for form submission)
		if ( !defined('COENVFW_NONCENAME') ) define( 'COENVFW_NONCENAME', 'coenvfw' );

		// Plugin activate/deactivation
		register_activation_hook( __FILE__, array( $this, 'activate_plugin' ) );
		register_deactivation_hook( __FILE__, array( $this, 'deactivate_plugin' ) );

		// Initialize plugin
		$this->init();
	}

	/**
	 * Runs on activation of plugin
	 *
	 * @return void
	 */
	function activate_plugin() {
	}

	/**
	 * Runs on deactivation of plugin
	 *
	 * @return void
	 */
	function deactivate_plugin() {
	}

	/**
	 * Plugin initilization
	 *
	 * @return void
	 */
	function init() {

		// enqueue scripts and styles
		add_action( 'wp_enqueue_scripts', array( $this, 'scripts_and_styles' ) );

		// register widget
		add_action( 'widgets_init', array( $this, 'register_widget' ) );
	}

	/**
	 * Enqueue scripts and styles
	 */
	function scripts_and_styles() {
		
		// styles
		wp_register_style( 'coenv-faculty-widget', COENVFW_DIRNAME . '/assets/styles/build/coenv-faculty-widget.css'  );
		wp_enqueue_style( 'coenv-faculty-widget' );

		// scripts
		wp_register_script( 'coenv-faculty-widget', COENVFW_DIRNAME . '/assets/scripts/build/coenv-faculty-widget.js', array( 'jquery' ), '', true );
		wp_enqueue_script( 'coenv-faculty-widget' );

		// set up plugin js vars
		wp_localize_script( 'coenv-faculty-widget', 'coenvfw', array( 'ajaxurl' => admin_url( 'admin-ajax.php' ) ) );
	}

	/**
	 * Register widget
	 */
	function register_widget() {
		register_widget( 'CoEnv_Widget_Faculty' );
	}

}





















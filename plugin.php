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


		// WORKING ON THIS...
		$this->faculty_endpoint = 'http://coenv.elcontraption.com/faculty/themes/all/units/all/json';
		$this->units_endpoint = 'http://coenv.elcontraption.com/faculty/units/json';
		$this->themes_endpoint = 'http://coenv.elcontraption.com/faculty/themes/json';

		// Initialize plugin
		$this->init();
	}

	/**
	 * Plugin initilization
	 *
	 * @return void
	 */
	function init() {

		// Plugin activate/deactivation
		register_activation_hook( __FILE__, array( $this, 'activate_plugin' ) );
		register_deactivation_hook( __FILE__, array( $this, 'deactivate_plugin' ) );

		// enqueue scripts and styles
		add_action( 'wp_enqueue_scripts', array( $this, 'scripts_and_styles' ) );

		// register widget
		add_action( 'widgets_init', array( $this, 'register_widget' ) );

		// enqueue admin scripts and styles
		add_action( 'admin_enqueue_scripts', array( $this, 'admin_scripts_and_styles' ) );

		// ajax get/save faculty member actions
		add_action( 'wp_ajax_coenv_faculty_widget_get_cached_members', array( $this, 'ajax_get_cached_members' ) );
		add_action( 'wp_ajax_nopriv_coenv_faculty_widget_get_cached_members', array( $this, 'ajax_get_cached_members' ) );
		add_action( 'wp_ajax_coenv_faculty_widget_cache_members', array( $this, 'ajax_cache_members' ) );
		add_action( 'wp_ajax_nopriv_coenv_faculty_widget_cache_members', array( $this, 'ajax_cache_members' ) );

		// ajax get/save units actions
		add_action( 'wp_ajax_coenv_faculty_widget_get_units', array( $this, 'ajax_get_units' ) );
		add_action( 'wp_ajax_coenv_faculty_widget_save_units', array( $this, 'ajax_save_units' ) );

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
	 * Enqueue scripts and styles
	 *
	 * @return void
	 */
	function scripts_and_styles() {
		
		// styles
		wp_register_style( 'coenv-faculty-widget', COENVFW_DIRNAME . '/assets/styles/build/coenv-faculty-widget.css'  );
		wp_enqueue_style( 'coenv-faculty-widget' );

		// scripts
		wp_register_script( 'coenv-faculty-widget', COENVFW_DIRNAME . '/assets/scripts/build/coenv-faculty-widget.js', array( 'jquery' ), '', true );
		wp_enqueue_script( 'coenv-faculty-widget' );

		// set up plugin js vars
		wp_localize_script( 'coenv-faculty-widget', 'coenvfw', $this->js_vars() );
	}

	/**
	 * Plugin JS vars
	 */
	function js_vars() {
		return array(
			'ajaxurl' => admin_url( 'admin-ajax.php' ),
			'facultyEndpoint' => $this->faculty_endpoint,
			'unitsEndpoint' => $this->units_endpoint,
			'themesEndpoint' => $this->themes_endpoint
		);
	}

	/**
	 * Enqueue admin scripts and styles
	 *
	 * @return void
	 */
	function admin_scripts_and_styles() {
		
		// styles

		// scripts
		wp_register_script( 'coenv-faculty-widget-admin', COENVFW_DIRNAME . '/assets/scripts/build/coenv-faculty-widget-admin.js', array( 'jquery' ) );
		wp_enqueue_script( 'coenv-faculty-widget-admin' );

		wp_localize_script( 'coenv-faculty-widget-admin', 'coenvfw', $this->js_vars() );
	}

	/**
	 * Register widget
	 *
	 * @return void
	 */
	function register_widget() {
		register_widget( 'CoEnv_Widget_Faculty' );
	}

	/**
	 * Attempts to get faculty members from transient
	 */
	function ajax_get_cached_members() {

		// debugging
		delete_transient( 'coenv_faculty_widget_members' );

		$members = get_transient( 'coenv_faculty_widget_members' );
		echo json_encode( $members );
		die();
	}

	/**
	 * Cache faculty members from ajax call
	 */
	function ajax_cache_members() {
		$members = $_POST['members'];

		if ( !isset( $members ) || empty( $members ) ) {
			return false;
		}

		// save transient (1 hour expiration)
		set_transient( 'coenv_faculty_widget_members', $members, 60 * 60 * 1 );

		echo json_encode( get_transient( 'coenv_faculty_widget_members' ) );
		die();
	}

	/**
	 * Attempts to get units from transient
	 */
	function ajax_get_units() {
		$units = get_transient( 'coenv_faculty_widget_units' );
		echo json_encode( $units );
		die();
	}

	/**
	 * Save units from ajax call
	 */
	function ajax_save_units() {

		$units = $_POST['data'];

		if ( !isset( $units ) || empty( $units ) ) {
			return false;
		}

		// save transient (1 hour expiration)
		set_transient( 'coenv_faculty_widget_units', $units, 60 * 60 * 1 );

		echo json_encode( get_transient('coenv_faculty_widget_units') );
		die();
	}

}





















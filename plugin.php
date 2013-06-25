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
		$this->faculty_endpoint = 'http://coenvdev.com/faculty/themes/all/units/all/json';
		$this->units_endpoint = 'http://coenvdev.com/faculty/units/json';
		$this->themes_endpoint = 'http://coenvdev.com/faculty/themes/json';

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
		add_action( 'wp_ajax_coenv_faculty_widget_cache_members', array( $this, 'ajax_cache_members' ) );
		add_action( 'wp_ajax_nopriv_coenv_faculty_widget_cache_members', array( $this, 'ajax_cache_members' ) );

		// ajax prepare feedback
		add_action( 'wp_ajax_coenv_faculty_widget_prepare_feedback', array( $this, 'ajax_prepare_feedback' ) );
		add_action( 'wp_ajax_nopriv_coenv_faculty_widget_prepare_feedback', array( $this, 'ajax_prepare_feedback' ) );

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
	 * Cache faculty members retreived via ajax
	 */
	function ajax_cache_members() {
		extract( $_POST );

		// set cache length in seconds
		$length = 60 * 60 * 1; // 1 hour

		// save members as transient using posted transient key
		if ( set_transient( $transient_key, $members, $length ) ) {
			echo 'cached';
		} else {
			echo 'not cached';
		}
		die();
	}

	/**
	 * Prepare feedback
	 */
	function prepare_feedback ( $faculty, $theme, $unit ) {

		// inclusive message used when displaying all faculty
		$inclusiveMessage = 'College of the Environment Faculty Profiles';

		// deal with singular members
		$singularPlural = count( $faculty ) == 1 ? 'member is' : 'are';

		// initialize message
		$message = 'Faculty ' . $singularPlural . ' working ';

		// check for theme and that it's not 'all'
		if ( isset( $theme ) && $theme !== 'all' ) {

			// get theme attributes
			$themes = $this->get_themes(array(
				'themes' => array( $theme )
			));
			$message .= 'on <a href="' . $themes[0]['url'] . '">' . $themes[0]['name'] . '</a> ';
		}

		// check for unit and that it's not 'all'
		if ( isset( $unit ) && $unit !== 'all' ) {

			// get unit attributes
			$units = $this->get_units(array(
				'units' => array( $unit )
			));
			$message .= 'in <a href="' . $units[0]['url'] . '">' . $units[0]['name'] . '</a>';
		}

		// if both themes and units are set to all, show inclusive message
		if ( $theme == 'all' && $unit == 'all' ) {
			$message = $inclusiveMessage;
		}

		return $message;
	}

	/**
	 * Ajax accessor for prepare_feedback()
	 */
	function ajax_prepare_feedback() {
		echo $this->prepare_feedback( $_POST['faculty'], $_POST['theme'], $_POST['unit'] );
		die();
	}

	/**
	 * Attempts to get themes from transient
	 */
	function get_themes() {

		if ( class_exists( 'CoEnvMemberApi' ) ) {
			global $coenv_member_api;
			$themes = $coenv_member_api->get_themes();
		}

		// need to work with ajax to get themes if this is a remote instance of the widget

		//$units = get_transient( 'coenv_faculty_widget_themes' );
		return $themes;
	}

	/**
	 * Attempts to get units from transient
	 */
	function get_units() {

		if ( class_exists( 'CoEnvMemberApi' ) ) {
			global $coenv_member_api;
			$units = $coenv_member_api->get_units();
		}

		// need to work with ajax to get units if this is a remote instance of the widget

		//$units = get_transient( 'coenv_faculty_widget_units' );
		return $units;
	}

}






















<?php
/**
 * The WordPress widget class
 */
class CoEnv_Widget_Faculty extends WP_Widget {

	public function __construct() {
		$args = array(
			'classname' => 'coenv-fw',
			'description' => __( 'Display CoEnv faculty filtered by theme or unit.', COENVFW_DOMAIN )
		);
 
		parent::__construct(
			'coenv_faculty_widget', // base ID
			'CoEnv Faculty Widget', // name
			$args
		);
	}

	public function form( $instance ) {
		global $coenv_faculty_widget;

		$units = get_transient('coenv_faculty_widget_units');
		$selected_unit = $instance['unit'];

		?>
			<p>
				<label for="<?php echo $this->get_field_name( 'unit' ) ?>"><?php _e( 'Select unit' ) ?></label>
				<select <?php if ( $units ) echo 'data-units="true" ' ?>id="coenv-faculty-widget-unit-selector" name="<?php echo $this->get_field_name( 'unit' ) ?>">
					<option>All units</option>
					<?php if ( $units ) : ?>
						<?php foreach ( $units as $unit ) : ?>
							<option value="<?php echo $unit['slug'] ?>"<?php if ( $selected_unit === $unit['slug'] ) echo ' selected="selected"' ?>><?php echo $unit['name'] ?></option>
						<?php endforeach ?>
					<?php endif ?>
				</select>
			</p>
		<?php
	}

	public function update( $new_instance, $old_instance ) {
		$instance = array();
		$instance['unit'] = $new_instance['unit'];
		 
		return $instance;
	}

	public function widget( $args, $instance ) {
		extract( $args );

	//	if ( isset( $instance['header_style'] ) && $instance['header_style'] == 'coenv_local' ) {
			$header_style = ' coenv-fw-local';
			$header_text = 'Related Faculty';
	//	} else {
	//		$header_style = '';
	//		$header_text = 'Faculty <small>UW College of the Environment</small>';
	//	}

		?>

			<div class="coenv-fw">

				<header class="coenv-fw-section coenv-fw-header<?php echo $header_style ?>">
					<h1>
						<a href="http://coenv.dev/faculty/"><?php echo $header_text ?></a>
					</h1>
				</header>

				<div class="coenv-fw-section coenv-fw-feedback">
					<p class="coenv-fw-feedback-loading">Loading...</p>
				</div>

				<ul class="coenv-fw-section coenv-fw-results"></ul>

				<footer class="coenv-fw-section coenv-fw-footer">
					<a href="#"><i class="icon-grid"></i> All related faculty</a>
				</footer>
			</div>

		<?php
	}

}

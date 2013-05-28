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
		?>
			<p>Form goes here.</p>
		<?php
	}

	public function update( $new_instance, $old_instance ) {
		$instance = array();
		$instance['title'] = strip_tags( $new_instance['title'] );
		 
		return $instance;
	}

	public function widget( $args, $instance ) {
		extract( $args );

		?>
			<?php echo $before_widget ?>

				<header class="coenv-fw-section coenv-fw-header">
					<h1>
						<a href="http://coenv.dev/faculty/">
							Faculty
							<small>UW College of the Environment</small>
						</a>
					</h1>
				</header>

				<div class="coenv-fw-section coenv-fw-feedback">
					<p class="coenv-fw-feedback-loading">Loading...</p>
				</div>

				<ul class="coenv-fw-section coenv-fw-results"></ul>

			<?php echo $after_widget ?>
		<?php
	}

}

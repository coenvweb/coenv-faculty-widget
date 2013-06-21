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

		$themes = $coenv_faculty_widget->get_themes();
		$selected_theme = $instance['theme'];

		$units = $coenv_faculty_widget->get_units();
		$selected_unit = $instance['unit'];

		$selected_style = isset( $instance['style'] ) ? $instance['style'] : 'dark';

		?>
			<div class="coenv-fw-widget-form">
				<p>
					<label for="<?php echo $this->get_field_name( 'theme' ) ?>"><?php _e( 'Filter by theme' ) ?></label>
					<select <?php if ( $themes ) echo 'data-themes="true" ' ?>id="coenv-faculty-widget-theme-selector" name="<?php echo $this->get_field_name( 'theme' ) ?>">
						<option value="all">All themes</option>
						<?php if ( $themes ) : ?>
							<?php foreach ( $themes as $theme ) : ?>
								<option value="<?php echo $theme['slug'] ?>"<?php if ( $selected_theme === $theme['slug'] ) echo ' selected="selected"' ?>><?php echo $theme['name'] ?></option>
							<?php endforeach ?>
						<?php endif ?>
					</select>
				</p>
				<p>
					<label for="<?php echo $this->get_field_name( 'unit' ) ?>"><?php _e( 'Filter by unit' ) ?></label>
					<select <?php if ( $units ) echo 'data-units="true" ' ?>id="coenv-faculty-widget-unit-selector" name="<?php echo $this->get_field_name( 'unit' ) ?>">
						<option value="all">All units</option>
						<?php if ( $units ) : ?>
							<?php foreach ( $units as $unit ) : ?>
								<option value="<?php echo $unit['slug'] ?>"<?php if ( $selected_unit === $unit['slug'] ) echo ' selected="selected"' ?>><?php echo $unit['name'] ?></option>
							<?php endforeach ?>
						<?php endif ?>
					</select>
				</p>
				<p>Filtered results: <span class="filter-count"></span><br /><small>Widget will not display for 0 results.</small></p>
				<p>
					Widget style<br />
					<label><input type="radio" name="<?php echo $this->get_field_name('style') ?>" value="dark" <?php if ( $selected_style == 'dark' ) echo 'checked' ?> /> Dark</label><br />
					<label><input type="radio" name="<?php echo $this->get_field_name('style') ?>" value="light" <?php if ( $selected_style == 'light' ) echo 'checked' ?> /> Light</label>
				</p>
			</div>
		<?php
	}

	public function update( $new_instance, $old_instance ) {
		$instance = array();
		$instance['theme'] = $new_instance['theme'];
		$instance['unit'] = $new_instance['unit'];
		$instance['style'] = $new_instance['style'];
		 
		return $instance;
	}

	private function prepare_feedback ( $faculty, $theme, $unit ) {
		global $coenv_member_api;

		// inclusive message used when displaying all faculty
		$inclusiveMessage = 'College of the Environment Faculty Profiles';

		// deal with singular members
		$singularPlural = count( $faculty ) == 1 ? 'member is' : 'are';

		// initialize message
		$message = 'Faculty ' . $singularPlural . ' working ';

		// check for theme and that it's not 'all'
		if ( isset( $theme ) && $theme !== 'all' ) {

			// get theme attributes
			$themes = $coenv_member_api->get_themes(array(
				'themes' => array( $theme )
			));
			$message .= 'on <a href="' . $themes[0]['url'] . '">' . $themes[0]['name'] . '</a> ';
		}

		// check for unit and that it's not 'all'
		if ( isset( $unit ) && $unit !== 'all' ) {

			// get unit attributes
			$units = $coenv_member_api->get_units(array(
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
	 * Display the widget
	 *
	 * @param $args {array} standard WP widget arguments
	 * @param $instance {array}
	 */
	public function widget ( $args, $instance ) {
		extract( $args );

		$widget_classes = array();

		// assume remote widget (used on external websites only)
		$local = false;

		// check for existance of CoEnvMemberAPI class
		// if it exists, this is a local (CoEnv website only) instance of the widget
		if ( class_exists( 'CoEnvMemberAPI' ) && $instance['location'] !== 'external' ) {
			$local = true;
		}

		// prepare themes and units
		$theme = isset( $instance['theme'] ) ? $instance['theme'] : 'all';
		$unit = isset( $instance['unit'] ) ? $instance['unit'] : 'all';

		// for testing: force get faculty by ajax
		delete_transient( $widget_id );

		// check for WP transient for this specific widget
		$faculty = get_transient( $widget_id );

		// compile widget classes depending on local/remote widget location
		if ( $local ) {
			$classes[] = 'coenv-fw-local';

			// prepare header text
			$header_text = 'Related Faculty';

			// prepare feedback message
			$message = $this->prepare_feedback( $faculty, $theme, $unit );

		} else {
			$classes[] = 'coenv-fw-external';

			// prepare header text
			$header_text = 'Faculty <small>UW College of the Environment</small>';
		}

		// add widget theme to classes
		if ( isset( $instance['style'] ) ) {
			$classes[] = 'coenv-fw-theme-' . $instance['style'];
		}

		// prepare widget classes
		$classes = implode( ' ', $classes );

		// display widget
		?>
			<div id="<?php echo $widget_id ?>" class="coenv-fw <?php echo $classes ?>">

				<header class="coenv-fw-section coenv-fw-header">
					<h1>
						<a href="http://coenv.dev/faculty/"><?php echo $header_text ?></a>
					</h1>
				</header>

				<div class="coenv-fw-section coenv-fw-feedback">
					<?php if ( !empty( $faculty ) ) : ?>
						<p>
							<span class="coenv-fw-feedback-number"><?php echo count( $faculty ) ?></span> <?php echo $message ?>
						</p>
					<?php else : ?>
						<p class="coenv-fw-feedback-loading">
							Loading...
						</p>
					<?php endif ?>
				</div>

				<ul class="coenv-fw-section coenv-fw-results">
					<?php if ( !empty( $faculty ) ) : ?>
						<?php foreach ( $faculty as $member ) : ?>
							<li class="coenv-fw-member" style="background-color: <?php echo $member['color'] ?>;">
								<a href="<?php echo $member['permalink'] ?>" class="coenv-fw-member-inner">
									<img class="coenv-fw-member-image" src="<?php echo $member['image'] ?>">
									<p class="coenv-fw-member-name"><?php echo $member['name'] ?></p>
								</a>
							</li>
						<?php endforeach ?>
					<?php endif ?>
				</ul>

				<footer class="coenv-fw-section coenv-fw-footer">
					<a href="#"><i class="icon-faculty-grid-alt-2"></i> See all related faculty</a>
				</footer>

			</div>

			<?php 
				if ( empty( $faculty ) ) : 
				// transient does not exist: get faculty via ajax
				// output faculty member handlebars template
				// and initialize javascript actions on this widget
			?>
				<script id="coenv-fw-member-template" type="text/x-handlebars-template">
					<li class="coenv-fw-member" style="background-color: {{color}};">
						<a href="{{permalink}}" class="coenv-fw-member-inner">
							<img class="coenv-fw-member-image" src="{{image}}">
							<p class="coenv-fw-member-name">{{name}}</p>
						</a>
					</li>
				</script>
				<script>
					jQuery(function () {
						jQuery('#<?php echo $widget_id ?>').coenvfw({
							filters: {
								themes: [ '<?php echo $theme ?>' ],
								units: [ '<?php echo $unit ?>' ]
							}
						});
					});
				</script>
			<?php endif ?>
		<?php
	}



	public function _widget ( $args, $instance ) {
		global $coenv_faculty_widget;

		// assume remote widget
		$local = false;

		// if CoEnvMemberAPI class exists, we'll show the local version of the widget
		if ( class_exists( 'CoEnvMemberAPI' ) ) {
			global $coenv_member_api;
			$local = true;

			$faculty = $coenv_member_api->get_faculty( array(
				'themes' => array( $instance['theme'] ),
				'units' => array( $instance['unit'] ),
				'test_data' => true
			) );


		}

		$classes = array();
		if ( isset( $instance['header_style'] ) && $instance['header_style'] == 'coenv_local' ) {
			$classes[] = 'coenv-fw-local';
			$header_text = 'Related Faculty';
		} else {
			$header_text = 'Faculty <small>UW College of the Environment</small>';
		}

		if ( isset( $instance['style'] ) && $instance['style'] == 'light' ) {
			$classes[] = 'coenv-fw-theme-light';
		}

		?>

			<?php if ( isset( $faculty ) && !empty( $faculty ) ) : ?>

				<div class="coenv-fw<?php echo ' ' . implode( ' ', $classes ) ?>" data-themes="<?php echo $themes ?>" data-units="<?php echo $units ?>" data-filter-cache-key="<?php echo $filter_cache_key ?>">

					<div class="coenv-fw-section-horizontal">

						<header class="coenv-fw-section coenv-fw-header">
							<h1>
								<a href="http://coenv.dev/faculty/"><?php echo $header_text ?></a>
							</h1>
						</header>

						<div class="coenv-fw-section coenv-fw-feedback">

							<?php if ( isset( $faculty ) && !empty( $faculty ) ) : ?>
								<p>
									<span class="coenv-fw-feedback-number"><?php echo count( $faculty ) ?></span> <?php echo $message ?>
								</p>
							<?php else : ?>
								<p class="coenv-fw-feedback-loading">
									Loading...
								</p>
							<?php endif ?>

						</div>

					</div>

					<ul class="coenv-fw-section coenv-fw-results">

						<?php if ( isset( $faculty ) && !empty( $faculty ) ) : ?>

							<?php foreach ( $faculty as $member ) : ?>

								<li class="coenv-fw-member" style="background-color: <?php echo $member['units'][0]['color'] ?>;">
									<a href="<?php echo $member['permalink'] ?>" class="coenv-fw-member-inner">
										<img class="coenv-fw-member-image" src="<?php echo $member['images']['thumbnail']['url'] ?>">
										<p class="coenv-fw-member-name"><?php echo $member['full_name'] ?></p>
									</a>
								</li>

							<?php endforeach ?>

						<?php endif ?>

					</ul>

					<footer class="coenv-fw-section coenv-fw-footer">
						<a href="#"><i class="icon-faculty-grid-alt-2"></i> See all related faculty</a>
					</footer>
				</div>

			<?php endif ?>

			<?php 
				// if CoEnvMemberAPI class exists
				// we'll use the local widget (php only)
				// for a speedier experience
				if ( !class_exists( 'CoEnvMemberAPI' ) ) : 
			?>
		<!--
				<script>
					//$(function () {
					//	var $widget = $('.coenv-fw');
					//	$widget.coenvfw();
					//});
				</script>
		-->
			<?php endif ?>
		<?php

	}

}

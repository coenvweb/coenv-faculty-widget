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
			<p>
				<label for="<?php echo $this->get_field_name( 'theme' ) ?>"><?php _e( 'Select theme' ) ?></label>
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
				<label for="<?php echo $this->get_field_name( 'unit' ) ?>"><?php _e( 'Select unit' ) ?></label>
				<select <?php if ( $units ) echo 'data-units="true" ' ?>id="coenv-faculty-widget-unit-selector" name="<?php echo $this->get_field_name( 'unit' ) ?>">
					<option value="all">All units</option>
					<?php if ( $units ) : ?>
						<?php foreach ( $units as $unit ) : ?>
							<option value="<?php echo $unit['slug'] ?>"<?php if ( $selected_unit === $unit['slug'] ) echo ' selected="selected"' ?>><?php echo $unit['name'] ?></option>
						<?php endforeach ?>
					<?php endif ?>
				</select>
			</p>
			<p>
				<label><input type="radio" name="<?php echo $this->get_field_name('style') ?>" value="dark" <?php if ( $selected_style == 'dark' ) echo 'checked' ?> /> Dark</label><br />
				<label><input type="radio" name="<?php echo $this->get_field_name('style') ?>" value="light" <?php if ( $selected_style == 'light' ) echo 'checked' ?> /> Light</label>
			</p>
		<?php
	}

	public function update( $new_instance, $old_instance ) {
		$instance = array();
		$instance['theme'] = $new_instance['theme'];
		$instance['unit'] = $new_instance['unit'];
		$instance['style'] = $new_instance['style'];
		 
		return $instance;
	}

	/**
	 * Display the widget
	 *
	 * @param $args {array} standard WP widget arguments
	 * @param $instance {array}
	 *		$instance['filters']['themes'] {array} theme slugs
	 *		$instance['filters']['units'] {array} unit slugs
	 */
	public function widget ( $args, $instance ) {
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

			// move this somewhere better to DRY things up
			$singularPlural = count( $faculty ) == 1 ? 'member is' : 'are';
			$message = 'Faculty ' . $singularPlural . ' working ';
			$inclusiveMessage = 'Faculty are in the College of the Environment';

			if ( isset( $instance['theme'] ) && $instance['theme'] !== 'all' ) {
				$themes = $coenv_member_api->get_themes( array(
					'themes' => array( $instance['theme'] )
				) );
				$message .= 'on <a href="' . $themes[0]['url'] . '">' . $themes[0]['name'] . '</a> ';
			}

			if ( isset( $instance['unit'] ) && $instance['unit'] !== 'all' ) {
				$units = $coenv_member_api->get_units( array(
					'units' => array( $instance['unit'] )
				) );
				$message .= 'in <a href="' . $units[0]['url'] . '">' . $units[0]['name'] . '</a>';
			}

			if ( $instance['theme'] == 'all' && $instance['unit'] == 'all' ) {
				$message = $inclusiveMessage;
			}


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
				<script>
					$(function () {
						var $widget = $('.coenv-fw');
						$widget.coenvfw();
					});
				</script>
			<?php endif ?>
		<?php

	}

}

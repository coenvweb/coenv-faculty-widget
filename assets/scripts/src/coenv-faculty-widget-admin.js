/**
 * Admin ajax actions
 */
jQuery(function ($) {
	'use strict';

	//$('.coenv-fw-widget-form').CoEnvFWForm();

});

(function ( $, window, document, undefined ) {
	'use strict';

	$.fn.CoEnvFWForm = function () {

		var $widget = $(this),
				$selects = $(this).find('select'),
				$filterCount = $widget.find('.filter-count'),
				valQueue;

		valQueue = {
			theme: $(this).find('#coenv-faculty-widget-theme-selector').find('option[selected="selected"]').attr('value'),
			unit: $(this).find('#coenv-faculty-widget-unit-selector').find('option[selected="selected"]').attr('value')
		};

		function getFilterCount( filters ) {
			// get number of faculty by filters
			$.post( window.ajaxurl, {
				action: 'coenv_faculty_widget_get_faculty_filter_count',
				data: filters
			}, function ( response ) {
				$filterCount.text( response );
			} );
		}

		getFilterCount( valQueue );

		$selects.on( 'change', function () {

			if ( $(this).attr('id') === 'coenv-faculty-widget-theme-selector' ) {
				valQueue.theme = $(this).attr('value');
			}

			if ( $(this).attr('id') === 'coenv-faculty-widget-unit-selector' ) {
				valQueue.unit = $(this).attr('value');
			}

			getFilterCount( valQueue );

		} );

		$('body').ajaxSuccess( function ( e, xhr, settings ) {
			var widget_id_base = 'coenv_faculty_widget';

			if ( settings.data.search( 'action=save-widget' ) !== -1 && settings.data.search( 'id_base=' + widget_id_base ) !== -1 ) {
				getFilterCount( valQueue );
				//$filterCount.text('hi');
			}
		} );

	};
















})( jQuery, window, document );
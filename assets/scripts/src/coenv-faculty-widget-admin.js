/**
 * Admin ajax actions
 */
jQuery(function ($) {
	'use strict';

	$('.coenv-fw-widget-form').CoEnvFWForm();

	//$('#coenv-faculty-widget-unit-selector').CoEnvFWUnitSelector();

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

	$.fn.CoEnvFWUnitSelector = function() {

		var $select = $(this),
				unitsEndpoint = window.coenvfw.unitsEndpoint;

		if ( !$select.length ) {
			return;
		}

		// return if data-units is set (via widget.php)
		if ( $select.attr('data-units') === true ) {
			return;
		}

		// attempt to get units from transient
		$.post( window.ajaxurl, { action: 'coenv_faculty_widget_get_units' }, function ( response ) {

			if ( response !== 'false' ) {
				// transient exists
				return;
			}

			// get units through ajax call
			getUnits();

		} );

		function getUnits () {

			$.ajax({
				url: unitsEndpoint,
				dataType: 'jsonp',
				success: function ( data ) {
					// save units transient
					saveTransient( data );
					populateSelect( data );
				},
				error: function ( jqXHR, textStatus ) {
					console.log( 'error: ' + textStatus );
				}
			});
		}

		function saveTransient ( unitsData ) {

			var data = {
				action: 'coenv_faculty_widget_save_units',
				data: unitsData
			};

			// pass to save_units function in plugin.php
			$.post( window.ajaxurl, data, function ( response ) {} );
		}

		function populateSelect ( units ) {

			var $opts = [];

			$.each( units, function () {
				var unit = this;

				$opts.push( '<option value="' + unit.slug + '">' + unit.name + '</option>' );

			} );

			$select.append( $opts );
		}

	};

















})( jQuery, window, document );
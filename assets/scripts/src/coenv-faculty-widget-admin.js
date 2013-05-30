/**
 * Admin ajax actions
 */
jQuery(function ($) {
	'use strict';

	$('#coenv-faculty-widget-unit-selector').CoEnvFWUnitSelector();

});

(function ( $, window, document, undefined ) {
	'use strict';

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
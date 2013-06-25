jQuery(function ($) {
	'use strict';
});

(function ( $, window, document, undefined ) {
	'use strict';

	$.CoEnvFw = function ( options, element ) {
		this.options = options;
		this.element = $(element);
		this._init( options );
	};

	$.CoEnvFw.settings = {
		ajaxobject: window.coenvfw,
		ajaxurl: window.coenvfw.ajaxurl,
		facultyEndpoint: window.coenvfw.facultyEndpoint,
		memberLimit: 25,
		filters: {
			themes: [ 'all' ],
			units: [ 'all' ]
		}
	};

	$.CoEnvFw.prototype._init = function ( options ) {

		var _this = this;

		// set options
		this.options = $.extend( true, {}, $.CoEnvFw.settings, options );

		// use widget ID to identify WP transient
		this.transientKey = this.element.attr('id');

		// shortcut to passed filters
		this.filters = this.options.filters;

		// get filtered faculty via ajax call
		this._getMembers().then( function () {

			// render members to widget
			_this._renderMembers();

			_this._renderFeedback();

			// cache members
			_this._cacheMembers();
		} );

	};

	/**
	 * Get members
	 * Ajax call to CoEnv faculty API to get filtered faculty members
	 */
	$.CoEnvFw.prototype._getMembers = function () {

		var dfd = new $.Deferred(),
				_this = this,
				members,
				themes,
				units,
				endpoint;

		// prepare themes and units for endpoint url
		themes = this.filters.themes.join('&') || 'all';
		units = this.filters.units.join('&') || 'all';

		// prepare default endpoint with themes and units
		endpoint = _this.options.facultyEndpoint;
		endpoint = endpoint.replace( 'themes/all', 'themes/' + themes );
		endpoint = endpoint.replace( 'units/all', 'units/' + units );

		// ajax call to faculty API
		$.ajax({
			url: endpoint,
			dataType: 'jsonp',
			success: function ( response ) {

				// prepare members for caching in WP transient
				_this.members = _this._prepareMemberObjects( response );

				dfd.resolve();
			},
			error: function ( jqXHR, textStatus ) {
				_this._failed( textStatus );
				dfd.reject();
			}
		});

		return dfd.promise();
	};

	/**
	 * Prepare members to cache in WP transient
	 */
	$.CoEnvFw.prototype._prepareMemberObjects = function ( members ) {

		var dataMembers = [];

		// reduce members
		// limited amount of data allowed with POST request
		$.each( members, function () {
			dataMembers.push({
				permalink: this.permalink,
				name: this.full_name,
				image: this.images.thumbnail.url,
				color: this.units[0].color
			});
		} );

		return dataMembers;
	};

	/**
	 * Render members
	 *
	 * TODO: change this to use precompiled handlebars templates
	 */
	$.CoEnvFw.prototype._renderMembers = function () {

		var tmpl = Handlebars.compile( $('#tmpl-members').text() );

		var html = tmpl({ Members: this.members });

		this.element.find('.coenv-fw-results').append( html );
	};

	/**
	 * Render feedback
	 */
	$.CoEnvFw.prototype._renderFeedback = function () {

		var _this = this,
				$feedback = this.element.find('.coenv-fw-feedback'),
				$number = $feedback.find('.coenv-fw-feedback-number'),
				$message = $feedback.find('.coenv-fw-feedback-message'),
				feedback;

		var data = {
			action: 'coenv_faculty_widget_prepare_feedback',
			faculty: this.members,
			theme: this.filters.themes[0],
			unit: this.filters.units[0]
		};

		// prepare feedback
		$.ajax({
			url: this.options.ajaxurl,
			data: data,
			type: 'POST',
			success: function ( response ) {
				$number.text( _this.members.length );
				$message.html( response );
			},
			error: function ( jqXHR, textStatus ) {
				console.log( textStatus );
			}
		});
	};

	/**
	 * Cache members
	 * Save members as WP transient
	 */
	$.CoEnvFw.prototype._cacheMembers = function () {

		var _this = this;

		var data = {
			action: 'coenv_faculty_widget_cache_members',
			members: this.members,
			transient_key: this.transientKey
		};

		$.ajax({
			url: this.options.ajaxurl,
			data: data,
			type: 'POST',
			success: function ( response ) {
				//console.log( response );
			},
			error: function ( jqXHR, textStatus ) {
				_this._failed( textStatus );
			}
		});

	};

	/**
	 * Failed message
	 */
	$.CoEnvFw.prototype._failed = function ( msg ) {
		console.log( msg );
	};

	/**
	 * Plugin options
	 */
	$.CoEnvFw.prototype.option = function( key, value ){
		if ( $.isPlainObject( key ) ){
			this.options = $.extend(true, this.options, key);
		}
	};

	/**
	 * Plugin bridge
	 */
	$.fn.coenvfw = function( options ) {
		if ( typeof options === 'string' ) {
			// call method
			var args = Array.prototype.slice.call( arguments, 1 );

			this.each(function() {
				var instance = $.data( this, 'coenvfw' );
				if ( !instance ) {
					console.log( 'error', 'cannot call methods on coenvfw prior to initialization. ' +
						'attempted to call method ' + options );
					return;
				}
				if ( !$.isFunction( instance[options] ) || options.charAt(0) === '_' ) {
					console.log( 'error', 'no such method ' + options + ' for coenvfw instance' );
					return;
				}

				// apply method
				instance[ options ].apply( instance, args );
			});
		} else {
			this.each(function() {
				var instance = $.data( this, 'coenvfw' );
				if ( instance ){
					// apply options & init
					instance.option( options || {} );
					instance._init();
				} else {
					// initialize new instance
					$.data( this, 'coenvfw', new $.CoEnvFw( options, this ) );
				}
			});
		}
		return this;
	};

})( jQuery, window, document );
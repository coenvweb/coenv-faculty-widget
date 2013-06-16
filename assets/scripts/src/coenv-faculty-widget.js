jQuery(function ($) {
	'use strict';

	var $widget = $('.coenv-fw');

	// Initialize
	$widget.coenvfw();

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
		widgetClass: 'coenv-fw',
		sectionClass: 'coenv-fw-section',
		feedbackClass: 'coenv-fw-feedback',
		feedbackLoadingClass: 'coenv-fw-feedback-loading',
		feedbackNumberClass: 'coenv-fw-feedback-number',
		resultsClass: 'coenv-fw-results',
		memberClass: 'coenv-fw-member',
		memberInnerClass: 'coenv-fw-member-inner',
		memberImageClass: 'coenv-fw-member-image',
		memberNameClass: 'coenv-fw-member-name'
	};

	$.CoEnvFw.prototype._init = function ( options ) {

		var _this = this;

		// set options
		this.options = $.extend( true, {}, $.CoEnvFw.settings, options );

		// identify DOM elements
		this._elements();

		// get filters
		this.filters = this._parseFilters();

		// get members
		this._getMembers().then( function () {
			_this._renderMembers();
		} );

	};

	$.CoEnvFw.prototype._elements = function () {
		this.$feedback = this.element.find('.' + this.options.feedbackClass );
		this.$feedbackLoading = this.element.find('.' + this.options.feedbackLoadingClass );
		this.$feedbackNumber = this.element.find('.' + this.options.feedbackNumberClass );
		this.$resultsList = this.element.find('.' + this.options.resultsClass );
	};

	/**
	 * Parse filters
	 * Filters should be passed as space-separated data attributes:
	 * data-themes="geo-physical-sciences conservation" data-units="earth-space-sciences"
	 */
	$.CoEnvFw.prototype._parseFilters = function () {
		var filters = {};

		filters.themes = this.element.attr('data-themes').split(' ');
		filters.units = this.element.attr('data-units').split(' ');

		return filters;
	};

	/**
	 * Get members
	 */
	$.CoEnvFw.prototype._getMembers = function () {

		var dfd = new $.Deferred(),
				_this = this;

		var data = {
			action: 'coenv_faculty_widget_get_cached_members'
		};

		// attempt to get cached members from WP transient
		$.post( this.options.ajaxurl, data, function ( response ) {

			if ( response !== 'false' ) {

				// transient exists
				_this.members = $.parseJSON( response );

				dfd.resolve();
			} else {

				// transient doesn't exist, get members via ajax call
				_this._remoteGetMembers().then( function () {
					dfd.resolve();
				} );
			}
		} );

		return dfd.promise();
	};

	/**
	 * Remote get members
	 * Attempt to get members from remote coenv faculty endpoint
	 */
	$.CoEnvFw.prototype._remoteGetMembers = function () {

		var dfd = new $.Deferred(),
				_this = this,
				members,
				themes,
				units,
				url;

		themes = this.filters.themes.join('&') || 'all';
		units = this.filters.units.join('&') || 'all';

		// add filters to url
		url = _this.options.facultyEndpoint;
		url = url.replace( 'themes/all', 'themes/' + themes );
		url = url.replace( 'units/all', 'units/' + units );

		$.ajax({
			url: url,
			dataType: 'jsonp',
			success: function ( response ) {
				_this.members = _this._buildMemberObjects( response );

				if ( !_this.members.length ) {
					// this message should probably come from the api itself
					_this._failed( 'CoEnv endpoint returned no members' );
					dfd.reject();
				}

				// save WP members transient
				_this._cacheMembers();

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
	 * Build member objects
	 * to save to cache
	 */
	$.CoEnvFw.prototype._buildMemberObjects = function ( members ) {

		var dataMembers = [];

		// reduce members
		// limited amount of data allowed with POST request
		$.each( members, function () {
			dataMembers.push({
				permalink: this.permalink,
				full_name: this.full_name,
				image: this.images.thumbnail.url,
				color: this.units[0].color
			});
		} );

		return dataMembers;
	};

	/**
	 * Cache members
	 * Save members as WP transient
	 */
	$.CoEnvFw.prototype._cacheMembers = function () {

		var _this = this;

		// need to save some sort of key along with the cache
		// to keep track of unique filter for this cache

		var data = {
			action: 'coenv_faculty_widget_cache_members',
			members: this.members
		};

		$.ajax({
			url: this.options.ajaxurl,
			data: data,
			type: 'POST',
			success: function ( response ) {
			},
			error: function ( jqXHR, textStatus ) {
				_this._failed( textStatus );
			}
		});

	};

	/**
	 * Render members
	 */
	$.CoEnvFw.prototype._renderMembers = function () {

		var members = this.members,
				$msg = '<p><span class="' + this.options.feedbackNumberClass + '">' + members.length + '</span> faculty working on <a href="#">Climate</a> in <a href="#">Earth &amp; Space Sciences</a></p>',
				$items = [],
				_this = this,
				count = 0;

		// add message to feedback area
		this.$feedback.html( $msg );

		$.each( members, function () {

			if ( count === 25 ) {
				return;
			}

			var member = this,
					$item = $('<li></li>'),
					$link = $('<a></a>'),
					$img = $('<img />'),
					$name = $('<p></p>');

			$item.addClass( _this.options.memberClass );
			$item.attr( 'style', 'background-color: ' + member.color + ';' );

			$link.addClass( _this.options.memberInnerClass );
			$link.attr( 'href', member.permalink );

			$img.addClass( _this.options.memberImageClass );
			$img.attr( 'src', member.image );
			$img.appendTo( $link );

			$name.addClass( _this.options.memberNameClass );
			$name.text( member.full_name );
			$name.appendTo( $link );

			$link.appendTo( $item );

			$items.push( $item );

			count++;

		} );

		this.$resultsList.append( $items );

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
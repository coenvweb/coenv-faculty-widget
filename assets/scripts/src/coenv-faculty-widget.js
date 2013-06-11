jQuery(function ($) {
	'use strict';

	// Initialize CoEnv Faculty Widget
	$('.coenv-fw').coenvfw({});

});

(function ( $, window, document, undefined ) {
	'use strict';

	$.CoEnvFw = function ( options, element ) {
		this.options = options;
		this.element = $(element);
		this._init();
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
	 * _getMembers()
	 *
	 * attempt to get members from WP transient
	 * if transient is not set, fall back to _remoteGetMembers()
	 */
	$.CoEnvFw.prototype._getMembers = function () {

		var dfd = new $.Deferred(),
				_this = this;

		var data = {
			action: 'coenv_faculty_widget_get_members'
		};

		// attempt to get members from WP transient
		$.post( this.options.ajaxurl, data, function ( response ) {

			if ( response !== 'false' ) {
				// transient exists
				// response has been json encoded
				_this.members = $.parseJSON( response );

				dfd.resolve();
			} else {

				// transient does not exist, get members via ajax call
				_this._remoteGetMembers().then( function () {
					dfd.resolve();
				} );
			}

		} );

		return dfd.promise();
	};

	/**
	 * _remoteGetMembers()
	 *
	 * attempt to get members from remote coenv faculty endpoint
	 */
	$.CoEnvFw.prototype._remoteGetMembers = function () {

		var dfd = new $.Deferred(),
				_this = this;

		$.ajax({
			url: _this.options.facultyEndpoint,
			dataType: 'jsonp',
			success: function ( response ) {
				_this.members = response;

				if ( !_this.members.length ) {
					_this._failed();
				}

				// save WP members transient
				_this._saveMembers( response );

				dfd.resolve();
			},
			error: function ( jqXHR, textStatus ) {
				_this._failed( textStatus );
			}
		});

		return dfd.promise();
	};

	$.CoEnvFw.prototype._saveMembers = function ( members ) {

		var dataMembers = [];

		$.each( members, function () {
			dataMembers.push({
				'permalink': this.permalink,
				'full_name': this.full_name,
				'first_name': this.first_name,
				'last_name': this.last_name,
				//'images': this.images,
				//'themes': this.themes,
				//'units': this.units
			});
		} );

		var data = {
			action: 'coenv_faculty_widget_save_members',
			members: members
		};

		$.ajax({
			url: this.options.ajaxurl,
			data: data,
			type: 'POST',
			success: function ( response ) {
				//console.log( response );
			},
			error: function ( jqXHR, textStatus ) {
				console.log( jqXHR );
			}
		});

//		$.post( this.options.ajaxurl, data, function ( response ) {
//			console.log( response );
//		} );
	};

	/**
	 *	_failed()
	 *
	 * Members did not load, or there were no members returned
	 * Show link to all faculty
	 */
	$.CoEnvFw.prototype._failed = function ( msg ) {

		this.$feedbackLoading.html('<a href="#">See all faculty &raquo;</a>');

		if ( msg ) {
			console.log( msg );
		}
	};

	/**
	 *	_renderMembers()
	 *
	 * Members loaded, and there were members returned
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
			$item.attr( 'style', 'background-color: ' + member.units[0].color + ';' );

			$link.addClass( _this.options.memberInnerClass );
			$link.attr( 'href', member.permalink );

			$img.addClass( _this.options.memberImageClass );
			$img.attr( 'src', member.images.thumbnail.url );
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

	$.CoEnvFw.prototype.option = function( key, value ){
		if ( $.isPlainObject( key ) ){
			this.options = $.extend(true, this.options, key);
		}
	};

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
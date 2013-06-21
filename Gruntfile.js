'use strict';
var path = require('path');
var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;
var folderMount = function folderMount(connect, point) {
	return connect.static(path.resolve(point));
};

module.exports = function(grunt) {

	grunt.initConfig({
		paths: {
			dev: '.',
			test: 'test'
		},
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			all: [
				'Gruntfile.js',
				'<%= paths.dev %>/assets/scripts/src/{,*/}*.js'
			]
		},
		uglify: {
			dist: {
				files: {
					'<%= paths.dev %>/assets/scripts/build/coenv-faculty-widget.js': [
						'<%= paths.dev %>/components/handlebars.js/handlebars.js',
						'<%= paths.dev %>/assets/scripts/src/coenv-faculty-widget.js'
					],
					'<%= paths.dev %>/assets/scripts/build/coenv-faculty-widget-admin.js': [
						'<%= paths.dev %>/assets/scripts/src/coenv-faculty-widget-admin.js'
					]
				}
			}
		},
		compass: {
			dist: {
				options: {
					sassDir: '<%= paths.dev %>/assets/styles/src',
					cssDir: '<%= paths.dev %>/assets/styles/build',
					imagesDir: '<%= paths.dev %>/assets/img',
					javascriptsDir: '<%= paths.dev %>/assets/scripts/build',
					fontsDir: '<%= paths.dev %>/assets/fonts',
					importPath: 'components',
					outputStyle: 'expanded',
					relativeAssets: true
				}
			}
		},
		watch: {
			compass: {
				files: ['<%= paths.dev %>/assets/styles/src/**/*.scss'],
				tasks: ['compass']
			},
			srcjs: {
				files: ['<%= paths.dev %>/assets/scripts/src/**/*.js'],
				tasks: ['jshint', 'uglify']
			},
			livereload: {
				files: [
					'<%= paths.dev %>/assets/scripts/build/**/*.js',
					'<%= paths.dev %>/assets/styles/build/*.css',
					'<%= paths.dev %>/*.html'
				],
				tasks: ['livereload']
			}
		},
		livereload: {
			port: 35729 // Default livereload listening port.
			// Must have livereload browser extension installed and working
		},
		connect: {
			livereload: {
				options: {
					port: 9001,
					middleware: function(connect, options) {
						return [lrSnippet, folderMount(connect, options.base)];
					}
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-compass');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-livereload');
	grunt.loadNpmTasks('grunt-regarde');

	grunt.renameTask('regarde', 'watch');

	grunt.registerTask('server', [
		'default',
		'livereload-start',
		'connect:livereload',
		'watch'
	]);

	grunt.registerTask('default', [
		'jshint',
		'compass',
		'uglify'
	]);

};
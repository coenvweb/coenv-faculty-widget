'use strict';

module.exports = function(grunt) {

	grunt.initConfig({
		paths: {
			dev: './',
		},

		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			all: [
				'Gruntfile.js',
				'<%= paths.dev %>assets/scripts/src/{,*/}*.js',
				'!<%= paths.dev %>assets/scripts/src/member.tmpl'
			]
		},

		uglify: {
			dist: {
				options: {
					sourceMap: '<%= paths.dev %>assets/scripts/maps/coenv-faculty-widget.js.map',
					sourceMapRoot: '../src/',
					sourceMappingURL: '../maps/main.js.map',
					sourceMapPrefix: '3'
				},
				files: {
					'<%= paths.dev %>assets/scripts/build/coenv-faculty-widget.js': [
						'<%= paths.dev %>bower_components/handlebars.js/dist/handlebars.js',
						'<%= paths.dev %>assets/scripts/src/member.tmpl',
						'<%= paths.dev %>assets/scripts/src/coenv-faculty-widget.js'
					],
					'<%= paths.dev %>assets/scripts/build/coenv-faculty-widget-admin.js': [
						'<%= paths.dev %>assets/scripts/src/coenv-faculty-widget-admin.js'
					]
				}
			}
		},

		handlebars: {
			compile: {
				options: {
					namespace: 'CoEnvFw.Templates',
					wrapped: true,
					processName: function ( filePath ) {
						var pieces = filePath.split('/');
						return pieces[pieces.length - 1];
					}
				},
				files: {
					'<%= paths.dev %>assets/scripts/src/member.tmpl': '<%= paths.dev %>assets/scripts/src/member.tmpl.hbs'
				}
			}
		},

		sass: {
			dist: {
				files: {
					'<%= paths.dev %>.tmp/assets/styles/build/coenv-faculty-widget.css': [
						'<%= paths.dev %>assets/styles/src/coenv-faculty-widget.scss'
					]
				}
			}
		},

		autoprefixer: {
			dist: {
				options: {
					browsers: ['last 2 versions']
				},
				files: {
					'<%= paths.dev %>.tmp/assets/styles/build/coenv-faculty-widget.css' : [
						'<%= paths.dev %>.tmp/assets/styles/build/coenv-faculty-widget.css'
					]
				}
			}
		},

		cssmin: {
			dist: {
				files: {
					'<%= paths.dev %>assets/styles/build/coenv-faculty-widget.css' : [
						'<%= paths.dev %>.tmp/assets/styles/build/coenv-faculty-widget.css'
					]
				}
			}
		},

		watch: {
			sass: {
				files: ['<%= paths.dev %>assets/styles/src/**/*.scss'],
				tasks: [ 'sass', 'autoprefixer' ]
			},
			css: {
				files: ['<%= paths.dev %>.tmp/assets/styles/build/**/*.css'],
				tasks: [ 'cssmin' ],
				options: {
					livereload: true
				}
			},
			scripts: {
				files: ['<%= paths.dev %>assets/scripts/src/**/*.js'],
				tasks: [ 'jshint', 'uglify' ],
				options: {
					livereload: true
				}
			},
			files: {
				files: [
					'<%= paths.dev %>**/*.{html,php}'
				],
				options: {
					livereload: true
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-handlebars');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-autoprefixer');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('dev', [
		'default',
		'watch'
	]);

	grunt.registerTask('default', [
		'jshint',
		'uglify',
		'sass',
		'autoprefixer',
		'cssmin'
	]);

};
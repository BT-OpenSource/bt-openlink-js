'use strict';

module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*!\n' +
        ' * <%= pkg.title || pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' +
        ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>\n' +
        ' */\n',
        // Task configuration.
        clean: {
            files: ['dist', '<%= pkg.name %>-*.zip']
        },
        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: true
            },
            dist: {
                src: ['src/jquery.openlink.js'],
                dest: 'dist/jquery.<%= pkg.name %>.<%= pkg.version %>.js'
            }
        },
        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            dist: {
                src: '<%= concat.dist.dest %>',
                dest: 'dist/jquery.<%= pkg.name %>.<%= pkg.version %>.min.js'
            }
        },
        qunit: {
            files: ['test/**/*.html']
        },
        jshint: {
            options: {
                jshintrc: true
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
            src: {
                src: ['src/**/*.js']
            },
            test: {
                src: ['test/**/*.js']
            },
            html: {
                options: {
                    extract: 'always'
                },
                files: {
                    src: ['src/**/*.html', 'test/**/*.html', 'sample/**/*.html']
                }
            }
        },
        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },
            src: {
                files: '<%= jshint.src.src %>',
                tasks: ['jshint:src', 'qunit']
            },
            test: {
                files: '<%= jshint.test.src %>',
                tasks: ['jshint:test', 'qunit']
            }
        },
        maven: {
            options: {
                groupId: 'com.bt.itrader.sdk',
                artifactId: 'openlink-js'
            },
            deploy: {
                options: {
                    goal: 'deploy',
                    url: 'https://collaborate.bt.com/artefacts/content/repositories/bt-itrader-snapshots/',
                    repositoryId: 'bt-itrader-snapshots',
                    uniqueVersion: false
                },
                expand: true,
                cwd: 'dist/',
                src: ['*', '../sample/*', '../src/jquery.openlink.js']
            },
            release: {
                options: {
                    goal: 'deploy',
                    url: 'https://collaborate.bt.com/artefacts/content/repositories/bt-itrader-releases/',
                    repositoryId: 'bt-itrader-releases'
                },
                expand: true,
                cwd: 'dist/',
                src: ['*', '../sample/*', '../src/jquery.openlink.js']
            }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    // Default task.
    grunt.registerTask('default', ['jshint', 'qunit', 'clean', 'concat', 'uglify']);

};

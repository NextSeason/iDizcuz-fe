/**
 * @file Gruntjs configuration file
 * @author LvChengbin( kelcb@163.com )
 */

'use strice';

var path = require( 'path' );

var __MODULE__ = path.basename( __dirname ),
    __APP__ = 'huati';

module.exports = function( grunt ) {
    grunt.initConfig( {
        pkg : grunt.file.readJSON( 'package.json' ),
        app : __APP__,
        domain : 'huati.grouple.cn',
        dist : 'output',
        module : __MODULE__,
        localdeploypath : '/Users/lvchengbin/Projects/Grouple',
        copy : {
            html : {
                files : [ {
                    expand : true,
                    cwd : 'html/',
                    src : [ '**/*.html' ],
                    dest : '<%= dist %>/html/<%= module %>/'
                } ]
            },
            stc : {
                files : [ {
                    expand : true,
                    src : [ 
                        'js/**/*.js', 'packages/**/*.js',
                        'images/**/*.png', 'packages/**/*.png',
                        'images/**/*.gif', 'packages/**/*.gif',
                        'fonts/**/*.eot', 'packages/**.*.eot'
                    ],
                    dest : '<%= dist %>/static/<%= module %>/'
                } ]
            },
            deploy : {
                files : [ {
                    expand : true,
                    cwd : '<%= dist %>',
                    src : [
                        'html/**/*',
                        'static/**/*'
                    ],
                    dest : '<%= localdeploypath %>'
                } ]
            }
        },
        compass : {
            scss : {
                options : {
                    sassDir : 'scss',
                    cssDir : '<%= dist %>/static/<%= module %>/css/',
                    relativeAssets : false
                }
            },
            packages : {
                options : {
                    sassDir : 'packages',
                    cssDir : '<%= dist %>/static/<%= module %>/packages/',
                    relativeAssets : false
                }
            }
        },

        replace : {
            package : {
                /**
                 * @Static::MODULE::PACKAGE - @Static::common::init - load a package from a module
                 * @Static::PACKAGE - @Static::init - load a package from current module
                 */
                options : {
                    patterns : [ {
                        match : /@Package::(\w+)(?:::([\w]+))?/g,
                        replacement : function() {
                            var args = arguments;

                            if( typeof args[ 2 ] === 'undefined' ) {
                                return '/static/' + __MODULE__ + '/packages/' + args[ 1 ] + '/bootstrap.js';
                            }

                            return '/static/' + args[ 1 ] + '/packages/' + args[ 2 ] + '/bootstrap.js';
                        }
                    } ],
                },
                files : [ {
                    expand : true,
                    src : [ 
                        '<%= dist %>/**/*.html',
                        '<%= dist %>/**/*.js'
                    ]
                } ]
            },
            self : {
                options : {
                    patterns : [ {
                        match : /@Self::([\w\\.]+)/g,
                        replacement : function() {
                            var args = arguments,
                                matches = args[ 4 ].match( /([^\/]+)\/packages\/([^\/]+)/ );

                            return '/static/' + __MODULE__ + '/packages/' + matches[ 2 ] + '/' + args[ 1 ];
                        }
                    } ]
                },
                files : [ {
                    expand : true,
                    src : [ '<%= dist %>/**/*.js' ]
                } ]
            },
            static : {
                options : {
                    patterns : [ {
                        match : /@Static::([\w\.\/]+)(?:::([\w\.\/]+))?/g,
                        replacement : function() {
                            /**
                             * @Static::MODULE::SRC - @Static::common::base.css - load base.css from common module
                             * @Static::SRC - @Static::base.css - load base.css from current module
                             */
                            var args = arguments;

                            if( typeof args[ 2 ] === 'undefined' ) {
                                return '/static/' + __MODULE__  + '/' + args[ 1 ];
                            }

                            return '/static/' + args[ 1 ] + '/' + args[ 2 ];
                        }
                    } ]
                },
                files : [ {
                    expand : true,
                    src : [ 
                        '<%= dist %>/**/*.html',
                        '<%= dist %>/**/*.js'
                    ]
                } ]
            }
        },

        /**
         * uglify js files
         */
        uglify : {
            target : {
                files : [ {
                    expand : true,
                    src : '<%= dist %>/**/*.js'
                } ]
            }
        },

        cssmin : {
            target : {
                files : [ {
                    expand : true,
                    src : [ '<%= dist %>/**/*.css' ]
                } ]
            }
        },
        watch : {
            dev : {
                files : [ 
                    'packages/**/*', 
                    'html/**/*', 
                    'js/**/*', 
                    'scss/**/*', 
                    'fonts/**/*',
                    'images/**/*'
                ],
                tasks : [ 'default', 'copy:deploy' ]
            }
        }
    } );

    grunt.loadNpmTasks( 'grunt-contrib-copy' );
    grunt.loadNpmTasks( 'grunt-contrib-compass' );
    grunt.loadNpmTasks( 'grunt-contrib-uglify' );
    grunt.loadNpmTasks( 'grunt-contrib-cssmin' );
    grunt.loadNpmTasks( 'grunt-contrib-watch' );
    grunt.loadNpmTasks( 'grunt-replace' );

    grunt.registerTask( 'remove', function( e ) {
        grunt.file.delete( 'output', { force : true } );
    } );

    grunt.registerTask( 'base', [ 'remove', 'compass', 'copy:html', 'copy:stc', 'replace' ] );

    grunt.registerTask( 'default', [ 'base', 'copy:deploy' ] );

    /**
     * online - with different configuration value and compress js&css files
     */
    grunt.registerTask( 'online', [ 'base', 'uglify', 'cssmin' ] );
};

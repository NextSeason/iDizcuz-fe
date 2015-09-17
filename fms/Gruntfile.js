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
        localdeploypath : '/Users/lvchengbin/Projects/iDizcuz',
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
                    cwd : 'static/',
                    src : [ '**/*' ],
                    dest : '<%= dist %>/static/<%= module %>/'
                } ]
            },
            deployStatic : {
                files : [ {
                    expand : true,
                    cwd : '<%= dist %>',
                    src : [
                        'static/**/*'
                    ],
                    dest : '<%= localdeploypath %>'
                } ]
            },
            deployHTML : {
                files : [ {
                    expand : true,
                    cwd : '<%= dist %>/html',
                    src : [
                        '**/*'
                    ],
                    dest : '<%= localdeploypath %>/application/views/page/'
                } ]
            }

        },
        compass : {
            scss : {
                options : {
                    sassDir : 'static/scss',
                    cssDir : '<%= dist %>/static/<%= module %>/css/',
                    relativeAssets : false
                }
            },
            packages : {
                options : {
                    sassDir : 'static/packages',
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
                        match : /@Package::([\w-_]+)(?:::([\w-_]+))?/g,
                        replacement : function() {
                            var args = arguments;

                            if( typeof args[ 2 ] === 'undefined' ) {
                                return '/static/' + __MODULE__ + '/packages/' + args[ 1 ] + '/bootstrap.js?_t=' + (+new Date);
                            }

                            return '/static/' + args[ 1 ] + '/packages/' + args[ 2 ] + '/bootstrap.js?_t=' + (+new Date);
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
                        match : /@Static::([\w./_-]+)(?:::([\w./_-]+))?/g,
                        replacement : function() {
                            /**
                             * @Static::MODULE::SRC - @Static::common::base.css - load base.css from common module
                             * @Static::SRC - @Static::base.css - load base.css from current module
                             */
                            var args = arguments;

                            if( typeof args[ 2 ] === 'undefined' ) {
                                return '/static/' + __MODULE__  + '/' + args[ 1 ] + '?_t=' + (+new Date);
                            }

                            return '/static/' + args[ 1 ] + '/' + args[ 2 ] + '?_t=' + (+new Date);
                        }
                    } ]
                },
                files : [ {
                    expand : true,
                    src : [ 
                        '<%= dist %>/**/*.html',
                        '<%= dist %>/**/*.js',
                        '<%= dist %>/**/*.css'
                    ]
                } ]
            },
            include : {
                options : {
                    patterns : [ {
                        match : /@Include::([\w\.\/]+)(?:::([\w\.\/]+))?/g,
                        replacement : function() {
                            /**
                             * @Include::MODULE::SRC - @Include::common::head.inc.html - <?php include TPL_PATH . '/common/head.inc.html'; ?>
                             * @Include::SRC - @Include::side.inc.html - <?php include TPL_PATH . '/CURRENT_MODULE/side.inc.html'; ?>
                             */
                            var args = arguments;    

                            if( typeof args[ 2 ] === 'undefined' ) {
                                return '<?php include TPL_PATH . \'/' + __MODULE__ + '/' + args[ 1 ] +  '\'; ?>';
                            }

                            return '<?php include TPL_PATH . \'/' + args[ 1 ] + '/' + args[ 2 ] + '\'; ?>';
                        }
                    } ]
                },
                files : [ {
                    expand : true,
                    src : [ '<%= dist %>/html/**/*.html' ]
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
                    'html/**/*', 
                    'static/**/*'
                ],
                tasks : [ 'default', 'copy:deployStatic', 'copy:deployHTML' ]
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

    grunt.registerTask( 'default', [ 'base', 'copy:deployStatic', 'copy:deployHTML' ] );

    /**
     * online - with different configuration value and compress js&css files
     */
    grunt.registerTask( 'online', [ 'base', 'uglify', 'cssmin' ] );
};

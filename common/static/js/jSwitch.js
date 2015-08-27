/**
 * @fileOverview jSwitch.js
 * @author LvChengbin( kelcb@163.com )
 * @package jSwitch
 * @description
 */
    var jSwitch = function( config ) {
        this.superClass = null;
        this.__handlers = {};

        this.children = [];
        this.parent = null;

        this.config = {};

        if( config ) {
            jSwitch.extend( jSwitch.extend( {}, this.config ), config );
        }
    };

    /**
     * to dispose an object and remove all properties
     * @function dispose
     */
    jSwitch.prototype.dispose = function() {
        for( var prop in this ) this[ prop ] = null;
    };

    /**
     * to add event listener with an event type
     * @function addEventListener
     * @grammar Object.addEventListener( evt, handler, handlerName )
     * @param { String } evt - event type
     * @param { Function } handler - the function which would be execute when the event being fired
     * @param { String } handlerName - if exists, the handlerName would be stored in an object,
     * and users can use this handlerName to remove the handler from listener list
     * 
     * @return { Object } this
     */
    jSwitch.prototype.addEventListener = function( evt, handler, handlerName ) {
        if( !jSwitch.isFunction( handler ) ) return;

        // create an object for listeners
        this.__listeners || ( this.__listeners = {} );

        // create an object for handlers with keys as handler name
        this.__handlers || ( this.__handlers = {} );

        ( this.__listeners[ evt ] || ( this.__listeners[ evt ] = [] ) ).push( {
            handler : handler
        } );

        // store handler in object handlers with handler name
        handlerName && ( this.__handlers[ handlerName ] = handler );

        return this;
    };

    /**
     * remove an event listener with event or event type
     */
    jSwitch.prototype.removeEventListener = function( evt, handler ) {
        var listeners = this.__listeners,
            _handler = handler,
            handlers,
            i = 0,
            l;

        if( !listener || !( handlers = listeners[ evt ] ) || !( l = handlers.length ) ) return;

        if( jSwitch.isString( handler ) ) {
            if( !this.__handlers || !this.__handlers.hasOwnProperty( handler ) ) return;
            _handler = this.__handlers[ handler ];
            this.__handlers[ handler ] = null;
        }

        for( ; i < l; i += 1 ) {
            handlers[ i ].handler === _handler && handlers.splice( i--, 1 );
        }

        return this;
    };

    jSwitch.prototype.dispatchEvent = function( evt, params ) {
        var me = this;

        var type;

        if( !this.__listeners ) return;

        jSwitch.isString( evt ) && ( evt = new jSwitch.Event( evt ) );

        type = jSwitch.extend( evt, params || {}, true ).type;

        this.__listeners[ type ].each( function( handler, i ) {
            handler.call( me, evt );
        } );

        jSwitch.isFunction( this[ 'on' + type ] ) && this[ 'on' + type ].call( this, evt );

        return evt.returnValue || false;
    }

    jSwitch.createClass = function( constructor, extend, superClass ) {
        extend || ( extend || {} );
        superClass || ( superClass = jSwitch );

        var fn = function() {
            var attr;
            for( attr in extend ) this[ attr ] = extend[ attr ];
            this.superClass = superClass
            constructor.apply( this, arguments );
        };

        var Fn = new Function();

        Fn.prototype = superClass.prototype;
        fn.prototype = new Fn;

        fn.extend = function( obj ) {
            var attr;
            for( attr in obj ) fn.prototype[ attr ] = obj[ attr ];
            return fn;
        };

        return fn;
    };


    jSwitch.prototype.ready = ( function() {
        var isready = false,
            callbackPool = [];

        var handler = function() {
            document.removeEventListener( 'DOMContentLoaded', handler, false );
            ready();
        };

        document.addEventListener( 'DOMContentLoaded', handler, false );
        window.addEventListener( 'load', ready, false );

        function ready() {
            isready = true;
            while( callbackPool.length ) callbackPool.shift()();
        }

        return function( fn ) {
            isready  ? fn() : callbackPool.push( fn );
        };

    } )();

    jSwitch.prototype.initialize = function() {
        this.dispatchEvent( 'ready' );
    };

    jSwitch.prototype.broadcast = function() {
        this.children 
    };

    jSwitch.prototype.multicast = function() {
    }

    jSwitch.prototype.post = function() {
        //send message to parent
    };

    jSwitch.prototype.message = function( options ) {
        /**
        var defaultOptions = {
            from : this,
            to : xx
        };
        */

    };

    jSwitch.prototype.loadSources = function( list ) {
        list = list || [];

        var i = 0,
            l = list.length;

        for( ; i < l; i += 1 ) {
            jSwitch.Loader( list[ i ][ 0 ], list[ i ][ 1 ] || {} );
        }
    };

    window.J = window.jSwitch = jSwitch;

jSwitch.extend = function( target, src, force ) {
    var prop;

    if( force !== false ) force = true;
    for( prop in src ) {
        if( !src.hasOwnProperty( prop ) ) continue;
        if( force || !target.hasOwnProperty( prop ) ) {
            target[ prop ] = src[ prop ];
        }
    }
    return target;
};

'Arguments,Function,String,Number,Date,RegExp,Error'.split( ',' ).forEach( function( i ) {
    jSwitch[ 'is' + i ] = function( obj ) {
        return Object.prototype.toString.call( obj ) === '[object ' + i + ']';
    };
} );


jSwitch.extend( jSwitch, {
    $ : function( selector, context ) {
        context = context || document;
        return context.querySelector( selector );
    },

    $$ : function( selector, context ) {
        context = context || document;
        return context.querySelectorAll( selector );
    },

    extract : function( chain, data ) { 
        var list = chain.split( '.' ),
            i = 0,
            l = list.length,
            tmp;
 
        data = data || window;
 
        tmp = data;
 
        for( ; i < l; i += 1 ) { 
            tmp = tmp[ list[ i ] ];
            if( typeof tmp === 'undefined' ) return tmp 
        }   
 
        return tmp;
    },

    isWindow : function( obj ) {
        return obj != null && obj === obj.window;
    },

    isArray : function( obj ) {
        return Array.isArray( obj );
    },

    isUndefined : function( obj ) {
        return typeof obj === 'undefined';
    },
    isObject : function( obj ) {
        var type = typeof obj;
        return type === 'function' || type === 'object' && !!obj;
    },
    clone : function( obj ) {
        if( !jSwitch.isObject( obj ) ) return obj;
        return jSwitch.isArray( obj ) ? obj.slice() : jSwitch.extend( {}, obj );
    },
    currentScript : function() {
        if( document.currentScript ) return document.currentScript;

        var scripts = document.getElementsByTagName( 'script' ),
            i = 0,
            l = scripts.length;

        for( ; i < l; i += 1 ) {
            if( scripts[ i ].readyState === 'interactive' ) {
                return scripts[ i ];
            }
        }

        return null;
    },
    encodeHTML : function( source ) {
        return String( source ).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    },
    template : function( text ) {
        var settings = {
            evaluate : /<%([\s\S]+?)%>/g,
            interpolate : /<%=([\s\S]+?)%>/g,
            escape : /<%-([\s\S]+?)%>/g
        };

        // When customizing `templateSettings`, if you don't want to define an
        // interpolation, evaluation or escaping regex, we need one that is
        // guaranteed not to match.
        var noMatch = /(.)^/;

        // Certain characters need to be escaped so that they can be put into a
        // string literal.

        var escapeMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '`': '&#x60;'
        };

        var escapes = { 
            "'" : "'",
            '\\' : '\\',
            '\r' : 'r',
            '\n' : 'n',
            '\t' : 't',
            '\u2028' : 'u2028',
            '\u2029' : 'u2029'
        };

        var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

        var escapeChar = function( match ) {
            return '\\' + escapes[ match ];
        };

        // Combine delimiters into one regular expression via alternation.
        var matcher = RegExp( [
            ( settings.escape || noMatch ).source,
            ( settings.interpolate || noMatch ).source,
            ( settings.evaluate || noMatch ).source
        ].join( '|' ) + '|$', 'g' );

        // Compile the template source, escaping string literals appropriately.
        var index = 0;
        var source = "__p+='";
        text.replace( matcher, function( match, escape, interpolate, evaluate, offset ) {
            source += text.slice( index, offset ).replace( escaper, escapeChar );
            index = offset + match.length;

            if( escape ) {
                source += "'+\n((__t=(" + escape + "))==null?'':jSwitch.encodeHTML(__t))+\n'";
            } else if( interpolate ) {
                source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
            } else if( evaluate ) {
                source += "';\n" + evaluate + "\n__p+='";
            }

            // Adobe VMs need the match returned to produce the correct offest.
            return match;
        });
        source += "';\n";

        // If a variable is not specified, place data values in local scope.
        if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

        source = "var __t,__p='',__j=Array.prototype.join," +
        "print=function(){__p+=__j.call(arguments,'');};\n" +
        source + 'return __p;\n';

        try {
            var render = new Function(settings.variable || 'obj', '_', source);
        } catch (e) {
            e.source = source;
            throw e;
        }

        var template = function(data) {
            return render.call( this, data, jSwitch );
        };

        // Provide the compiled source as a convenience for precompilation.
        var argument = settings.variable || 'obj';
        template.source = 'function(' + argument + '){\n' + source + '}';

        return template;
    },
    guid : ( function() {
        var id = 0;
        return function() {
            return id++;
        };
    } )(),
    ajax : function() {
    },
    post : function() {
    },
    get : function() {
    },

    byteLen : function( str ){
        var total = 0,
            charCode,
            i = 0,
            l = str.length;

        for( ; i < l; i += 1 ) {
            charCode = str.charCodeAt( i );
            if(charCode <= 0x007f) {
                total += 1;
            }else if(charCode <= 0x07ff){
                total += 2;
            }else if(charCode <= 0xffff){
                total += 3;
            }else{
                total += 4;
            }
        }
        return total;
    },
    parseJson : function( str ) {
        return ( new Function( "return (" + str + ")" ) )();
    },
    formatString : function( str, data ) { 
        return str.replace( /{#([\w.]+)}/g, function( m, n ) { 
            val = jSwitch.extract( n, data );
            return typeof val === 'undefined' ? '' : val;
        } );
    },
    getQuery : function( name ) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }
} );

    jSwitch.Event = function( src, props ) {
        if( !( this instanceof jSwitch.Event ) ) {
            return new jSwitch.Event( type, props );
        }

        if( src && src.type ) {
            this.type = src.type;
            this.target = src.target || null;
            this.returnValue = true;
            this.currentTarget = null;
        } else {
            this.type = src;
        }

        if( props ) {
            jSwitch.extend( this, props );
        }

        this.timeStamp = src && src.timeStamp || +( new Date );
    };

    jSwitch.Event.prototype = {
        constructor : jSwitch.Event,
        preventDefault : function() {
        },
        stopPropergation : function() {
        }
    };

/**
 * @author LvChengbin
 */

jSwitch.Cache = ( function() {
    return {
        get : function( key ) {
        },
        set : function( key, value ) {
        },
        exists : function( key ) {
        },
        check : function( key ) {
        }
    };
} )();

jSwitch.Loader = ( function() {
    function loadJS( name, url ) {
        var node = document.createElement('script');

        node.type = 'text/javascript';
        node.charset = 'utf-8';
        node.async = true;

        node.setAttribute( 'data-source-name', name );
        node.setAttribute( 'data-source-url', url ); 

        return node;
    }

    function loadCSS( url ) {
        var node = document.createElement( 'link' );
        node.rel = 'stylesheet';
        node.type = 'text/css';
        node.href = url;
        return node;
    }

    return function( url, options ) {
        options = options || {};

        var node,
            head = document.getElementsByTagName( 'head' )[ 0 ];

        if( jSwitch.isUndefined( options.type ) ) {
            options.type = url.substr( url.lastIndexOf( '.' ) + 1 ) || 'json'; 
        }

        switch( options.type ) {
            case 'js' :
                if( jSwitch.isUndefined( jSwitch.PackagesMap[ url ] ) ) {
                    node = loadJS( options.name || url, url );
                    node.addEventListener( 'load', function() {
                        setTimeout( function() {
                            options.onload && options.onload(); 
                        }, 0 );
                    }, false );

                    node.src = url;
                    head.appendChild( node );
                }
                break;
            case 'css' :
                node = loadCSS( url );
                node.addEventListener( 'load', function() {
                    setTimeout( function() {
                        options.onload && options.onload(); 
                    } );
                } );
                head.appendChild( node );
                break;
        }
    };
} )();

    /**
     * a class used to create a package in jSwtich
     * and all packages create with new J.Package is inherited from jSwitch
     */

    jSwitch.PackagesMap = {};
    jSwitch.mountQueue = [];

    jSwitch.Package = function( options ) {
        var Package  = function() {
        };

        var script = jSwitch.currentScript();

        if( !script )
            return ( jSwitch.PackagesMap[ jSwitch.mountQueue.shift() ] = jSwitch.createClass( Package, options, jSwitch ) );

        return ( jSwitch.PackagesMap[ script.getAttribute( 'data-source-name' ) ] = jSwitch.createClass( Package, options, jSwitch ) );
    };

    
    jSwitch.prototype.mount = function( name, Package, options ) {
        var me = this;

        jSwitch.mountQueue.push( name );

        var instantPackage = function( Package ) {
            var pkg = new Package( options ); 

            pkg.parent = me;
            pkg.name = name;

            me.children || ( me.children = {} );

            if( me.children[ name ] ) {
                console.warn( 'the package named "' + name + '" is already exists, and it will be override by this one' );
            }

            me.children[ name ] = pkg;

            pkg.dispatchEvent( 'mount', {
                dispatcher : this
            } );

            pkg.initialize && pkg.initialize( options );
            pkg.loadSources && pkg.loadSources( pkg.sources );

        };

        if( Package instanceof jSwitch ) {
            instantPackage( Package );
            return this;
        };

        /**
         * if package has already loaded
         * get it form jSwitch.PackagesMap and do instantion
         */
        if( jSwitch.PackagesMap[ Package ] ) {
            instantPackage( jSwitch.PackagesMap[ Package ] );
        } else {
            jSwitch.Loader( Package, {
                name : name,
                type : 'js',
                onload : function( Package ) {
                    instantPackage( jSwitch.PackagesMap[ name ] );
                }
            } );
        }
    };

    jSwitch.prototype.unmount = function( pkg ) {
        /**
         * dispatch beforeunmount event before unmount
         */
        pkg.dispatchEvent( 'beforeunmount', {
            dispatcher : this
        } );

        if( jSwtich.isString( pkg ) ) {
            this.children.hasOwnProperty( pkg ) && ( this.children[ pkg ] = null ); 
        } else {
            for( item in this.children ) {
                if( this.children[ item ] === pkg ) {
                    this.children[ item ] = null;
                    break;
                }
            }
        }

        
        /**
         * remove package from children list
         */
        for( ; i < l; i += 1 ) {
            if( this.children[ i ] === pkg ) this.children.splice( i, 1 );
        }

        /**
         * to tell group manager remove this package from all group
         */

        /**
         * dispatch onunmount event after unmount this package from it's parent package
         */
        pkg.dispatchEvent( 'unmount', {
            dispatcher : this
        } );
    };

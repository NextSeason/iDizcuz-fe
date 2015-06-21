J.Package( {
    initialize : function( options ) {
        this._cache = {
            preloadIds : [],
            posts : {}
        };

        this.compiledTpl = J.template( $( '#post-list-tpl' ).val() );

        this.currentOrder = 0;

        this.rn = 20;
        this.topic = $( '.topic-area' ).attr( 'data-topic-id' );

        this.bindEvent();
        this.load( 0, 0 );
    },

    load : function( order, pn, rn ) {
        if( J.isUndefined( rn ) ) rn = this.rn;

        var me = this,
            preloadIds = this._cache.preloadIds;

        var start = ( pn - 1 ) * rn + 1;

        var data = {
            topic : this.topic,
            _t : +new Date
        };

        if( preloadIds.length >= start + pn ) {
            data.posts = preloadIds.slice( start ).join( ',' );
        } else {
            data.s = start;
            data.l = rn;
            data.order = order;
        }

        $.ajax( {
            url : '/topic/interface/getposts',
            data : data
        } ).done( function( response ) {
            var errno = +response.errno;

            $( '.loading-list' ).fadeOut( 'slow' );

            if( errno ) return false;

            var posts = me.formatData( response.data.posts );
            
            me.render( order, response.data.posts );

            me.setCache( response );
        } );

    },

    getTitle : function( content ) {
        var node = $( '<div>' ),
            title;
        node.append( content );

        title = node.find( 'p' ).eq( 0 ).text();

        if( title.length < 3 ) {
            title = node.text();
        }

        return title.substr( 0, 20 );
    },

    formatData : function( data ) {
        var i = 0,
            l = data.length;

        for( ; i < l; i += 1 ) {
            data[ i ].title = this.getTitle( data[ i ].content );
        }

        return data;
    },

    render : function( order, posts ) {
        var html = this.compiledTpl( { data : posts } );
        console.log( 'posts', posts );
        $( '.post-list' ).html( html );
    },

    getPost : function( el ) {
        var postEl = el.closest( 'li.posts' );

        if( !postEl.length ) return null;

        return postEl;
    },

    getPostId : function( postEl ) {
        return postEl.attr( 'data-post-id' );
    },

    setCache : function( response ) {
    },
    bindEvent : function() {
        var me = this;
        $( '.list-area .sort' ).on( 'click', function( e ) {
            var order = $( this ).attr( 'data-order-type' );
            me.load( order, 0 );
            $( '.list-area .sort' ).removeClass( 'focus' );
            $( this ).addClass( 'focus' );
            $( '.loading-list.top' ).show();
        } );

        $( '.list-area' ).on( 'click', '.op-btn', function( e ) {
            var postEl = me.getPost( $( this ) ),
                bubbleEl = postEl.find( '.op-bubbles' ),
                action = $( this ).attr( 'data-action' ),
                pos = $( this ).position();

            if( action == 'unfav' ) {
                return;
            }

            bubbleEl.find( '> .triangle' ).css( 'left', pos.left + $( this ).width() / 2 - 10 );
            bubbleEl.hide();
            bubbleEl.find( '.box' ).hide();
            bubbleEl.find( '.' + action ).show();
            bubbleEl.show();

        } );

        $( '.list-area' ).on( 'click', '.bubbles .close', function( e ) {
            $( this ).closest( '.bubbles' ).hide();
        } );
    }

} );

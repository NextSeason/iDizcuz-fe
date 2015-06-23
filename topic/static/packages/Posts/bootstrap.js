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
            data[ i ].ctime = data[ i ].ctime.replace( /\s+[:\d]+/, '' );
            data[ i ].mtime = data[ i ].mtime.replace( /\s+[:\d]+/, '' );
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
            var action = $( this ).attr( 'data-action' );
            me[ action + 'Action' ]( $( this ) );
        } );

        $( '.list-area' ).on( 'click', '.bubbles .close', function( e ) {
            $( this ).closest( '.bubbles' ).hide();
        } );
    },

    agreeAction : function( el ) {
        
    },

    markAction : function( el ) {
        var me = this,
            postEl = this.getPost( el ),
            postId = postEl.attr( 'data-post-id' ),
            markId = +el.attr( 'data-mark-id' ),
            data = {
                post_id : postId,
                act : +!markId,
                mark_id : markId
            };

        if( markId ) {
            el.removeClass( 'op-unmark' ).addClass( 'op-mark' ).attr( 'data-mark-id', 0 );
            el.html( '<i class="fa fa-star-o"></i> 收藏' );
            if( me.showingBubble( el ) == 'mark' ) me.hideBubble( el );
        }

        $.ajax( {
            url : '/topic/interface/mark',
            method : 'POST',
            data : data
        } ).done( function( response ) {
            var errno = +response.errno,
                data = response.data || {};

            if( errno ) {
            }

            if( +data.mark ) {
                el.removeClass( 'op-mark' ).addClass( 'op-unmark' ).attr( 'data-mark-id', data.mark );
                el.html( '<i class="fa fa-star"></i> 取消收藏' );

                me.showBubble( el );
            }
        } );

    },
    showingBubble : function( el ) {
        return this.getPost( el ).find( '.op-bubbles' ).attr( 'data-showing' );
    },
    showBubble : function( el ) {
        var postEl = this.getPost( el ),
            bubbleEl = postEl.find( '.op-bubbles' ),
            action = el.attr( 'data-action' ),
            pos = el.position();

        bubbleEl.attr( 'data-showing', action );
     
        bubbleEl.find( '> .triangle' ).css( 'left', pos.left + el.width() / 2 - 10 );
        bubbleEl.hide();
        bubbleEl.find( '.box' ).hide();
        bubbleEl.find( '.' + action ).show();
        bubbleEl.show();
    },

    hideBubble : function( el ) {
        this.getPost( el ).find( '.op-bubbles' ).hide();
    }
} );

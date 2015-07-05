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
            order : order,
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

            $( '.loading.list-top' ).fadeOut( 'slow' );

            if( errno ) return false;

            var posts = me.formatData( response.data.posts );
            
            me.render( response.data.posts );

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

    render : function( posts ) {
        var html = this.compiledTpl( { data : posts } );
        console.log( 'posts', posts );
        $( '.post-list' ).append( html );
    },

    getPostEl : function( el ) {
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
        $( '.topic-area .sort' ).on( 'click', function( e ) {
            var order = $( this ).attr( 'data-order' );
            $( '.post-list' ).html( '' );
            me.load( order, 0 );
            $( '.list-area .sort' ).removeClass( 'focus' );
            $( this ).addClass( 'focus' );
            $( '.loading.list-top' ).show();
        } );

        $( '.topic-area' ).on( 'click', '.op-btn', function( e ) {
            var action = $( this ).attr( 'data-action' );
            me[ action + 'Action' ]( $( this ) );
        } );

        $( '.topic-area' ).on( 'click', '.bubbles .close', function( e ) {
            $( this ).closest( '.bubbles' ).hide();
        } );

        $( '.topic-area' ).on( 'click', '.report-submit', function( e ) {
            me.submitReport( $( this ) );
        } );
    },

    submitReport : function( el ) {
        var postEl = this.getPostEl( el ),
            postId = postEl.attr( 'data-post-id' ),
            reportEl = el.closest( '.report' ),
            tipEl = el.parent().find( '.tip' );

        var checked = reportEl.find( 'input[type=radio]:checked' );

        if( !checked.length ) {
            tipEl.html( '请选择投诉原因' ).addClass( 'err' ); 
            return;
        }

        var reason = checked.val();

        var desc = $.trim( reportEl.find( 'textarea.desc' ).val() );

        $.ajax( {
            url : '/topic/interface/report',
            method : 'POST',
            data : {
                post_id : postId,
                reason : reason,
                desc : desc
            }
        } ).done( function( response ) {
            var errno = +response.errno;

            if( !errno ) {
                tipEl.removeClass( 'err' ).html( '您的投诉已经提交，我们会尽快为您处理。感谢您的支持' ); 

                return;
            }
            switch( errno ) {
                case 3 : 
                    // not login
                    break;
                case 14 : 
                    tipEl.html( '您已经提交过投诉，我们会尽快为您处理' ).addClass( 'err' ); 
                    break;
                default :
                    tipEl.html( '系统错误，请稍候再试' ).addClass( 'err' ); 
                    break;
                
            }

        } );
    },

    agreeAction : function( el ) {
        var postEl = this.getPostEl( el ),
            postId = postEl.attr( 'data-post-id' ),
            opinion = el.attr( 'data-intent' );

        $.ajax( {
            url : '/topic/interface/vote',
            method : 'POST',
            data : {
                post_id : postId,
                opinion : opinion,
                type : 0,
                value : 1
            }
        } ).done( function( response ) {
            var errno = +response.errno,
                o;

            if( errno ) { return false; }

            o = +el.find( 'b' ).html();

            el.find( 'b' ).html( o + 1 );

        } );
    },

    markAction : function( el ) {
        var me = this,
            postEl = this.getPostEl( el ),
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
    shareAction : function( el ) {
        this.showBubble( el );
    },

    reportAction : function( el ) {
        this.showBubble( el );
    },
    showingBubble : function( el ) {
        return this.getPostEl( el ).find( '.op-bubbles' ).attr( 'data-showing' );
    },
    showBubble : function( el ) {
        var postEl = this.getPostEl( el ),
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
        this.getPostEl( el ).find( '.op-bubbles' ).hide();
    }
} );

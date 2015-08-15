J.Package( {
    initialize : function( options ) {
        /**
         * this package will be used both in mark page and user posts page
         * so, there will have several different urls
         */
        this.url = options.url;
        this.userId = options.userId;
        this.loading = false;
        this.cursor = 0;
        this.rn = 20;
        this.compiledTpl = J.template( $( '#post-list-tpl' ).val() );
        this.load();
        this.bindEvent();
    },
    bindEvent : function() {
        var me = this;
        $( '.load-more' ).on( 'tap', function( e ) {
            e.preventDefault();
            if( me.loading ) return false;
            me.load();
        } );
    },
    load : function() {
        var me = this;

        this.loading = true;
        $( '.load-more' ).html( '正在加载...' );

        $.ajax( {
            url : this.url,
            data : {
                cursor : this.cursor,
                rn : this.rn,
                account_id : this.userId,
                _t : +new Date
            },
            success : function( response ) {
                var errno = +response.errno,
                    posts,
                    l;

                if( !errno ) {
                    posts = response.data.posts;
                    ( l = posts.length ) && ( me.cursor = posts[ l - 1 ].id );
                    me.render( posts );
                    me.loading = false;
                }
            }
        } );
    },
    render : function( data ) {
        var html = this.compiledTpl( { data : data } );
        $( '.post-list' ).append( html );
        if( data.length < this.rn ) {
            $( '.load-more' ).hide();
        } else {
            $( '.load-more' ).html( '点击加载更多' ).show();
        }
    }

} );

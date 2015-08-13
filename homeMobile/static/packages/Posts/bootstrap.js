J.Package( {
    initialize : function( options ) {
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
            url : '/home/interface/posts',
            data : {
                cursor : this.cursor,
                rn : this.rn
            },
            success : function( response ) {
                var errno = +response.errno,
                    posts;

                if( !errno ) {
                    posts = response.data.posts;
                    me.cursor = posts[ posts.length - 1 ].id;
                    me.render( posts );
                    me.loading = false;
                }
            }
        } );
    },
    render : function( data ) {
        var html = this.compiledTpl( { data : data } );
        $( '.post-list' ).append( html );
        if( data.length < 20 ) {
            $( '.load-more' ).hide();
        } else {
            $( '.load-more' ).html( '点击加载更多' ).show();
        }
    }
} );

J.Package( {
    initialize : function( options ) {
        this.cursor = 0;
        this.rn = 20;
        this.compiledTpl = J.template( $( '#new-posts-tpl' ).val() );

        this.load();
        this.bindEvent();
    },
    bindEvent : function() {
        var me = this;
        $( '.load-more' ).on( 'click', function( e ) {
            e.preventDefault();
            me.load();
        } );
    },
    load : function() {
        var me = this;

        $.ajax( {
            url : '/home/interface/posts',
            data : {
                cursor : this.cursor,
                rn : this.rn
            },
        } ).done( function( response ) {
            var errno = +response.errno,
                posts;

            if( !errno ) {
                posts = response.data.posts;
                me.cursor = posts[ posts.length - 1 ].id;
                me.render( posts );
            }
        } );
    },
    render : function( data ) {
        var html = this.compiledTpl( { data : data } );
        $( '.new-post-list' ).append( html );
        if( data.length < 20 ) {
            $( '.load-more' ).hide();
        } else {
            $( '.load-more' ).css( 'display', 'block' );
        }
    }
} );

J.Package( {
    initialize : function( options ) {
        this.cursor = 0;
        this.rn = 20;
        this.compiledTpl = J.template( $( '#new-posts-tpl' ).val() );

        this.load( this.cursor );
    },
    load : function( cursor ) {
        var me = this;

        $.ajax( {
            url : '/home/interface/posts',
            data : {
                cursor : cursor,
                rn : this.rn
            },
        } ).done( function( response ) {
            var errno = +response.errno;

            if( !errno ) {
                me.render( response.data.posts );
            }
        } );
    },
    render : function( data ) {
        var html = this.compiledTpl( { data : data } );
        $( '.new-post-list' ).append( html );
        if( data.length < 20 ) {
            $( '.load-more' ).hide();
        } else {
            $( '.load-more' ).show();
        }
    }
} );

J.Package( {
    initialize : function( options ) {
        this.compileTpl = J.template( $( '#post-tpl' ).val() );
        this.postId = options.postId;
        this.load();
    },
    load : function() {
        var me = this;

        $.ajax( {
            url : '/topic/interface/getpost',
            data : {
                post_id : this.postId
            },
            success : function( response ) {
                var errno = +response.errno;

                if( !errno ) {
                    me.render( response.data.post );
                }
            }
        } );
    },
    render : function( data ) {
        var html = this.compileTpl( { post : data } );
        $( '.boxes.post' ).html( html );
    }
} );


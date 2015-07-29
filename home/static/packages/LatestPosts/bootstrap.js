J.Package( {
    initialize : function( options ) {
        this.rn = options.rn;
        this.compliedTpl = J.template( $( '#hot-posts-tpl' ).val() );
        this.container = $( '.latest-post-list' );
        this.load();
    },
    load : function() {
        var me = this;
        $.ajax( {
            url : '/home/interface/latestposts',
            data : {
                rn : this.rn
            }
        } ).done( function( response ) {
            var errno = +response.errno;

            if( !errno ) {
                me.render( response.data.posts );
            }
        } );
    },
    render : function( data ) {
        var html = this.compliedTpl( { data : this.formatData( data ) } );
        this.container.html( html );
    },
    formatData : function( data ) {
        var i = 0,
            l = data.length;
        for( ; i < l; i += 1 ) {
            data[i].shortTitle = data[i].title.substr( 0, 13 );

            if( data[i].title.length > 13 ) {
                data[i].shortTitle += '...';
            }
        }

        return data;
    }
} );

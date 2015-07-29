J.Package( {
    initialize : function( options ) {
        this.blocks = options.blocks;

        this.compliedTpl = J.template( $( '#hot-posts-tpl' ).val() );

        this.action();
    },
    action : function() {
        var i = 0,
            l = this.blocks.length;

        for( ; i < l; i += 1 ) {
            this.load( this.blocks[i] );
        }
    },
    load : function( params ) {
        var me = this;
        $.ajax( {
            url : '/home/interface/hotposts',
            data : {
                topic_id : params.topic_id,
                rn : params.rn
            }
        } ).done( function( response ) {
            var errno = +response.errno;

            if( !errno ) {
                me.render( params.container, response.data.posts );
            }
        } );
    },
    render : function( container, data ) {
        var html = this.compliedTpl( { data : this.formatData( data ) } );
        container.html( html );
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

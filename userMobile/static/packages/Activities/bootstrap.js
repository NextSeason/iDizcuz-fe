J.Package( {
    initialize : function( options ) {
        this.cursor = 0;
        this.rn = 20;
        this.self = !!options.self;
        this.userId = options.userId; 
        this.compiledTpl = J.template( $( '#activity-list-tpl' ).val() );
        this.load();
        this.bindEvent();
    },
    bindEvent : function() {
        var me = this;

        $( '.load-more' ).on( 'click', function( e ) {
            me.load();
        } );
    },
    load : function() {
        var me = this;
        var data = {
            cursor : this.cursor,
            rn : this.rn
        };

        if( this.self ) {
            data.follower_id = this.userId;
        } else {
            data.account_id = this.userId;
        }
        $.ajax( {
            url : '/activities/interface/getactivities',
            method : 'GET',
            data : data,
            success : function( response ) {
                var errno = +response.errno;

                if( !errno ) {
                    me.render( response.data.activities );
                }
            }
        } );
    },
    render : function( data ) {
        var html = this.compiledTpl( { data : data } ),
            l = data.length;

        if( l ) {
            this.cursor = data[ l - 1 ].id
        }
        $( '.activity-list' ).append( html );

        l < this.rn ? $( '.load-more' ).hide() : $( '.load-more' ).show();
    }
} );

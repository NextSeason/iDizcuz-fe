J.Package( {
    initialize : function( options ) {
        this.cursor = 0;
        this.rn = 20;
        this.self = !!options.self;
        this.accountId = $( '#idizcuz' ).attr( 'data-account-id' );
        this.compiledTpl = J.template( $( '#activity-list-tpl' ).val() );

        this.load( this.cursor );
    },
    load : function( cursor ) {
        var me = this;
        var data = {
            cursor : cursor,
            rn : this.rn
        };

        if( this.self ) {
            data.follower_id = this.accountId;
        } else {
            data.account_id = this.accountId;
        }
        $.ajax( {
            url : '/activities/interface/getactivities',
            method : 'GET',
            data : data
        } ).done( function( response ) {
            var errno = +response.errno;

            if( !errno ) {
                me.render( response.data.activities );
            }
        } );
    },
    render : function( data ) {
        var html = this.compiledTpl( { data : data } );
        $( '.activity-list' ).append( html );
        if( data.length < 20 ) {
            $( '.load-more' ).hide();
        } else {
            $( '.load-more' ).show();
        }
    }
} );

J.Package( {
    initialize : function( options ) {
        this.cursor = 0;
        this.rn = 20;
        this.compiledTpl = J.template( $( '#new-accounts-tpl' ).val() );

        this.load( this.cursor );
    },
    load : function( cursor ) {
        var me = this;

        $.ajax( {
            url : '/home/interface/accounts',
            data : {
                cursor : cursor,
                rn : this.rn
            }
        } ).done( function( response ) {
            var errno = +response.errno;

            if( !errno ) {
                me.render( response.data.accounts );
            }
        } );
    },
    render : function( data ) {
        var html = this.compiledTpl( { data : data } );
        $( '.new-account-list' ).append( html );
    }
} );

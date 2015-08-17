J.Package( {
    initialize : function( options ) {
        this.bindEvent();
    },
    bindEvent : function() {
        $( '.choice' ).on( 'click', function( e ) {
            e.preventDefault();
            $( '.point-list' ).toggle();
        } );
    }
} );

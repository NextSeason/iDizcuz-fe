J.Package( {
    initialize : function() {
        this.bindEvent();
    },
    bindEvent : function() {
        $( '.sidebar .show-editor' ).on( 'click', function( e ) {
            e.preventDefault();
            showEditorDialog();
        } );
    }
} );

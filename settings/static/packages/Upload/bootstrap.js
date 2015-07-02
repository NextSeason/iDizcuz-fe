J.Package( {
    initialize : function( options ) {
        this.bindEvent();
    },

    bindEvent : function() {
        var me = this,
            btn = $( '.real-file-btn' );

        btn.on( 'change', function( e ) {
            var files = $( this ).get( 0 ).files;

            if( files.length ) {
                me.showDialog();
            }
        } );
    },
    showDialog : function() {
    }
} );

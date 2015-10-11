J.Package( {
    initialize : function( options ) {
        this.bindEvent();
        this.showing = false;
    },
    bindEvent : function() {
        var me = this,
            start = this.start || 0;;

        $( window ).on( 'scroll load pageshow', function() {

            if( $( window ).scrollTop() > start ) {
                me.showing || me.show();    
            } else {
                me.showing && me.hide();
            }
        } );

        $( '.bottom-fixed-bar .scroll-top' ).on( 'click', function( e ) {
            e.preventDefault();
            window.scrollTo( 0, 0 );
        } );
    },
    show : function() {
        $( '.bottom-fixed-bar' ).show();
        this.showing = true;
    },
    hide : function() {
        $( '.bottom-fixed-bar' ).hide();
        this.showing = false;
    }  
} );

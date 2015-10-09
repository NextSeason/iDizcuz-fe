J.Package( {
    initialize : function( options ) {
        this.bindEvent();
        this.showing = false;
    },
    bindEvent : function() {
        var me = this;

        $( window ).on( 'scroll load', function() {

            if( $( window ).scrollTop() > $( '.boxes.sub-nav' ).offset().top ) {
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

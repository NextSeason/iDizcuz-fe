J.Package( {
    initialize : function() {
        this.sideNavBarStatus = false;
        this.el = $( '.side-nav-bar' );
        this.bindEvent();
    },

    show : function() {
        var left = $( '.boxes.body > .inner' ).offset().left + $( '.boxes.body > .inner' ).width() + 10;
        this.el.css( 'left', left ).fadeIn();
        this.sideNavBarStatus = true;
    },

    hide : function() {
        this.el.fadeOut();
        this.sideNavBarStatus = false;
    },

    bindEvent : function() {
        var me = this;

        $( window ).on( 'scroll resize', function( e ) {
            if( $( window ).scrollTop() > $( window ).height() ) {
                me.show();
            } else {
                me.hide();
            }
        } );

        this.el.find( '.scroll-top' ).on( 'click', function( e ) {
            e.preventDefault();
            $( 'html, body' ).animate( { scrollTop : 0 }, 'slow' );
        } );

        this.el.find( '.write-post' ).on( 'click', function( e ) {
            e.preventDefault();
            showEditorDialog();
        } );
    }
} );

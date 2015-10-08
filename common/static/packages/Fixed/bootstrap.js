J.Package( {
    initialize : function( options ) {
        if( !this.el ) return false;
        this.isfixed = false;
        this.dis || ( this.dis = 0 );
        this.top = this.el.offset().top;
        this.bindEvent();
    },

    bindEvent : function() {
        var me = this;
        $( window ).on( 'scroll load', function( e ) {
            if( $( window ).scrollTop() - me.top >= me.dis ) {
                me.fixed();
            } else {
                me.unfixed();
            }
        } );
    },

    fixed : function() {
        if( this.isfixed ) return;

        var w = this.el.outerWidth();

        this.dispatchEvent( 'fixedbefore' );
        this.el.css( 'position', 'fixed' ).css( 'z-index', 1000 ).css( 'top', this.dis ).css( 'width', w );
        this.createHelper();
        this.isfixed = true;
        this.dispatchEvent( 'fixed' );
    },

    unfixed : function() {
        if( !this.isfixed ) return;
        this.el.css( 'position', 'static' );
        this.helper.remove();
        this.isfixed = false;
        this.dispatchEvent( 'unfixed' );
    },

    createHelper : function() {
        this.helper = $( '<helper>' );
        this.helper.css( 'display', 'block' ).css( 'width', this.el.outerWidth() ).css( 'height', this.el.height() ).css( 'font-size', 0 );
        this.helper.insertAfter( this.el );
    }
} );

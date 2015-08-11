J.Package( {
    initialize : function( options ) {
        this.timeout = null;
        this.el = $( '.boxes.slides ul.slide-content' );
        this.list = this.el.find( '.slide' );
        this.navContainer = $( '.boxes.slides ul.slide-nav' );
        this.createNav();
        this.bindEvent();
        this.index = 0;
    },
    createNav : function() {
        var i = 0,
            l = this.list.length,
            node = null;

        for( ; i < l; i += 1 ) {
            node = $( '<li><b></b></li>' );
            i || node.addClass( 'focus' );
            this.navContainer.append( node );
        }
    },
    bindEvent : function() {
        var me = this;

        this.list.on( 'swipeLeft', function( e ) {
            me.swipe( 'left' );
        } ).on( 'swipeRight', function( e ) {
            me.swipe( 'right' );
        } ).on( 'touchmove', function( e ) {
            e.preventDefault();
        } );

    },
    swipe : function( duration ) {
        if( duration === 'right' ) {
            if( !this.index ) return false;
            this.scroll( this.index - 1 );
        } else {
            if( this.list.length - 1 == this.index ) return false;
            this.scroll( this.index + 1 );
        }
    },
    scroll : function( index ) {
        this.el.css( 'marginLeft', 0 - index * 100 + '%' );
        this.index = index;
        this.navContainer.find( 'li' ).removeClass( 'focus' ).eq( index ).addClass( 'focus' );
    },
    loop : function() {
        var me = this;

        this.timeout = setTimeout( function() {
            me.scroll( me.index === me.list.length - 1 ? 0 : me.index + 1 );
            me.loop();
        }, 3000 );
    }
} );

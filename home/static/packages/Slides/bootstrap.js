J.Package( {
    initialize : function() {
        this.current = 0;
        this.list = $( '.slide-list li' );
        this.navContainer = $( '.slide-nav' );
        this.nav = this.createNav();
        this.timeout = null;
        this.bindEvent().loop();
    },
    createNav : function() {
        var i = 0,
            l = this.list.length,
            html = '',
            node = null;
    
        for( ; i < l; i += 1 ) {
            html += '<li data-index="' + i + '"><a href="javascript:void(0)"></a></li>';
        }

        node = $( html );
        node.eq( 0 ).addClass( 'focus' );
        this.navContainer.append( node );
        return node;
    },
    loop : function() {
        var me = this;
        this.timeout = setTimeout( function() {
            me.to( me.current + 1 ).loop();
        }, 5000 );
    },
    to : function( i ) {
        if( i >= this.list.length ) {
            this.to( 0 );
            return this;
        }
        this.list.eq( this.current ).css( 'opacity', 0 ).css( 'z-index', 1 );
        this.current = i;
        this.list.eq( i ).css( 'opacity', 1 ).css( 'z-index', 100 );
        this.nav.removeClass( 'focus' ).eq(i).addClass( 'focus' );
        return this;
    },
    bindEvent : function() {
        var me = this;
        $( '.slide-list' ).on( 'mouseover', function( e ) {
            me.timeout && clearTimeout( me.timeout );
        } );

        $( '.slide-list' ).on( 'mouseout', function( e ) {
            me.loop();
        } );

        this.nav.on( 'mouseover', function( e ) {
            var i = $( this ).attr( 'data-index' );
            me.to( i );
        } );
        return this;
    }
} );

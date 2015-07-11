J.Package( {
    initialize : function() {
        this.bindEvent();

        this.timeout = null;
        this.scrollInterval = null;

        this.eventsListTpl = $( '#events-list-tpl' ).val();
        this.eventContentTpl = $( '#event-content-tpl' ).val();

        this._currentEvent = 0;

        this._events = null;
    },
    renderEventsList : function( data ) {
        var compiled = J.template( this.eventsListTpl ),
            html = compiled( { data : data } );

        $( '.events' ).append( html );
    },
    renderEventContent : function( id ) {
        var compiled = J.template( this.eventContentTpl ),
            html = compiled( { data : this._events[ id ] } );

        console.log( this._events[id] );

        $( '.events' ).append( html );
    },

    formatData : function( data ) {
        var i = 0,
            l = data.length,
            result = {};

        for( ; i < l; i += 1 ) {
            result[ data[i].id ] = data[i];
        }

        return result;
    },
    bindEvent : function() {
        var me = this;
        $( '.show-events' ).on( 'click', function( e ) {
            e.preventDefault();

            var events = $( this ).attr( 'data-events-ids' );

            $( '.events' ).show();
            $( '.show-events' ).remove();

            $.ajax( {
                url : '/topic/interface/getevents',
                method : 'GET',
                data : {
                    events : events,
                    _t : +new Date
                }
            } ).done( function( response ) {
                var errno = +response.errno,
                    data = response.data;

                me.renderEventsList( data.events );
                $( '.events .loading' ).fadeOut();

                me._events = me.formatData( data.events );
                
            } );
        } );

        $( '.events' ).on( 'click', '.events-nav', function( e ) {
            var id = $( this ).attr( 'data-event-id' );

            $( '.events' ).find( '.event-content' ).remove();;
            me.renderEventContent( id );
        } );

        $( '.events' ).on( 'mouseover', '.events-nav', function( e ) {
            var id = $( this ).attr( 'data-event-id' ),
                pos = $( this ).position(),
                left = pos.left + $( this ).width() / 2 - 10,
                tip = $( '.events-tip' );


            if( left < 0 ) {
                left = 0;
            } else if( left > parseInt( tip.width() ) ) {
                left = parseInt( tip.width() );
            } 
            me.timeout && clearTimeout( me.timeout ); 
            tip.show();
            tip.find( '.text' ).html( me._events[id].tip );
            tip.find( '> .triangle' ).css( 'left', left );

        } );
        $( '.events' ).on( 'mouseout', '.events-nav', function( e ) {
            me.timeout = setTimeout( function() {
                $( '.events-tip' ).hide();
            }, 200 );
        } );

        $( '.scroll' ).on( 'mousedown', function( e ) {
            var direction = $( this ).attr( 'data-direction' );

            me.startScroll( direction );
        } );

        $( '.scroll' ).on( 'mouseup', function( e ) {
            me.stopScroll();
        } );
    },
    startScroll : function( direction ) {
        var me = this,
            box = $( '.list-box' ),
            list = box.find( '> ul' ),
            w = list.width(),
            d = w - parseInt( box.width() );

        this.scrollInterval = setInterval( function() {
            var left = parseInt( box.scrollLeft() );
            if( ( direction == 'right' && left == d ) || ( direction == 'left' && left == 0 ) ) {
                clearInterval( me.scrollInterval );
                return false;
            }

            left = direction == 'right' ? left + 10 : left - 10;

            if( left < 0 ) {
                left = 0;
            } else if( left > d ) {
                left = d;
            }

            console.log( 'left', left, w );
            box.scrollLeft( left );
            
        }, 30 );
    },

    stopScroll : function() {
        this.scrollInterval && clearInterval( this.scrollInterval );
    }
} );

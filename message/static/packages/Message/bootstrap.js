J.Package( {
    initialize : function( options ) {
        this.bindEvent();
    },
    bindEvent : function() {
        var me = this;
        $( '.open' ).on( 'click', function( e ) {
            var messageEl = me.getMessageEl( $( this ) );
            messageEl.find( '.content' ).show();

            if( messageEl.attr( 'data-read' ) == 0 ) {
                messageEl.attr( 'data-read', 1 );
                me.setRead( messageEl.attr( 'data-message-id' ) );
                setTimeout( function() {
                    messageEl.find( '.flag' ).remove();
                }, 1000 );
            }
        } );

        $( '.remove' ).on( 'click', function( e ) {
            var messageEl = me.getMessageEl( $( this ) );

            me.removeMessage( messageEl.attr( 'data-message-id' ) );

        } );

    },
    getMessageEl : function( el ) {
        return el.closest( 'li.message-item' );
    },
    setRead : function( id ) {
        $.ajax( {
            url : '/message/interface/read',
            method : 'POST',
            data : {
                id : id
            }
        } );
    },
    removeMessage : function( id ) {
        $.ajax( {
            url : '/message/interface/remove',
            method : 'POST',
            data : {
                id : id
            }
        } ).done( function( response ) {
            $( '#message-' + id ).remove();
        } );
    }
} );

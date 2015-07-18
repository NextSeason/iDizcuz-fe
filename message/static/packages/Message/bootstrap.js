J.Package( {
    initialize : function( options ) {
        this.accountCompiledTpl = J.template( $( '#account-tpl' ).val() );
        this.bindEvent();
    },
    bindEvent : function() {
        var me = this;
        $( '.open' ).on( 'click', function( e ) {
            e.preventDefault();
            var messageEl = me.getMessageEl( $( this ) ),
                messageId = messageEl.attr( 'data-msg-id' ),
                type = messageEl.attr( 'data-msg-type' ),
                account_id;

            if( type == 7 ) {
                account_id = $.trim( messageEl.find( '.content' ).html() );
                me.getAccount( account_id, messageId );

            } else {
                messageEl.find( '.content' ).show();
            }

            if( messageEl.attr( 'data-read' ) == 0 ) {
                messageEl.attr( 'data-read', 1 );
                me.setRead( messageId );
                setTimeout( function() {
                    messageEl.find( '.flag' ).remove();
                }, 500 );
            }
        } );

        $( '.remove' ).on( 'click', function( e ) {
            e.preventDefault();
            var messageEl = me.getMessageEl( $( this ) );
            me.removeMessage( messageEl.attr( 'data-msg-id' ) );
        } );

    },
    getAccount : function( account_id, messageId ) {
        var me = this;
        $.ajax( {
            url : '/account/interface/getaccount',
            method : 'GET',
            data : {
                account_id : account_id,
                _t : +new Date
            }
        } ).done( function( response ){
            var errno = +response.errno;

            if( !errno ) {
                me.renderAccount( messageId, response.data.target_account );
            }
        } );
    },

    renderAccount : function( messageId, data ) {
        var html = this.accountCompiledTpl( { data : data } );
        $( '#message-' + messageId ).find( '.content' ).html( html ).show();
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

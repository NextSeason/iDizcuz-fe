J.Package( {
    initialize : function( options ) {
        this.accountCompiledTpl = J.template( $( '#account-tpl' ).val() );
        this.msgType = options.type || 0;
        this.bindEvent();
        this.cursor = 0;
        this.compiledTpl = J.template( $( '#message-list-tpl' ).val() );
        this.loading = false;
        this.load();
    },

    load : function() {
        var me = this,
            data = {
                type : this.msgType,
                cursor : this.cursor,
                _t : +new Date
            };

        this.loading = true 

        $.ajax( {
            url : 'message/interface/getmessages',
            data : data
        } ).done( function( response ) {
            var errno = +response.errno,
                messages,
                l;

            me.loading = false;

            if( !errno ) {
                messages = response.data.messages;
                l = messages.length;
                if( l < 20 ) {
                    $( '.load-more' ).hide();
                } else {
                    $( '.load-more' ).show();
                }
                if( l ) {
                    me.cursor = messages[ l - 1 ].id;
                }
                me.render( response.data.messages );
            }
        } ).fail( function() {
            me.loading = false;
        } );
    },
    render : function( data ) {
        var html = this.compiledTpl( { data : data } );
        $( '.message-list' ).append( html );
    },

    bindEvent : function() {
        var me = this;
        $( '.message-list' ).on( 'click', '.open', function( e ) {
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

        $( '.message-list' ).on( 'click', '.remove', function( e ) {
            e.preventDefault();
            var messageEl = me.getMessageEl( $( this ) );
            me.removeMessage( messageEl.attr( 'data-msg-id' ) );
        } );
        $( '.load-more' ).on( 'click', function() {
            me.loading || me.load();
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
                id : id,
                'csrf-token' : $.cookie( 'CSRF-TOKEN' )
            }
        } );
    },
    removeMessage : function( id ) {
        $.ajax( {
            url : '/message/interface/remove',
            method : 'POST',
            data : {
                id : id,
                'csrf-token' : $.cookie( 'CSRF-TOKEN' )
            }
        } ).done( function( response ) {
            $( '#message-' + id ).remove();
        } );
    }
} );

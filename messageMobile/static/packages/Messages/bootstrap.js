J.Package( {
    initialize : function( options ) {
        this.accountCompiledTpl = J.template( $( '#account-tpl' ).val() );
        this.compiledTpl = J.template( $( '#message-list-tpl' ).val() );
        this.accountId = options.accountId;
        this.loading = false;
        this.load();
        this.bindEvent();
    },
    load : function() {
        var me = this;

        this.loading = true;

        $.ajax( {
            url : '/message/interface/getmessages',
            data : {
                _t : +new Date
            },
            success : function( response ) {
                var errno = +response.errno;

                this.loading = false;
                if( !errno ) {
                    me.render( response.data.messages );
                }

            },
            error : function() {
                this.loading = false;
            }
        } );
    },
    render : function( data ) {
        var html = this.compiledTpl( { data : data } );
        $( '.message-list' ).append( html );
    },
    bindEvent : function() {
        var me = this;
        $( '.message-list' ).on( 'click', '.messages', function( e ) {
            e.preventDefault();
            var el = $( this ),
                type = $( this ).attr( 'data-msg-type' ),
                id = $( this ).attr( 'data-msg-id' ),
                accountId;

            if( type == 7 ) {
                accountId = $.trim( $( this ).find( '.content' ).html() );
                me.getAccount( accountId, $( this ) );
            } else {
                $( this ).find( '.content' ).show();
            }

            if( $( this ).attr( 'data-read' ) == 0 ) {
                $( this ).attr( 'data-read', 1 );
                me.setRead( id );
                setTimeout( function() {
                    el.find( '.flag' ).remove();
                }, 200 );
            }
        } );
    },

    setRead : function( id ) {
        $.ajax( {
            url : '/message/interface/read',
            type : 'POST',
            data : {
                id : id,
                'csrf-token' : $.fn.cookie( 'CSRF-TOKEN' )
            }
        } );
    },
    getAccount : function( accountId, el ) {
        var me = this;

        $.ajax( {
            url : '/account/interface/getaccount',
            data : {
                account_id : accountId,
                _t : +new Date
            },
            success : function( response ) {
                var errno = +response.errno;

                if( !errno ) {
                    me.renderAccount( el, response.data.user );
                }
            },
            error : function() {
            }
        } );
    },
    renderAccount : function( el, data ) {
        var html = this.accountCompiledTpl( { card : data } );
        el.find( '.content' ).html( html ).show();
    },
    getMessageEl : function( el ) {
        return el.closest( '.messages' );
    }
} );

J.Package( {
    initialize : function( options ) {
        this.bindEvent();
        this.cursor = 0;
        this.compiledTpl = J.template( $( '#message-list-tpl' ).val() );
        this.loading = false;
        this.load();
    },

    load : function() {
        var me = this,
            data = {
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
        $( '.load-more' ).on( 'click', function() {
            me.loading || me.load();
        } );
    }
} );

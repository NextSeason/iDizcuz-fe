J.Package( {
    initialize : function( options ) {
        this.compiledTpl = J.template( $( '#message-list-tpl' ).val() );
        this.cursor  = 0;
        this.rn = 20;
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
                rn : this.rn,
                cursor : this.cursor,
                _t : +new Date
            },
            success : function( response ) {
                var errno = +response.errno,
                    messages, l;

                me.loading = false;

                if( !errno ) {
                    l = ( messages = response.data.messages ).length;
                    l < me.rn ? $( '.load-more' ).hide() : $( '.load-more' ).show();
                    l && ( me.cursor = messages[ l - 1 ].id );
                    me.render( response.data.messages );
                }
            },
            error : function() {
                me.loading = false;
            }
        } );
    },
    render : function( data ) {
        var html = this.compiledTpl( { data : data } );
        $( '.message-list' ).append( html );
    },
    bindEvent : function() {
        var me = this;

        $( '.load-more' ).on( 'click', function( e ) {
            e.preventDefault();
            me.load();
        } );
    }
} );

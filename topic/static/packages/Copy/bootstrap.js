J.Package( {
    initialize : function( options ) {
        this.bindEvent();
        this.helper = $( '#copy-btn' );
        this.data;
        this.createClient();
    },

    bindEvent : function() {
        var me = this;
        $( '.topic-area' ).on( 'mouseenter', '.copy-link', function( e ) {
            var pos = $( this ).offset(),
                link = $( this ).parent().find( '.link' ),
                href = link.attr( 'href' ),
                title = link.attr( 'data-title' );

            me.data = title + ' - 每日论点•iDizcuz' + "\n" + href; 

            me.helper.css( 'left', pos.left ).css( 'top', pos.top );
        } );

        $( '.topic-area' ).on( 'mouseout', '.copy-link', function( e ) {
            me.helper.css( 'left', -999 ).css( 'top', -999 );
        } );
    },

    createClient : function() {
        var me = this;
        var client = new ZeroClipboard( $( '#copy-btn' ) );

        client.on( "ready", function( readyEvent ) {
            client.on( "copy", function( e ) {
                var clipboard = e.clipboardData;
                clipboard.setData( 'text/plain', me.data );
            } );
        } );
    }
} );

J.Package( {
    initialize : function( options ) {
        this.container = options.container || $( '#idizcuz' );
        this.bindEvent();
        this.helper = $( '#copy-btn' );
        this.data;
        this.client = null;
        this.ZeroClipboardContainerId = 'zeroclipboard-html-bridge-' + J.guid();
        this.createClient();
    },

    bindEvent : function() {
        var me = this;
        this.container.on( 'mouseenter', '.copy-link', function( e ) {
            var pos = $( this ).offset(),
                link = $( this ).parent().find( '.link' ),
                href = link.attr( 'href' ),
                title = link.attr( 'data-title' );

            me.data = title + ' - 每日论点•iDizcuz' + "\n" + href; 
            me.helper.css( 'left', pos.left ).css( 'top', pos.top );
        } );
    },

    createClient : function() {
        var me = this;
        this.client = new ZeroClipboard( $( '#copy-btn' ) );

        this.client.on( "ready", function( readyEvent ) {
            me.client.on( "copy", function( e ) {
                var clipboard = e.clipboardData;
                clipboard.setData( 'text/plain', me.data );
                setTimeout( function() {
                    /**
                     * move the helper button out the viewport
                     */
                    me.helper.css( 'left', -999 ).css( 'top', -999 );

                    /**
                     * move the zeroclipboard bridge element(swf) out the viewport
                     * to fix the bug if user click the copy button two times, the page will scroll to top
                     */
                    $( '#' + me.ZeroClipboardContainerId ).css( 'left', -999 ).css( 'top', -999 );
                }, 100 );
            } );
        } );
    }
} );

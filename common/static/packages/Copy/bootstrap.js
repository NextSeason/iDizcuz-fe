J.Package( {
    initialize : function( options ) {
        this.container = options.container || $( '#idizcuz' );
        this.createHelper();
        this.createTip();
        this.bindEvent();
        this.target = null;
        this.data;
        this.client = null;
        this.ZeroClipboardContainerId = 'zeroclipboard-html-bridge-' + J.guid();
        this.createClient();
    },

    createTip : function() {
        this.tip = $( [
            '<div class="bubbles small right">',
                '<div class="triangle"><div class="triangle"></div></div>',
                '<div class="inner"><p class="text">复制成功</p></div>',
            '</div>'
        ].join( '' ) );

        this.tip.css( 'position' , 'absolute' );
        this.hideTip();
        $( document.body ).append( this.tip );
    },

    createHelper : function() {
        var helper = $( '<a href="javascript:void(0)" class="btns">复制链接</a>' );
        helper.css( 'position', 'absolute' ).css( 'top', -999 ).css( 'left', -999 ).css( 'outline', 0 ).css( 'opacity', 0 );
        $( 'body' ).append( helper );
        this.helper = helper;
    },

    bindEvent : function() {
        var me = this;
        this.container.on( 'mouseenter', '.copy-link', function( e ) {
            me.target = e.target;

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

        ZeroClipboard.config( {
            containerId : this.ZeroClipboardContainerId
        } );

        this.client = new ZeroClipboard( this.helper );

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

                me.showTip();
            } );
        } );
    },
    showTip : function() {
        if( !this.target ) return false;
        var me = this,
            position = $( this.target ).offset(),
            w = $( this.target ).width();
        this.tip.css( 'top', position.top ).css( 'left', position.left + w + 15 );

        setTimeout( function() {
            me.hideTip();
        }, 1000 );
    },

    hideTip : function() {
        this.tip.css( 'left', -999 ).css( 'top', -999 );
    }
} );

J.Package( {
    initialize : function() {
        this.container = this.container || $( '#idizcuz' );
        this.el = this.el || this.createDom();
        this.currentConfig = null;
        this.bindEvent();

        this.defaultConf = {
            title : encodeURIComponent( '每日论点 • iDizcuz -- 做理性且有思想的人' ),
            desc : '每日论点 • iDizcuz -- 做理性且有思想的人',
            img : location.host + '/static/common/images/id2.png',
            url : encodeURIComponent( location.href )
        };
    },
    urls : {
        weibo : 'http://service.weibo.com/share/share.php?url={#url}&appkey=&title={#title}&pic={#img}&language=zh_cn',
        qzone : 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url={#url}&title={#title}&desc={#desc}&summary{#desc}=&site=',
        renren : 'http://widget.renren.com/dialog/share?resourceUrl={#url}&srcUrl={#url}&title={#title}&description={#desc}'
    },
    createDom : function() {
        var el = $( [
            '<div class="boxes share-box">',
                '<p class="title"></p>',
                '<ul class="clearfix">',
                    '<li><a href="###" class="share-btn weibo" data-dest="weibo"><i class="fa fa-weibo"></i></a></li>',
                    '<li><a href="###" class="share-btn qzone" data-dest="qzone"><i class="fa fa-qq"></i></a></li>',
                    '<li><a href="###" class="share-btn renren" data-dest="renren"><i class="fa fa-renren"></i></a></li>',
                '</ul>',
            '</div>'
        ].join( '' ) );

        this.container.append( el );
        return el;
    },
    bindEvent : function() {
        var me = this;
        $( document ).on( 'touchstart', function( e ) {
            var target = e.target;
            if( !$.contains( me.el.get(0), e.target ) ) {
                me.hide();
            }
        } );

        this.el.find( '.share-btn' ).on( 'click', function( e ) {
            e.preventDefault();
            me.share( $( this ).attr( 'data-dest' ) );
        } );

        this.container.on( 'click', '.call-sharebox', function( e ) {
            e.preventDefault();
            me.getConfig( $( this ) );
            me.show();
        } );

    },
    share : function( dest ) {
        if( !J.isUndefined( this.urls[ dest ] ) ) {
            window.open( J.formatString( this.urls[ dest ], this.currentConfig ) );
        }
    },
    getConfig : function( el ) {
        var config = J.extend( {}, this.defaultConf ),
            matches,
            attrs = el.get( 0 ).attributes,
            i = 0,
            l = attrs.length;

        for( ; i < l; i += 1 ) {
            if( matches = attrs[i].name.match( /^data-share-([\w\d-_]+)/ ) ) {
                config[ matches[1] ] = attrs[i].value;
            }
        }

        return ( this.currentConfig = config );

    },
    hide : function() {
        this.el.css( 'bottom', '-999px' );
    },
    show : function() {
        this.el.find( '.title' ).html( '分享：' + this.currentConfig.title );
        this.el.css( 'bottom', 0 );
    }
} );

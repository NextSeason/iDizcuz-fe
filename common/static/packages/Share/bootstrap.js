J.Package( {
    initialize : function( options ) {
        this.bindEvent();

        this.defaultConf = {
            title : encodeURIComponent( '每日论点•iDizcuz -- 做理性且有思想的人' ),
            desc : '每日论点•iDizcuz -- 做理性且有思想的人',
            img : location.host + '/static/common/images/id0.png',
            url : encodeURIComponent( location.href )
        };

    },
    urls : {
        qzone : 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url={#url}&title={#title}&desc={#desc}&summary=&site={#site}',
        weibo : 'http://service.weibo.com/share/share.php?url={#url}&title={#title}&searchPic=true',
        renren : 'http://widget.renren.com/dialog/share?resourceUrl={#url}&srcUrl={#url}&title={#title}&description={#desc}',
        tx_weibo : 'http://share.v.t.qq.com/index.php?c=share&a=index&url={#url}&title={#title}',
        facebook : 'https://www.facebook.com/sharer/sharer.php?u={#url}&t={#title}&pic={#img}',
        twitter : 'https://twitter.com/intent/tweet?text={#title}&pic={#img}'
    },
    bindEvent : function() {
        var me = this;

        $( document ).on( 'click', '.share-btns', function( e ) {
            var dest = $( this ).attr( 'data-dest' );
            dest && me.share( dest, me.getConfig( $( this ) ) );
        } );
    },
    share : function( dest, config ) {
        if( !J.isUndefined( this.urls[ dest ] ) ) {
            window.open( J.formatString( this.urls[ dest ], config ) );
        }
    },
    getConfig : function( el ) {
        var config = J.extend( {}, this.defaultConf ),
            box = el.closest( '.share-box' ),
            matches,
            attrs,
            i = 0,
            l;

        if( !box.length ) return config;

        attrs = box.get(0).attributes;

        for( l = attrs.length; i < l; i += 1 ) {
            if( matches = attrs[i].name.match( /^data-share-([\w\d-_]+)/ ) ) {
                config[ matches[1] ] = encodeURIComponent( attrs[i].value );
            }
        }

        return config;
    }
} );

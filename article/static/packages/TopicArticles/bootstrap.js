J.Package( {
    initialize : function( options ) {
        this.pn = 1;
        this.rn = 20;
        this.loading = false;
        this.compiledTpl = J.template( $( '#article-list-tpl' ).val() );
        this.load();
        this.bindEvent();
    },

    load : function() {
        var me = this;
        this.loading = true;

        $( '.load-more' ).css( 'display', 'block' ).html( '正在加载...' );

        $.ajax( {
            url : '/article/interface/topicarticles',
            data : {
                topic_id : this.topic_id,
                pn : this.pn,
                rn : this.rn
            }
        } ).done( function( response ) {
            var errno = +response.errno;

            me.loading = false;

            if( !errno ) {
                $( '.load-more' ).html( '加载失败 刷新页面或点击重试' );
                me.render( response.data.articles );
                return;
            }

        } ).fail( function() {
            $( '.load-more' ).html( '加载失败 刷新页面或点击重试' );
            me.loading = false;
        } );
    },
    render : function( data ) {
        var html = this.compiledTpl( { data : data } );
        $( '.article-list' ).append( html );

        if( data.length < 40 ) {
            $( '.load-more' ).hide();
        } else {
            $( '.load-more' ).html( '加载更多' );
        }
    },
    bindEvent : function() {
        var me = this;
        $( '.load-more' ).on( 'click', function( e ) {
            e.preventDefault();
            me.pn++;
            me.load();
        } );
    }
} );

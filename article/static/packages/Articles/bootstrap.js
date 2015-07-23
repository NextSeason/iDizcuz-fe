J.Package( {
    initialize : function( options ) {
        this.cursor = 0;
        this.rn = 20;
        this.topic_id = options.topic_id;

        this.compiledTpl = J.template( $( '#article-tpl' ).val() );
        this.load();
    },

    load : function() {
        var me = this;
        $.ajax( {
            url : '/article/interface/getarticles',
            data : {
                cursor : this.cursor,
                topic_id : this.topic_id,
                rn : this.rn
            }
        } ).done( function( response ) {
            var errno = +response.errno;

            if( !errno ) {
                var html = me.compiledTpl( { data : response.data.articles } );
                $( '.article-list' ).append( html );
            }

            $( '.loading' ).hide();
        } );
    },
    bindEvent : function() {
    }
} );

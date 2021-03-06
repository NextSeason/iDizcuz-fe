J.Package( {
    initialize : function( option ) {
        this.cursor = 0;
        this.rn = 20;
        this.compiledTpl = J.template( $( '#topic-list-tpl' ).val() );
        this.loading = false;
        this.load();
        this.bindEvent();
    },
    bindEvent : function() {
        var me = this;
        $( '.load-more' ).on( 'click', function( e ) {
            e.preventDefault();
            me.load();
        } );
    },
    load : function() {
        var me = this;

        this.loading = true;

        $.ajax( {
            url : '/topic/interface/list',
            data : {
                cursor : this.cursor,
                rn : this.rn,
                cid : this.cid,
                _t : +new Date
            } 
        } ).done( function( response ) {
            var errno = +response.errno,
                topics, l;

            me.loading = false;
                
            if( !errno ) {
                l = ( topics = response.data.topics ).length;
                l < me.rn ? $( '.load-more' ).hide() : $( '.load-more' ).show();
                l && ( me.cursor = topics[ l - 1 ].id );
                me.render( response.data.topics );
            }
        } ).fail( function() {
            me.loading = false;
        } );
    },
    render : function( data ) {
        var html = this.compiledTpl( { data : data } );
        $( '.topic-list' ).append( html );
    }
} );

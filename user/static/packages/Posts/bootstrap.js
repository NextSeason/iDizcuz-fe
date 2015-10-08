J.Package( {
    initialize : function( options ) {
        this.userId = options.userId;
        this.compiledTpl = J.template( $( '#post-list-tpl' ).val() );
        this.rn = 20;
        this.url = options.url;
        this.bindEvent();
        this.cursor = 0;
        this.loading = false;
        this.load();
    },

    load : function() {
        var me = this;
        this.loading = true;

        $.ajax( {
            url : this.url,
            data : {
                account_id : this.userId,
                cursor : this.cursor,
                rn : this.rn,
                _t : +new Date 
            }
        } ).done( function( response ) {
            var errno = +response.errno,
                posts;

            me.loading = false;
            if( !errno ) {
                posts = response.data.posts;
                posts.length && ( me.cursor = posts[ posts.length - 1 ].id );
                me.render( posts );
                $( '.loading' ).hide();
            }
        } );
        $( '.loading' ).show();
    },

    render : function( posts ) {
        var html = this.compiledTpl( { data : posts } );
        $( '.post-list' ).append( html );
        if( posts.length < this.rn ) {
            $( '.load-more' ).hide();
        } else {
            $( '.load-more' ).css( 'display', 'block' );
        }
    },

    bindEvent : function() {
        var me = this;
        $( '.load-more' ).on( 'click', function( e ) {
            e.preventDefault();
            if( me.loading ) return false;
            me.load();
        } );
    }
} );

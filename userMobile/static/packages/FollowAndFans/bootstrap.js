J.Package( {
    initialize : function( options ) {
        this.page = options.page;
        this.container = options.container || $( '#idizcuz' );
        this.loading = false;
        this.userId = options.userId;
        this.compiledTpl = J.template( $( '#account-list-tpl' ).val() );
        this.bindEvent();
        this.rn = 20;
        this.cursor = 0;
        this.load();
    },
    bindEvent : function() {
        var me = this;
        $( '.load-more' ).on( 'click', function( e ) {
            e.preventDefault();
            if( me.loading ) return false;
            me.load();
        } );
    },
    load : function() {
        var me = this;

        this.loading = true;
        $.ajax( {
            url : '/user/interface/' + ( this.page == 'follow' ? 'getfollows' : 'getfans' ),
            data : {
                account_id : this.userId,
                cursor : this.cursor,
                rn : this.rn,
                _t : +new Date
            },
            success : function( response ) {
                var errno = +response.errno;

                this.loading = false;
                if( !errno ) {
                    me.render( response.data.accounts );
                    return ;
                }
            },
            error : function() {
                this.loading = false;
            }
        } );
    },
    render : function( data ) {
        var html = this.compiledTpl( { data : data } ),
            l = data.length;

        if( l ) {
            this.cursor = data[ l - 1 ].id
        }
        $( '.account-list' ).append( html );

        l < this.rn ? $( '.load-more' ).hide() : $( '.load-more' ).show();
    }
} );

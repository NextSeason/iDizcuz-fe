J.Package( {
    initialize : function( options ) {
        this.compiledTpl = J.template( $( '#post-list-tpl' ).val() );
        this.account = $( '#idizcuz' ).attr( 'data-account-id' );
        this.paginationCompiledTpl = J.template( $( '#post-pagination-tpl' ).val() );
        this.rn = 20;

        this.url = options.url;

        this.bindEvent();
        this.load( 1 );
    },
    load : function( pn ) {
        var me = this,
            rn = 20,
            start = ( pn - 1 ) * rn;

        var data = {
            account : this.account,
            start : start,
            rn : rn,
            _t : +new Date
        };

        $( '.post-list' ).html('');
        $( '.loading' ).show();

        $.ajax( {
            url : this.url,
            data : data
        } ).done( function( response ) {
            var errno = +response.errno;

            $( '.loading.list-top' ).fadeOut( 'slow' );

            if( errno ) return false;

            var posts = me.formatData( response.data.posts );
            me.render( posts );
            $( '.loading' ).hide();
            me.renderPagination( pn, response.data.total );
        } );
    },

    renderPagination : function( pn, total ) {
        var totalPage = Math.ceil( total / this.rn ),
            i, list = [];

        if( totalPage == 1 ) return;

        var first = pn - 5,
            last = first + 9;

        if( first < 1 ) {
            last = Math.min( ( 1 - first ) + last, totalPage );
            first = 1;
        } else if( last > totalPage ) {
            first = Math.max( 1, first - ( last - totalPage ) );
            last = totalPage;
        }

        for( i = first; i <= last; i += 1 ) {
            list.push( { pn : i } );
        }

        var data = {
            current : pn,
            list : list,
            total : totalPage
        };

        var html = this.paginationCompiledTpl( { data : data } );

        $( '#list-pagination' ).html( html ).show();
    },

    formatData : function( data ) {
        var i = 0,
            l = data.length;

        for( ; i < l; i += 1 ) {
            data[ i ].ctime = data[ i ].ctime.replace( /\s+[:\d]+/, '' );
            data[ i ].mtime = data[ i ].mtime.replace( /\s+[:\d]+/, '' );
        }

        return data;
    },

    render : function( posts ) {
        var html = this.compiledTpl( { data : posts } );
        $( '.post-list' ).html( html );
        window.scrollTo( 0, 0 );
    },

    bindEvent : function() {
        var me = this;

        $( '#list-pagination' ).on( 'click', 'a', function( e ) {
            e.preventDefault();
            me.load( $( this ).attr( 'data-pn' ) );
            window.scroll( 0, $( '.list-area' ).position().top );
        } );
    }
} );

J.Package( {
    initialize : function( options ) {
        this.compiledTpl = J.template( $( '#account-list-tpl' ).val() );
        this.account = $( '#idizcuz' ).attr( 'data-account-id' );
        this.paginationCompiledTpl = J.template( $( '#post-pagination-tpl' ).val() );
        this.bindEvent();

        this.url = ({
            follow : '/user/interface/getfollows',
            fans : '/user/interface/getfans'
        })[ options.page ];

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

        $( '.account-list' ).html('');
        $( '.loading' ).show();

        $.ajax( {
            url : this.url,
            data : data
        } ).done( function( response ) {
            var errno = +response.errno;

            $( '.loading' ).fadeOut();

            if( errno ) return false;

            me.render( response.data.accounts );
            $( '.loading' ).hide();
            me.renderPagination( pn, response.data.total );
        } );
    },
    render : function( accounts ) {
        var html = this.compiledTpl( { data : accounts } );
        $( '.account-list' ).html( html );
        window.scrollTo( 0, 0 );
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
    bindEvent : function() {
    }
} );

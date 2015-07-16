J.Package( {
    initialize : function( options ) {
        this.compiledTpl = J.template( $( '#post-list-tpl' ).val() );

        this.page = $( 'ul.nav .focus' ).attr( 'data-page' );
        this.account = $( '#idizcuz' ).attr( 'data-account-id' );

        this.urls = {
            posts : '/user/interface/userposts',
            agree : '/user/interface/votedposts?opinion=1',
            disagree : '/user/interface/votedposts?opinion=0',
            mark : '/user/interface/markedposts',
            removed : '/user/interface/removedposts'
        };

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

        $.ajax( {
            url : this.urls[ this.page ],
            data : data
        } ).done( function( response ) {
            var errno = +response.errno;

            $( '.loading.list-top' ).fadeOut( 'slow' );

            if( errno ) return false;

            var posts = me.formatData( response.data.posts );
            me.render( posts );
            //me.render
        } );
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
        console.log( 'posts', posts );
        $( '.post-list' ).html( html );
    },

    bindEvent : function() {
    }
} );

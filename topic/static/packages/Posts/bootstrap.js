J.Package( {
    initialize : function( options ) {
        this.topic = $( '.topic-area' ).attr( 'data-topic-id' );
        this.compiledTpl = J.template( $( '#post-list-tpl' ).val() );
        this.paginationCompiledTpl = J.template( $( '#post-pagination-tpl' ).val() );

        this.list = [];
        this.order = 0;
        this.status = 0;
        this.index = 0;
        this.rn = 100;
        this.slice = 10;
        this.pn = 1;
        this.total = 0;

        this.bindEvent();
        this.getlist( 1 );
    },

    getlist : function( pn ) {
        var me = this,
            order = this.order,
            start = ( pn - 1 ) * this.rn;

        this.pn = pn;

        $( '#post-pagination' ).hide();
        $( '.post-list' ).html( '' );

        $( '.loading.list-bottom' ).show();

        $.ajax( {
            url : '/topic/interface/getposts',
            method : 'GET',
            data : {
                topic : this.topic,
                order : order,
                start : start,
                rn  : this.rn
            }
        } ).done( function( response ) {
            var errno = +response.errno;

            if( errno > 0 ) {
            }

            me.list = response.data.posts;

            if( !me.list.length ) {
                me.render([]);
                $( '.loading' ).hide();
                return;
            }

            me.index = 0;
            me.status = 0;
            me.total = response.data.total;

            me.load();
        } );
    },

    load : function() {
        var me = this;
        this.status = 1;

        if( !this.list.length ) return;

        $.ajax( {
            url : '/topic/interface/postlist',
            method : 'GET',
            data : {
                ids : this.list.slice( this.index, this.index + this.slice ).join( ',' )
            }
        } ).done( function( response ) {
            var errno = +response.errno;

            if( errno ) return false;

            me.render( me.formatData( response.data.posts ) );
            me.index += me.slice;

            if( me.index >= me.list.length ) {
                $( '.loading.list-bottom' ).hide();
                me.renderPagination();
            }
            me.status = 0;
        } );
    },

    renderPagination : function() {
        var totalPage = Math.ceil( this.total / this.rn ),
            i,
            list = [];

        if( totalPage == 1 ) return;

        var first = this.pn - 5,
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
            current : this.pn,
            list : list,
            total : totalPage
        };

        var html = this.paginationCompiledTpl( { data : data } );

        $( '#post-pagination' ).html( html ).show();
    },

    formatData : function( data ) {
        var i = 0,
            l = data.length;

        for( ; i < l; i += 1 ) {
            data[ i ].ctime = data[ i ].ctime.replace( /\s+[:\d]+/, '' );
            data[ i ].mtime = data[ i ].mtime.replace( /\s+[:\d]+/, '' );
            if( $( '#post-' + data[i].id ).length ) {
                data[ i ].hide = true;
            }
        }

        return data;
    },

    render : function( posts ) {
        var html = this.compiledTpl( { data : posts } );
        $( '.post-list' ).append( html );
    },

    bindEvent : function() {
        var me = this;
        $( '.topic-area .sort' ).on( 'click', function( e ) {
            e.preventDefault();

            me.order = $( this ).attr( 'data-order' );

            $( '.list-area .sort' ).removeClass( 'focus' );
            $( this ).addClass( 'focus' );

            me.getlist( 1 );
        } );

        $( window ).on( 'scroll', function() {
            var top;

            if( me.index >= me.list.length ) return;
            
            top = $( '.loading.list-bottom' ).position().top;

            if( me.status == 1 ) return;

            if( top - $( window ).scrollTop() < 1000 ) {
                me.load();
            }
        } );

        $( '#post-pagination' ).on( 'click', 'a', function( e ) {
            e.preventDefault();
            me.getlist( $( this ).attr( 'data-pn' ) );
            window.scroll( 0, $( '.list-area' ).position().top );
        } );
    }
    
} );

J.Package( {
    initialize : function( options ) {
        this.topic = options.topic;
        this.compiledTpl = J.template( $( '#post-list-tpl' ).val() );
        this.paginationCompiledTpl = J.template( $( '#pagination-tpl' ).val() );
        this.points = this.formatePoints( options.points );

        // list used to store posts id
        this.list = [];

        // orderby
        this.order = 0;

        this.loading = false;

        this.index = 0;
        
        // how many posts been displayed in one time
        this.slice = 1;

        this.rn = 2;

        this.pn = 1;

        this.bindEvent();

        this.getlist( 1 );
    },
    getlist : function( pn ) {
        var me = this,
            order = this.order,
            point_id = this.focusPoint,
            start = ( pn - 1 ) * this.rn;

        this.pn = pn;

        $( '.pagination' ).hide();
        $( '.post-list' ).html( '' );

        $.ajax( {
            url : '/topic/interface/getposts',
            data : {
                topic : this.topic,
                point : point_id,
                order : order,
                start : start,
                rn : this.rn
            },
            success : function( response ) {
                var errno = +response.errno;

                if( !errno ) {
                    me.list = response.data.posts;

                    if( !me.list.length ) {
                        me.render( [] );
                        $( '.loading' ).hide();
                    }

                    me.index = 0;
                    me.loading = false;
                    me.total = response.data.total;

                    me.load();
                    return;
                }
            },
            error : function() {
                me.loading = false;
            }
        } );
    },
    load : function() {
        var me = this;
        this.loading = true;

        if( !this.list.length ) return;

        $.ajax( {
            url : '/topic/interface/postlist',
            data : {
                ids : this.list.slice( this.index, this.index + this.slice ).join( ',' )
            },
            success : function( response ) {
                var errno = +response.errno;

                me.loading = false;

                if( !errno ) {
                    me.index += me.slice;
                    me.render( me.formatData( response.data.posts ) );

                    if( me.index >= me.list.length ) {
                        $( '.loading' ).hide();
                        me.renderPagination();
                    }
                    return;
                }
            },
            error : function() {
                me.loading = false;
            }
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

        $( '.pagination' ).html( html ).show();
    },

    formatData : function( data ) {
        var i = 0,
            l = data.length;

        for( ; i < l; i += 1 ) {
            if( this.points ) {
                data[i].point = this.points[ data[i].point_id ];
            }
        }
        return data;
    },
    formatePoints : function( points ) {

        if( !points ) return null;
        var result = {},
            i = 0,
            l = points.length;

        for( ; i < l; i += 1 ) {
            result[ points[i].id ] = points[i];
        }
        return result;
    },
    render : function( data ) {
        var html = this.compiledTpl( { data : data } );
        $( '.post-list' ).append( html );
        if( this.index >= this.list.length ) {
            $( '.pagination' ).show();
        }
    },
    bindEvent : function() {
        var me = this;
        $( '.sort' ).on( 'click', function( e ) {
            e.preventDefault();

            me.order = $( this ).attr( 'data-order' );

            $( '.sort' ).removeClass( 'focus' );
            $( this ).addClass( 'focus' );

            me.getlist( 1 );
        } );

        $( window ).on( 'scroll', function() {
            var top;

            if( me.index >= me.list.length ) return;
            
            top = $( '.loading' ).position().top;

            if( me.loading ) return;

            if( top - $( window ).scrollTop() < 800 ) {
                me.load();
            }
        } );

    }
} );

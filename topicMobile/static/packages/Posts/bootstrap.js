J.Package( {
    initialize : function( options ) {
        this.topic = options.topic;
        this.compiledTpl = J.template( $( '#post-list-tpl' ).val() );

        // list used to store posts id
        this.list = [];

        // orderby
        this.order = 0;

        // to record the status of page 
        // if it is loading data , status = 1
        this.status = 0;

        this.index = 0;
        
        // how many posts been displayed in one time
        this.slice = 10;

        this.rn = 100;

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
                    me.status = 0;

                    if( this.rn == me.list.length ) {
                        //
                    }

                    me.load();
                    return;
                }
            },
            error : function() {
                this.status = 0;
            }
        } );
    },
    load : function() {
        var me = this;
        this.status = 1;

        if( !this.list.length ) return;

        $.ajax( {
            url : '/topic/interface/postlist',
            data : {
                ids : this.list.slice( this.index, this.index + this.slice ).join( ',' )
            },
            success : function( response ) {
                var errno = +response.errno;

                if( !errno ) {
                    me.render( response.data.posts );
                    me.index += me.slice;

                    if( me.index >= me.list.length ) {
                        // hide load more button and show next page button
                    }
                    return;
                }
            }
        } );
    },
    render : function( data ) {
        var html = this.compiledTpl( { data : data } );
        $( '.post-list' ).append( html );
    },
    bindEvent : function() {
        $( '.load-more' ).on( 'click', function( e ) {
        } );
    }
} );

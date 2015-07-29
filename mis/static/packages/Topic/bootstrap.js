J.Package( {
    initialize : function( options ) {
        this.bindEvent();
        if( $( 'select.type' ).val() == 1 ) {
            $( '.point-area' ).show();
        }
    },
    bindEvent : function() {
        var me = this;
        $( 'select.type' ).on( 'change', function() {
            if( $( this ).val() == 1 ) {
                $( '.point-area' ).show();
            } else {
                $( '.point-area' ).hide();
            }
        } );

        $( '.topic-form .save' ).on( 'click', function( e ) {
            e.preventDefault();
            me.submit();
        } );

        $( '.add-point' ).on( 'click', function( e ) {
            e.preventDefault();
            var el = $( '#point-dialog' );
            el.find( '.id' ).val( 0 );
            el.find( '.title' ).val( '' );
            el.find( '.desc' ).val( '' );

            el.show();
        } );

        $( '#point-dialog .cancel' ).on( 'click', function( e ) {
            e.preventDefault();
            $( '#point-dialog' ).hide();
        } );

        $( '.point-area' ).on( 'click', '.modify', function( e ) {
            e.preventDefault();
            var pointEl = $( this ).closest( 'li.points' ),
                id = pointEl.attr( 'data-point-id' ),
                title = pointEl.find( '.point-title' ).text(),
                desc = pointEl.find( '.point-desc' ).text(),
                el = $( '#point-dialog' );

            el.find( '.id' ).val( id );
            el.find( '.title' ).val( title );
            el.find( '.desc' ).val( desc );

            el.show();
            
        } );

        $( '#point-dialog .save' ).on( 'click', function( e ) {
            e.preventDefault();
            var el = $( '#point-dialog' ),
                id = +el.find( '.id' ).val(),
                title = $.trim( el.find( '.title' ).val() ),
                desc = $.trim( el.find( '.desc' ).val() );

            if( !title.length || !desc.length ) {
                return false;
            }

            $.ajax( {
                url : '/mis/interface/point',
                method : 'POST',
                data : {
                    id : id,
                    title : title,
                    desc : desc
                }
            } ).done( function( response ) {
                var errno = +response.errno;

                if( !errno ) {
                    me.renderPoint( {
                        id : id || response.data.point_id,
                        title : title,
                        desc : desc
                    } );
                    $( '#point-dialog' ).hide();
                }
            } );
        } );
    },
    renderPoint : function( data ) {
        var compiledTpl = J.template( $( '#point-tpl' ).val() ),
            el = $( '#point-' + data.id ),
            html = compiledTpl( { data : data } );

        if( el.length ) {
            el.replaceWith( html );
        } else {
            $( '.point-list' ).append( html );
        }
    },
    getPoints : function() {
        var els = $( '.point-list .points' ),
            i = 0,
            l = els.length,
            points = [];

        for( ; i < l ; i += 1 ) {
            points.push( els.eq( i ).attr( 'data-point-id' ) );
        }

        return points.join(',');
    },
    submit : function() {
        var trim = $.trim;
        var id = $( 'input.id' ).val(), 
            title = trim( $( 'input.title' ).val() ),
            desc = trim( $( 'textarea.desc' ).val() ),
            type = $( 'select.type' ).val(),
            cid = $( 'select.cid' ).val(),
            data = {};

        if( !title.length ) {
            alert( '填写标题' );
            return false;
        }

        if( title.length > 120 ) {
            alert( '标题过长' );
            return false;
        }

        if( !desc.length ) {
            alert( '填写话题介绍' );
            return false;
        }

        if( type == 1 ) {
            // if no points added into this topic, return false;
        }

        data = {
            id : id,
            title : title,
            desc : desc,
            type : type,
            cid : cid
        };

        if( type == 1 ) {
            data.points = this.getPoints();
        }

        $.ajax( {
            url : '/mis/interface/topic',
            method : 'POST',
            data : data
        } ).done( function( response ) {
            var errno = +response.errno;
            if( !errno ) {
                if( id != 0 ) {
                    alert( '话题更新成功' );
                } else {
                    alert( '话题添加成功' );
                    location.href = '/mis/page/topic?id=' + response.data.topic_id;
                }
            }
        } );
    }
} );

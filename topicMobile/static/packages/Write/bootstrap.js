J.Package( {
    initialize : function( options ) {
        this.needPoint = options.needPoint;
        this.topicId = options.topicId;
        this.submiting = false;
        this.dialog();
        this.bindEvent();
    },
    dialog : function() {
        this.dialog = $( [
            '<div class="dialog tip-dialog">',
                '<div class="wrap">',
                    '<div class="inner">',
                        '<p class="brand tip"></p>',
                    '</div>',
                '</div>',
            '</div>'
        ].join( '' ) );
        
        $( '#idizcuz' ).append( this.dialog );
    },
 
    bindEvent : function() {
        var me = this;
        $( '.select, .selected' ).on( 'click', function( e ) {
            e.preventDefault();
            me.showPoints();
        } );

        $( '.boxes.points' ).on( 'blur', function( e ) {
            me.hidePoints();
        } );

        $( '.boxes .done' ).on( 'click', function( e ) {
            e.preventDefault();
            me.hidePoints();
        } );

        $( '.boxes li.points' ).on( 'click', function( e ) {
            e.preventDefault();
            $( '.selected' ).html( $( this ).html() ).show();
            $( 'input.point_id' ).val( $( this ).attr( 'data-point-id' ) );
            me.hidePoints();
        } );

        $( 'textarea.content' ).on( 'blur', function( e ) {
            var title = $.trim( $( 'input.title' ).val() );

            if( !title.length ) {
                $( 'input.title' ).val( me.getTitle() );
            }
        } );

        $( '.boxes.to .remove' ).on( 'click', function( e ) {
            e.preventDefault();
            $( '.boxes.to' ).remove();
            $( 'input.to' ).val( 0 );
        } );

        window.onbeforeunload = function() {
            //return '确定放弃编辑离开页面？';
        }

        $( '.public' ).on( 'click', function( e ) {
            e.preventDefault();
            me.submit();
        } );

        $( 'img.imagecode' ).on( 'click', function( e ) {
            e.preventDefault();
            me.refreshImageCode();
        } );
    },

    refreshImageCode : function() {
        $( 'img.imagecode' ).attr( 'src', '/common/interface/imagecode?_t=' + (+new Date) );
    },

    submit : function() {
        var me = this;
        var trim = $.trim,
            title = trim( $( 'input.title' ).val() ),
            content = trim( $( 'textarea.content' ).val() ),
            topic_id = this.topicId,
            to = $( 'input.to' ).val() || 0,
            point_id = $( 'input.point_id' ).val() || 0,
            imagecode = $( 'input.imagecode' ).val();

        if( this.needPoint && point_id == 0 ) {
            this.warn( '请选择您支持的论点', function() {
                setTimeout( function() {
                    me.showPoints();
                }, 200 );
            } );
            return false;
        }

        if( !content.length ) {
            return false;
        }

        if( !imagecode.length ) {
            me.warn( '请输入验证码' );
            $( 'input.imagecode' ).focus();
            me.refreshImageCode();
            return false;
        }

        this.submiting = true;

        $.ajax( {
            url : '/topic/interface/post',
            type : 'POST',
            data : {
                title : title,
                content : content,
                topic_id : topic_id,
                point_id : point_id,
                to : to,
                imagecode : imagecode,
                'csrf-token' : $.fn.cookie( 'CSRF-TOKEN' )
            },
            success : function( response ) {
                var errno = +response.errno;

                me.submiting = false;

                if( !errno ) {
                    me.warn( '发布成功' );
                    setTimeout( function() {
                        location.replace( '/post/' + response.data.id );
                    }, 1000 );
                    return;
                }

                switch( errno ) {
                    case 16 : 
                        me.warn( '您的论述超出规定的长度范围' );
                        break;
                    case 2 : 
                        me.warn( '参数错误' );
                        break;
                    case 3 :
                        me.warn( '您目前没有登录，虚要先登录才能发布论述' );
                        break;
                    case 4 :
                        me.warn( '验证码不正确' );
                        me.refreshImageCode();
                        break;
                    case 1 :
                    default :
                        me.warn( '系统错误，请稍候再试' );
                        break;
                }
            },
            error : function() {
                me.warn( '发布失败，请确认您的网络状态正常' );
                me.submiting = false;
            }
        } );

    },
    getTitle : function( e ) {
        var content = $.trim( $( 'textarea.content' ).val() ),
            title;
        
        title = content.split( /\n/, content );

        if( title.length < 3 ) {
            title = content;
        }

        return $.trim( title.substr( 0, 20 ) );

    },
    showPoints : function() {
        $( '.boxes.points' ).css( 'bottom', 0 ).focus();
    },
    hidePoints : function() {
        $( '.boxes.points' ).css( 'bottom', -300 );
    },
    warn : function( txt, callback ) {
        var me = this,
            tip = this.dialog.find( '.tip' );

        tip.html( txt );
        this.dialog.show();

        setTimeout( function() {
             me.dialog.hide();
             callback && callback();
        }, 1000 );
    }
} );

J.Package( {
    initialize : function( options ) {
        this.container = options.container || $( '#idizcuz' );
        this.signin = options.signin;
        this.bindEvent();
    },

    tosignin : function( el ) {
        this.tip( el, '您需要登录才能进行操作', function() {
            window.scrollTo( 0, 0 );
        } );
    },

    bindEvent : function() {
        var me = this;
        this.container.on( 'click', 'a.follow, a.unfollow', function( e ) {
            e.preventDefault();
            var btn = $( this ),
                accountId = $( this ).attr( 'data-account-id' ),
                action = $( this ).hasClass( 'follow' ) ? 1 : 0;

            if( !accountId ) return false;

            if( !me.signin ) {
                me.tosignin( btn );
                return false;
            }

            $.ajax( {
                url : '/user/interface/' + ( action ? 'follow' : 'unfollow' ),
                type : 'POST',
                data : {
                    account_id : accountId,
                    'csrf-token' : $.fn.cookie( 'CSRF-TOKEN' )
                },
                success : function( response ) {
                    var errno = +response.errno;

                    if( !errno ) {
                        if( action ) {
                            btn.removeClass( 'follow' ).addClass( 'unfollow dark' ).html( '取消关注' );     
                        } else {
                            btn.removeClass( 'unfollow dark' ).addClass( 'follow' ).html( '关 注' );     
                        }
                            
                        return;
                    }

                    switch( errno ) {
                        case 3 :
                            me.tosignin( btn );
                            break;
                        default :
                            me.tip( btn, '未知错误，请刷新页面重试' );
                            break;
                    }
                },
                error : function() {
                    me.tip( btn, '操作失败，网络状况异常' );
                }
            } );
        } );
    },
    tip : function( el, txt, callback ) {
        var box = el.closest( '.follow-btn-box' ),
            bubble = box.find( '.bubbles' );

        bubble.show().find( '.txt' ).html( txt );

        setTimeout( function() {
            bubble.hide();
            callback();
        }, 1500 );
    }
} );

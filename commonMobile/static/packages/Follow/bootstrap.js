J.Package( {
    initialize : function( options ) {
        this.container = options.container || $( '#idizcuz' );
        this.signin = options.signin;
        this.bindEvent();
    },

    tosignin : function() {
        this.warn( '您需要登录才能进行操作' );
        window.scrollTo( 0, 0 );
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
                me.tosignin();
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
                            me.tosignin();
                            break;
                        default :
                            me.warn( '未知错误，请刷新页面重试' );
                            break;
                    }
                },
                error : function() {
                    me.warn( '操作失败，请确认您的网络状况正常' );
                }
            } );
        } );
    },
    warn : function( txt ) {
        var dialog = $( '.tip-dialog' ),
            tip = dialog.find( '.tip' );

        tip.html( txt );
        dialog.show();

        setTimeout( function() {
             dialog.hide();
        }, 1500 );
    }
} );

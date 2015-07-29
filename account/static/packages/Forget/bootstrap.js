J.Package( {
    initialize : function( options ) {

        this.submiting = false;

        this.reg = {
            email : /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/
        };

        this.bindEvent();
    },
    setTip : function( text, type ) {
        var el = $( '.tip' );
        type ? el.addClass( type ) : el.removeClass( 'warn' );
        el.html( text ).show();
    },
    bindEvent : function() {
        var me = this;

        $( 'form.forget input.email' ).on( 'focus', function( e ) {
            me.setTip( '填写注册时使用的邮箱' );
        } );

        $( 'form.forget input.vcode' ).on( 'focus', function( e ) {
            me.setTip( '输入验证码，若一分钟内未收到，可点击重新发送' );
        } );

        $( 'form.forget input.email' ).on( 'input propertychange', function( e ) {
            var email = $.trim( $( this ).val() );
            me.reg.email.test( email ) ? $( 'form.forget .send-btn' ).removeClass( 'disabled' ) : $( 'form.forget .send-btn' ).addClass( 'disabled' );

            $( 'form.forget .send-btn' ).show();
            $( 'form.forget .resend-btn' ).hide();
        } );

        $( 'form.forget .send-btn' ).on( 'click', function( e ) {
            e.preventDefault();

            if( $( this ).hasClass( 'disabled' ) ) return;

            me.sendVcode( 'forget' ); 

            $( this ).hide();
            $( 'form.forget .resend-btn' ).css( 'display', 'inline-block' );
            me.restartTimer( $( 'form.forget .resend-btn' ) );
        } );

        $( 'form.forget .resend-btn' ).on( 'click', function( e ) {
            e.preventDefault();
            if( $( this ).hasClass( 'disabled' ) ) return false;

            me.sendVcode( 'forget' );
            me.restartTimer( $( 'form.forget .resend-btn' ) );
        } );

        $( 'form.forget .forget-btn' ).on( 'click', function( e ) {
            e.preventDefault();
            $( 'form.forget' ).submit();
        } );

        $( 'form.forget' ).on( 'submit', function( e ) {
            e.preventDefault();
            if( me.submiting ) return false;
            me.forget();
        } );

        $( '.redirect' ).on( 'click', function( e ) {
            var r = J.getQuery( 'r' ),
                href = $( this ).attr( 'href' );

            r && $( this ).attr( 'href', href + '?r=' + encodeURIComponent( r ) );
        } );
    },
    sendVcode : function( type ) {
        var me = this;

        $.ajax( {
            method : 'POST',
            url : '/account/interface/sendVcode',
            data : {
                'do' : type,
                'to' : $.trim( $( 'form.forget input.email' ).val() ),
                'csrf-token' : $.cookie( 'CSRF-TOKEN' )
            }
        } ).done( function( response ) {
            var errno = +response.errno;

            if( errno ) {
                switch( errno ) {
                    case 6 :
                        me.setTip( '该邮箱尚未注册使用', 'warn' );
                        break;
                    default :
                        me.setTip( '系统错误', 'warn' );
                        break;
                }
                return false;
            }
            me.setTip( '验证码已发送到您的邮箱，请登录邮箱查收' );
        } ).fail( function() {
            me.setTip( '系统错误，请稍候再试', 'warn' );
            me.restartTimer( '1s' );
        } );
    },
    restartTimer : function( elem ) {
        var interval = null,
            timer = elem.find( '.timer' );

        timer.html( '60s' );

        elem.addClass( 'disabled' );
        
        interval = setInterval( function() {
            var n = parseInt( timer.html() ) - 1;

            if( !n ) {
                clearInterval( interval );
                elem.removeClass( 'disabled' );
                timer.html( '' );
                return;
            }
            timer.html( n + 's' );
        }, 1000 );
    },
    forget : function() {
        var me = this,
            form = $( 'form.forget' );
        var email = $.trim( form.find( '.email' ).val() );
        
        if( !this.reg.email.test( email ) ) {
            this.setTip( '请输入正确的邮箱地址', 'warn' ); 
            return false;
        }

        var vcode = $.trim( form.find( '.vcode' ).val() );

        if( !vcode.length ) {
            this.setTip( '请输入验证码，若未收到验证码，请点击重新发送', 'warn' );
            return false;
        }

        if( !/^\d{6}$/.test( vcode ) ) {
            this.setTip( '验证码不正确', 'warn' );
            return false;
        }

        this.setTip( '正在提交...' );
        this.submiting = true;

        $.ajax( {
            method : 'POST',
            url : '/account/interface/forget',
            data : {
                email : email,
                vcode : vcode,
                'csrf-token' : $.cookie( 'CSRF-TOKEN' )
            }
        } ).done( function( response ) {
            var errno = +response.errno;

            if( !errno ) {
                me.setTip( '验证成功，页面即将跳转' );
                setTimeout( function() {
                    location.href = '/account/page/forgetreset?token=' + response.data.token;
                }, 2000 );
                return;
            }

            me.submiting = false;

            switch( errno ) {
                case 4 :
                    me.setTip( '验证码不正确', 'warn' );
                    break;
                default :
                    me.setTip( '系统错误', 'warn' );
                    break;
            }
        } ).fail( function() {
            me.submiting = false;
            me.setTip( '系统错误，请稍候再试', 'warn' );
        } );
    }
} );

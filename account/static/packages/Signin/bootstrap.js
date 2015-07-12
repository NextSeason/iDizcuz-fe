J.Package( {
    initialize : function( options ) {

        this.submiting = false;

        this.reg = {
            email : /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/
        };

        this.bindEvent();
    },
    setTip : function( text, type ) {
        var el = $( ' .tip' );
        type ? el.addClass( type ) : el.removeClass( 'warn' );
        el.html( text ).show();
    },
    bindEvent : function() {
        var me = this;

        $( 'form.signin .signin-btn' ).on( 'click', function( e ) {
            e.preventDefault();
            $( 'form.signin' ).submit();
        } );

        $( 'form.signin' ).on( 'submit', function( e ) {
            e.preventDefault();

            if( me.submiting ) return false;
            me.signin();
        } );

        $( '.redirect' ).on( 'click', function( e ) {
            var r = J.getQuery( 'r' ),
                href = $( this ).attr( 'href' );

            r && $( this ).attr( 'href', href + '?r=' + encodeURIComponent( r ) );
        } );

    },
    signin : function() {
        var me = this,
            form = $( 'form.signin' );

        var email = $.trim( form.find( '.email' ).val() );

        if( !this.reg.email.test( email ) ) {
            this.setTip( '请输入正确的邮箱地址', 'warn' ); 
            return false;
        }

        var passwd = form.find( '.passwd' ).val();

        if( !passwd.length ) {
            this.setTip( '请输入密码', 'warn' );
            return false;
        }

        if( passwd.length > 20 || passwd.length < 6 ) {
            this.setTip( '邮箱或密码不正确', 'warn' );
            return false;
        }

        this.setTip( '正在登录，请稍候...' );
        this.submiting = true;

        $.ajax( {
            method : 'POST',
            url : '/account/interface/signin',
            data : {
                email : email,
                passwd : passwd
            }
        } ).done( function( response ) {
            var errno = +response.errno;

            if( !errno ) {
                me.setTip( '登录成功，正在为您跳转...' );
                me.redirect();
                return;
            }

            me.submiting = false;

            switch( errno ) {
                case 4 :
                    me.setTip( '验证码不正确', 'warn' );
                    break;
                case 6 :
                    me.setTip( '帐号不存在', 'warn' );
                    break;
                default :
                    me.setTip( '登录失败，请确认填写信息无误后重新提交', 'warn' );
                    break;
            }
        } ).fail( function() {
            me.setTip( '系统错误，请稍候再试' );
            me.submiting = false;
        } );
    },
    redirect : function() {
        var r = J.getQuery( 'r' ),
            referrer = document.referrer;

            if( r && /^https?\:\/\/www.idizcuz.com/.test( r ) ) {
                location.href = r;
                return;
            }

            if( referrer && /^https?\:\/\/www.idizcuz.com/.test( referrer ) ) {
                if( !/\/(signin|signup|forget)/.test( referrer ) ) {
                    location.href = referrer;
                    return;
                }
            }
                 
            location.href = '/';
 
        }
    }
} );

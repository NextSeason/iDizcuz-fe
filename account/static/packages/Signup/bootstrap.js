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

        $( 'form.signup input.email' ).on( 'focus', function( e ) {
            me.setTip( '邮箱一经注册，不可修改' );
        } );

        $( 'form.signup input.uname' ).on( 'focus', function( e ) {
            me.setTip( '用户名长度为1~6个字(三个字母等于一个字)' );
        } );

        $( 'form.signup input.passwd' ).on( 'focus', function( e ) {
            me.setTip( '密码长度为6~20字符' );
        } );

        $( 'form.signup input.vcode' ).on( 'focus', function( e ) {
            me.setTip( '输入验证码，若一分钟内未收到，可点击重新发送' );
        } );

        $( 'form.signup input.email' ).on( 'blur input propertychange', function( e ) {
            var email = $.trim( $( this ).val() );
            me.reg.email.test( email ) ? $( 'form.signup .send-btn' ).removeClass( 'disabled' ) : $( 'form.signup .send-btn' ).addClass( 'disabled' );

            $( 'form.signup .send-btn' ).show();
            $( 'form.signup .resend-btn' ).hide();
        } );

        $( 'form.signup .send-btn' ).on( 'click', function( e ) {
            e.preventDefault();

            if( $( this ).hasClass( 'disabled' ) ) return;

            me.sendVcode( 'signup' ); 

            $( this ).hide();
            $( 'form.signup .resend-btn' ).css( 'display', 'inline-block' );
            me.restartTimer();
        } );

        $( 'form.signup .resend-btn' ).on( 'click', function( e ) {
            e.preventDefault();
            if( $( this ).hasClass( 'disabled' ) ) return false;

            me.sendVcode( 'signup' );
            me.restartTimer();
        } );

        $( 'form.signup' ).on( 'submit', function( e ) {
            e.preventDefault();
            if( me.submiting ) return false;
            me.signup();
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
            url : '/account/interface/sendvcode',
            data : {
                'do' : type,
                'to' : $.trim( $( 'form.signup input.email' ).val() )
            }
        } ).done( function() {
            me.setTip( '验证码已发送到您的邮箱，请登录邮箱查收' );
        } ).fail( function() {
            me.setTip( '系统错误，请稍候再试', 'warn' );
            me.restartTimer( '1s' );
        } );
    },
    restartTimer : function( start ) {
        var interval = null,
            elem = $( 'form.signup .resend-btn' ),
            timer = elem.find( '.timer' );

        timer.html( start || '60s' );

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
    signup : function() {
        var me = this,
            form = $( 'form.signup' );
        var email = $.trim( form.find( '.email' ).val() );
        
        if( !this.reg.email.test( email ) ) {
            this.setTip( '请输入正确的邮箱地址', 'warn' ); 
            return false;
        }

        var uname = $.trim( form.find( '.uname' ).val() );

        if( !uname.length ) {
            this.setTip( '请输入用户名', 'warn' ); 
            return false;
        }

        if( J.byteLen( uname ) > 18 ) {
            this.setTip( '用户名长度为1~6个字(三个字母等于一个字)', 'warn' ); 
            return false;
        }

        var passwd = form.find( '.passwd' ).val();

        if( !passwd.length ) {
            this.setTip( '请输入密码', 'warn' );
            return false;
        }

        if( passwd.length > 20 || passwd.length < 6 ) {
            this.setTip( '密码长度需要在6~20字符之间', 'warn' );
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

        this.setTip( '正在提交注册信息...' );
        this.submiting = true;

        $.ajax( {
            method : 'POST',
            url : '/account/interface/signup',
            data : {
                email : email,
                uname : uname,
                passwd : passwd,
                vcode : vcode
            }
        } ).done( function( response ) {
            var errno = +response.errno,
                referrer = document.referrer;

            if( !errno ) {
                me.setTip( '您已完成注册，请文明参与讨论' );
                setTimeout( function() {
                    me.redirect();
                }, 1000 );
                return;
            }

            me.submiting = false;

            switch( errno ) {
                case 4 :
                    me.setTip( '验证码不正确', 'warn' );
                    break;
                case 5 : 
                    me.setTip( '该邮箱已存在，您可以直接<a href="/signin">登录</a>', 'warn' );
                    break;
                default :
                    me.setTip( '注册失败，请确认填写信息无误后重新提交', 'warn' );
                    break;
            }
        } ).fail( function() {
            me.submiting = false;
            me.setTip( '系统错误,请稍候再试', 'warn' );
            me.restartTimer( '1s' );
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
} );

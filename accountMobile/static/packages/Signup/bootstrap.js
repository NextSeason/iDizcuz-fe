J.Package( {
    initialize : function( options ) {
        this.submiting = false;
        this.form = options.form;
        this.bindEvent();
    },
    bindEvent : function() {
        var me = this;
        this.form.find( '.send' ).on( 'tap', function( e ) {
            e.preventDefault();
            if( $( this ).hasClass( 'disabled' ) ) return false;
            me.sendCode();
        } );

        this.form.find( '.email' ).on( 'input focus blur', function( e ) {
            var email = me.getEmailVal(),
                sendBtn = me.form.find( '.send' ); 
            email ? sendBtn.removeClass( 'disabled' ) : sendBtn.addClass( 'disabled' );
        } );

        this.form.on( 'submit', function( e ) {
            e.preventDefault();
            me.submiting || me.signup();
        } );
    },

    signup : function() {
        var me = this,
            form = this.form,
            trim = $.trim;

        var email = this.getEmailVal(), 
            uname = trim( form.find( '.uname' ).val() ),
            passwd = form.find( '.passwd' ).val(),
            vcode = trim( form.find( '.vcode' ).val() );

        if( !email ) {
            this.warn( '请正确填写邮箱地址' );
            return false;
        }

        if( !uname ) {
            this.warn( '请输入姓名' );
            return false;
        }

        if( !passwd ) {
            this.warn( '请输入密码' );
            return false;
        }

        if( !vcode.length ) {
            this.warn( '请输入验证码，若在一分钟之内没有收到邮件，可点击重新发送获取验证码' );
            return false;
        }

        if( uname.length > 16 ) {
            this.warn( '用户名不可以超过16个字符' );
            return false;
        }

        if( passwd.length < 6 || passwd.length > 20 ) {
            this.warn( '密码长度需要在6~20个字符之间' );
            return false;
        }

        if( !/^\d{6}$/.test( vcode ) ) {
            this.warn( '验证码不正确' );
            return false;
        }

        this.submiting = true;

        $.ajax( {
            url : '/account/interface/signup',
            type : 'POST',
            data : {
                email : email,
                uname : uname,
                passwd : passwd,
                vcode : vcode,
                'csrf-token' : $.fn.cookie( 'CSRF-TOKEN' )
            },
            success : function( response ) {
                var errno = +response.errno;

                if( !errno ) {
                    location.href = '/';
                    return;
                }

                me.submiting = false;

                switch( errno ) {
                    case 4 :
                        me.warn( '验证码不正确' );
                        break;
                    case 5 :
                        me.warn( '该用户已存在，您可以 <a href="/signin">直接登录</a>' );
                        break;
                    default :
                        me.warn( '系统错误，请刷新后重试' );
                        break;
                }
            },
            error : function() {
                me.warn( '系统错误，请刷新后重试' );
                me.submiting = false;
            }
        } );
    },
    sendCode : function() {
        var me = this,
            email = this.getEmailVal();

        if( !email ) return false;

        $.ajax( {
            url : '/account/interface/sendvcode',
            type : 'POST',
            data : {
                do : 'signup',
                to : email,
                'csrf-token' : $.fn.cookie( 'CSRF-TOKEN' )
            },
            success : function( response ) {
                var errno = +response.errno;

                if( !errno ) {
                    me.warn( '验证码已经发送到您的邮箱，请注意查收' );
                    me.startCountdown();
                    return;
                }

                switch( errno ) {
                    case 5 :
                        me.warn( '该用户已存在，您可以 <a href="/signin">直接登录</a>' );
                        me.enableToSend();
                        break;
                    default :
                        me.warn( '邮件发送失败，请刷新页面重试' );
                        me.enableToSend();
                        break;
                }

            }
        } );
    },
    getEmailVal : function() {
        var email = $.trim( this.form.find( '.email' ).val() ),
            reg = /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/;
        return reg.test( email ) ? email : false;
    },
    warn : function( txt ) {
        var me = this;
        this.form.find( '.warn' ).html( txt ).show();

        setTimeout( function() {
            me.form.find( '.warn' ).html( '' ).hide();
        }, 3000 );
    },
    enableToSend : function() {
        this.form.find( '.send' ).removeClass( 'disabled' );
    },
    startCountdown : function() {
        var me = this,
            el = this.form.find( '.send' );
        el.addClass( 'disabled' ).html( '重新发送 <b>60s</b>' );
        ( function() {
            var callee = arguments.callee,
                time = parseInt( el.find( 'b' ).html() );   
            if( !time ) {
                el.html( '重新发送' );
                me.enableToSend();
            } else {
                setTimeout( function() {
                    el.find( 'b' ).html( time - 1 + 's' );
                    callee();
                }, 1000 );
            }
        } )();
    }
} );

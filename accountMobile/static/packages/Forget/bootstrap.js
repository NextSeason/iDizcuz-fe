J.Package( {
    initialize : function( options ) {
        this.submiting = false;
        this.form = options.form;
        this.bindEvent();
    },
    bindEvent : function() {
        var me = this;

        this.form.find( '.send' ).on( 'tap', function( e) {
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
            me.submiting || me.submit();
        } );
    },
    
    submit : function() {
        var me = this;

        var email = this.getEmailVal(),
            vcode = $.trim( this.form.find( '.vcode' ).val() );

        if( !email ) {
            this.warn( '请输入您注册时使用的邮箱地址' );
            return false;
        }

        if( !vcode ) {
            this.warn( '请输入您收到的邮件中的验证码' );
            return false;
        }

        if( !/^\d{6}$/.test( vcode ) ) {
            this.warn( '验证码不正确' );
            return false;
        }

        this.submiting = true;

        $.ajax( {
            url : '/account/interface/forget',
            type : 'POST',
            data : {
                email : email,
                vcode : vcode,
                'csrf-token' : $.fn.cookie( 'CSRF-TOKEN' )
            },
            success : function( response ) {
                var errno = +response.errno;

                if( !errno ) {
                    me.warn( '验证成功，页面即将跳转' );
                    setTimeout( function() {
                        location.href = '/account/page/forgetreset?token=' + response.data.token;
                    }, 2000 );
                    return;
                }

                me.submiting = false;
                
                switch( errno ) {
                    case 4 :
                        me.warn( '验证码不正确' );
                        break;
                    case 6 :
                        me.warn( '该用户不存在，请输入您注册时使用的邮箱地址' );
                        break;
                    default : 
                        me.warn( '系统错误，请刷新后再试' );
                        break;
                }

            },
            errno : function() {
                me.warn( '数据发送失败，请确认您的网络状态正常' );
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
                do : 'forget',
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
                    case 6 :
                        me.warn( '该用户不存在，请输入您注册时使用的邮箱地址' );
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

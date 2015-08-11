J.Package( {
    initialize : function( options ) {
        this.form = options.form;
        this.submiting = false;
        this.bindEvent();
    },
    bindEvent : function() {
        var me = this;

        this.form.on( 'submit', function( e ) {
            e.preventDefault();
            me.submiting || me.submit();
        } );
    },
    submit : function() {
        var me = this,
            form = this.form;

        var email = form.find( '.email' ).val(),
            token = form.find( '.token' ).val(),
            passwd = form.find( '.passwd' ).val(),
            rpasswd = form.find( '.rpasswd' ).val();

        if( passwd.length < 6 || passwd.length > 20 ) {
            me.warn( '密码长度需要在6~20个字符之间' );
            return false;
        }

        if( rpasswd != passwd ) {
            me.warn( '两次输入密码不同' );
            return false;
        }

        this.submiting = true;

        $.ajax( {
            url : '/account/interface/forgetreset',
            type : 'POST',
            data : {
                email : email,
                passwd : passwd,
                token : token,
                'csrf-token' : $.fn.cookie( 'CSRF-TOKEN' )
            },
            success : function( response ) {
                var errno = +response.errno;

                if( !errno ) {
                    me.warn( '密码设置成功，页面即将跳转跳转到登录页面' );
                    setTimeout( function() {
                        location.href = '/signin';
                    }, 2000 );
                    return false;
                }

                me.submiting = false;

                switch( errno ) {
                    case 23 :
                        me.warn( '此页面已失效，请 <a href="/forget">重新验证</a>' );
                        setTimeout( function() {
                            location.href = '/forget';
                        }, 2000 );
                        break;
                    default :
                        me.warn( '系统错误，请稍候重试' );
                        break;
                }
            },
            error : function() {
                me.warn( '数据提交失败，请确认您的网络状况正常' );
                me.submiting = false;
            }
        } );

    },
    warn : function( txt ) {
        var me = this;
        this.form.find( '.warn' ).html( txt ).show();

        setTimeout( function() {
            me.form.find( '.warn' ).html( '' ).hide();
        }, 3000 );
    }
} );

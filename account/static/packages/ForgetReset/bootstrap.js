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

        $( 'form.forgetreset input.passwd' ).on( 'focus', function( e ) {
            me.setTip( '密码长度为6~20个字符' );
        } );

        $( 'form.forgetreset' ).on( 'submit', function( e ) {
            e.preventDefault();
            if( me.submiting ) return false;
            me.forgetreset();
        } );
    },
    forgetreset : function() {
        var me = this,
            form = $( 'form.forgetreset' ),
            email = form.find( '.email' ).val(),
            token = form.find( '.token' ).val(),
            passwd = form.find( '.passwd' ).val(),
            rpasswd = form.find( '.rpasswd' ).val();

        if( passwd.length < 6 || passwd.length > 20 ) {
            this.setTip( '密码长度在6~20个字符直间', 'warn' );
            return false;
        }

        if( rpasswd != passwd ) {
            this.setTip( '两次输入密码不同', 'warn' );
            return false;
        }

        this.setTip( '正在提交...' );
        this.submiting = true;

        $.ajax( {
            method : 'POST',
            url : '/account/interface/forgetreset',
            data : {
                email : email,
                passwd : passwd,
                token : token,
                'csrf-token' : $.cookie( 'CSRF-TOKEN' )
            }
        } ).done( function( response ) {
            var errno = +response.errno;

            if( !errno ) {
                me.setTip( '新密码设置成功，页面即将跳转' );
                setTimeout( function() {
                    location.href = '/signin';
                }, 2000 );
                return;
            }

            me.submiting = false;

            switch( errno ) {
                case 23 : 
                    me.setTip( '链接已失效，请<a href="/forget">重新验证</a>', 'warn' );
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

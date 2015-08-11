J.Package( {
    initialize : function( options ) {
        this.submiting = false;
        this.form = options.form;
        this.bindEvent();
    },
    bindEvent : function() {
        var me = this;

        this.form.on( 'submit', function( e ) {
            e.preventDefault();
            me.submiting || me.signin();
        } );
    },
    signin : function() {
        var me = this;
        var passwd = this.form.find( '.passwd' ).val(),
            email = $.trim( this.form.find( '.email' ).val() ),
            remember = +this.form.find( '.remember' ).get(0).checked;

        if( !email.length || !passwd.length ) {
            return false;
        }

        if( passwd.length < 6 || passwd.length > 20 ) {
            me.warn( '密码错误' );
            return false;
        }

        this.submiting = true;

        $.ajax( {
            url : '/account/interface/signin',
            type : 'POST',
            data : {
                email : email,
                passwd : passwd,
                remember : remember,
                'csrf-token' : $.fn.cookie( 'CSRF-TOKEN' )
            },
            success : function( response ) {
                var errno = +response.errno;

                me.submiting = false;

                if( !errno ) {
                    if( /^\/signin/.test( location.pathname ) ) {
                        location.href = '/';
                        return
                    }
                    location.reload();
                    return;
                }

                switch( errno ) {
                    case 6 :
                        me.warn( '用户不存在' );
                        break;
                    case 7 :
                        me.warn( '密码错误' );
                        break;
                    default :
                        me.warn( '系统错误，请刷新页面再试' );
                        break;
                }
            },
            error : function() {
                me.warn( '系统错误，请刷新页面再试' );
                me.submiting = false;
            }
        } );
    },
    warn : function( txt ) {
        this.form.find( '.warn' ).html( txt ).show();
    }
} );

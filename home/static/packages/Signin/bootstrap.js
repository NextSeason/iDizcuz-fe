J.Package( {
    initialize : function() {
        this.container = $( '.sign-box' );
        this.bindEvent();
    },
    bindEvent : function() {
        var me = this;
        this.container.find( 'form.signin' ).on( 'submit', function( e ) {
            e.preventDefault();
            me.signin();
        } );
    },
    signin : function() {
        var email = this.container.find( 'form.signin input.email' ).val(),
            passwd = this.container.find( 'form.signin input.passwd' ).val(),
            remember = +this.container.find( 'form.signin input.remember' ).get(0).checked;

        if( !/^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/.test( email ) ) {
            return false;
        }

        if( !passwd.length ) {
            return false;
        }

        $.ajax( {
            url : '/account/interface/signin',
            method : 'POST',
            data : {
                email : email,
                passwd : passwd,
                remember : remember,
                'csrf-token' : $.cookie( 'CSRF-TOKEN' )
            }
        } ).done( function( response ) {
            var errno = +response.errno;

            if( !errno ) {
                location.reload();
                return false;
            }

            if( errno == 7 ) {
                this.container.find( '.signin-tip' ).html( '用户名或密码错误' ).show();
            } else if( errno == 6 ) {
                this.container.find( '.signin-tip' ).html( '用户名不存在' ).show();
            } else {
                this.container.find( '.signin-tip' ).html( '系统错误' ).show();
            }


        } );
    }
} );

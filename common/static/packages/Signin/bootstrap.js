J.Package( {
    initialize : function() {
        this.container = $( '#signin-dialog' );
        this.form = this.container.find( 'form.global-signin' );
        this.bindEvent();
    },
    bindEvent : function() {
        var me = this;
        this.form.on( 'submit', function( e ) {
            e.preventDefault();
            me.signin();
        } );

        this.container.find( '.close' ).on( 'click', function( e ) {
            e.preventDefault();
            me.container.hide();
        } );
    },
    signin : function() {
        var me = this;
        var email = this.form.find( 'input.email' ).val(),
            passwd = this.form.find( 'input.passwd' ).val(),
            remember = +this.form.find( 'input.remember' ).get(0).checked;

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
                me.container.find( '.signin-tip' ).html( '用户帐号或密码错误' ).show();
            } else if( errno == 6 ) {
                me.container.find( '.signin-tip' ).html( '用户帐号不存在' ).show();
            } else {
                me.container.find( '.signin-tip' ).html( '系统错误' ).show();
            }


        } );
    }
} );

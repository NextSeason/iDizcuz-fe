J.Package( {
    initialize : function() {
        this.container = $( '#signin-dialog' ); 
        this.submiting = false;
        this.bindEvent();
    },
    bindEvent : function() {
        var me = this;
        this.container.find( 'form.global-signin' ).on( 'submit', function( e ) {
            e.preventDefault();
            if( this.submiting ) return false;
            me.signin();
        } );

        this.container.find( '.close' ).on( 'click', function( e ) {
            e.preventDefault();
            me.container.hide();
        } );
    },
    signin : function() {
        var me = this,
            email = this.container.find( 'form.global-signin input.email' ).val(),
            passwd = this.container.find( 'form.global-signin input.passwd' ).val(),
            remember = +this.container.find( 'form.global-signin input.remember' ).get(0).checked;

        if( !/^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/.test( email ) || !passwd.length ) return false;

        if( passwd.length < 6 || passwd.length > 20 ) {
            me.container.find( '.signin-tip' ).html( '用户名或密码错误' ).show();
            return false;
        }

        this.submiting = true;

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
            var errno = +response.errno,
                tip = me.container.find( '.signin-tip' );

            me.submiting = false;

            if( !errno ) {
                location.reload();
                return false;
            }
            switch( errno ) {
                case 7 :
                    tip.html( '用户名或密码错误' ).show();
                    break;
                case 6 :
                    tip.html( '用户名不存在' ).show();
                    break;
                default :
                    tip.html( '系统错误' ).show();
                    break;
            }
        } ).fail( function() {
            tip.html( '系统错误' ).show();
            me.submiting = false;
        } );
    }
} );

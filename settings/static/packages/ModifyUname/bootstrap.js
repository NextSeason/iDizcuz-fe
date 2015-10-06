J.Package( {
    initialize : function( options ) {
        this.bindEvent();
    },
    bindEvent : function() {
        var me = this;
        $( '.modify-uname' ).on( 'click', function( e ) {
            e.preventDefault();

            $( '.uname-part' ).hide();
            $( '.uname-modify-part' ).show();
            $( 'input.uname' ).focus();
        } );

        $( '.save-uname' ).on( 'click', function( e ) {
            e.preventDefault();
            me.save();
        } );
    },
    save : function() {
        var me = this,
            uname = $.trim( $('input.uname').val() ),
            oldUname = $( 'input.old-uname' ).val();

        if( !uname.length ) return false;

        if( uname.length > 50 ) {
            this.tip( '用户名过长' );
            return false;
        }

        if( uname == oldUname ) return false;

        $.ajax( {
            url : '/settings/interface/rename',
            method : 'POST',
            data : {
                uname : uname,
                'csrf-token' : $.cookie( 'CSRF-TOKEN' )
            }
        } ).done( function( response ) {
            var errno = +response.errno;

            if( errno ) {
                me.tip( '参数错误' );
                return;
            }

            me.tip( '您的改名请求已经成功提交，请等待审核' );
            setTimeout( function() {
                $( '.uname-modify-part' ).hide();
                $( '.rename-submited' ).show();
            }, 1000 );
        } ).fail( function() {
            me.tip( '提交失败，请确认您的网络状态正常' );
        } );
    },
    tip : function( txt ) {
        $( '.rename-submit-tip' ).html( txt ).show();
        setTimeout( function() {
            $( '.rename-submit-tip' ).hide();
        }, 1000 );
    }
} );

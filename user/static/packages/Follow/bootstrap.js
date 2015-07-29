J.Package( {
    initialize : function( options ) {
        this.bindEvent();
    },

    redirect : function() {
        location.href = '/signin?r=' + encodeURIComponent( location.href );
    },

    bindEvent : function() {
        var me = this;
        $( '#idizcuz' ).on( 'click', 'a.follow', function( e ) {
            e.preventDefault();
            var btn = $( this ),
                accountId = $( this ).attr( 'data-account-id' );

            if( !accountId ) return false;

            $.ajax( {
                url : '/user/interface/follow',
                method : 'POST',
                data : {
                    account_id : accountId,
                    'csrf-token' : $.cookie( 'CSRF-TOKEN' )
                }
            } ).done( function( response ){
                var errno = +response.errno;

                if( !errno ) {
                    btn.removeClass( 'follow' ).addClass( 'unfollow dark' ).html( '取消关注' );     
                    return;
                }

                switch( errno ) {
                    case 3 :
                        me.redirect();
                        break;
                }
            } ).fail( function( response ) {
                alert( '系统错误，请稍候再试' );
            } );
        } );
        $( '#idizcuz' ).on( 'click', 'a.unfollow', function( e ) {
            e.preventDefault();
            var btn = $( this ),
                accountId = $( this ).attr( 'data-account-id' );

            if( !accountId ) return false;

            $.ajax( {
                url : '/user/interface/unfollow',
                method : 'POST',
                data : {
                    account_id : accountId,
                    'csrf-token' : $.cookie( 'CSRF-TOKEN' )
                }
            } ).done( function( response ){
                var errno = +response.errno;

                if( !errno ) {
                    btn.removeClass( 'unfollow dark' ).addClass( 'follow' ).html( '关 注' );     
                    return;
                }
                switch( errno ) {
                    case 3 :
                        me.redirect();
                        break;
                }
            } ).fail( function( response ) {
                alert( '系统错误，请稍候再试' );
            } );
        } );
    }
} )

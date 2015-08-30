J.Package( {
    initialize : function( options ) {
        this.bindEvent();
    },
    bindEvent : function() {
        var me = this;

        $( 'select.settings' ).on( 'change', function( e ) {
            var key = $( this ).attr( 'data-settings-key' ),
                value = $( this ).val();

            me.save( key, value );
        } );
    },

    save : function( key, value ) {
        var me = this;
        $.ajax( {
            url : '/settings/interface/savesettings',
            method : 'POST',
            data : {
                k : key,
                v : value,
                'csrf-token' : $.cookie( 'CSRF-TOKEN' )
            }
        } ).done( function( response ) {
            var errno = +response.errno;

            if( !errno ) {
                me.showTip( '保存成功' );
                return;
            }
            me.showTip( '保存失败' ); 

        } ).fail( function( response ) {
            me.showTip( '保存失败' ); 
        } );

    },
    showTip : function( txt ) {
        $( '.tip-box p' ).html( txt );
        $( '.tip-box' ).fadeIn();

        setTimeout( function() {
            $( '.tip-box' ).fadeOut();
        } , 1000 );
    }
} );

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

        $( 'input.settings' ).on( 'change', function( e ) {
            var key = $( this ).attr( 'data-settings-key' ),
                value = $( this ).get( 0 ).checked ? $( this ).attr( 'data-on-checked' ) : $( this ).attr( 'data-no-checked' );

            me.save( key, value );
        } );
    },

    save : function( key, value ) {
        var me = this;
        $.ajax( {
            url : '/settings/interface/savesettings',
            type : 'POST',
            data : {
                k : key,
                v : value,
                'csrf-token' : $.fn.cookie( 'CSRF-TOKEN' )
            },
            success : function( response ) {
                var errno = +response.errno;

                if( !errno ) {
                    me.showTip( '保存成功' );
                    return;
                }
                me.showTip( '保存失败' ); 
            },
            error : function() {
                me.showTip( '保存失败' ); 
            }
        } );

    },
    showTip : function( txt ) {
        $( '.boxes.tip' ).html( txt ).show();

        setTimeout( function() {
            $( '.boxes.tip' ).hide();
        } , 1000 );
    }
} );

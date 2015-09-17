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
        var uname = $.trim( $('input.uname').val() ),
            oldUname = $( 'input.old-uname' ).val();

        if( !uname.length ) return false;

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
        } ).fail( function() {
        } );
    },
    tip : function( txt, type ) {
        $( '.rename-tip' ).html( txt );
    }
} );

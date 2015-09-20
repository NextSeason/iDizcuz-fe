J.Package( {
    initialize : function( options ) {
        this.container = this.container || $( '#idizcuz' );
        this.bindEvent();
    },
    bindEvent : function() {
        var me = this;
        this.container.on( 'click', '.add-unit', function( e ) {
            e.preventDefault();
            var tpl = $( '#' + $( this ).attr( 'data-unit-tpl' ) ).val(),
                unit = $( this ).closest( '.unit' );

            if( !unit.length ) return false;

            $( tpl ).insertAfter( unit );
        } );

        this.container.on( 'click', '.del-unit', function( e ) {
            var lines = $( this ).closest( '.block' ).find( '.unit' );
            if( lines.length == 1 ) return false;
            $( this ).closest( '.unit' ).remove();
        } );

        this.container.on( 'submit', 'form', function( e ) {
            e.preventDefault();
            if( !window.confirm( '确定保存内容？' ) ) return false;
            me.save( $( this ) );
        } );
    },

    save : function( form ) {
        var me = this,
            data = this.getData.apply( this, [ form ] );

        if( data === false ) {
            alert( '数据错误' );
            return false;
        }

        console.log( 'sent data', data );

        $.ajax( {
            url : '/fms/interface/save',
            method : 'POST',
            data : {
                alias : form.find( 'input[name=fragment-alias]' ).val(),
                content : JSON.stringify( data ),
                'csrf-token' : $.cookie( 'CSRF-TOKEN' )
            }
        } ).done( function( response ) {
            var errno = +response.errno;

            if( !errno ) {
                alert( '保存成功' );
                return false;
            }
            alert( '保存失败' );
        } ).fail( function() {
            alert( '保存失败' );
        } );
    },
    getData : function() {
        return false;
    },
    val : function( el, type ) {
        var value = $.trim( el.val() );

        if( !value.length ) return '';

        switch( type ) {
            case 'link' : 
                if( !/^https?:\/\/.*/.test( value ) ) {
                    value = 'http://' + value; 
                }
                return value;
                break;
            default :
                return value;
                break;
        }
    }
} );

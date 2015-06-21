J.Package( {
    initialize : function( options ) {
        if( !document.getElementById( 'editor' ) ) return false;

        this.placeholder = '在此输入您想发表的内容',
        this.timeout1 = null;
        this.timeout2 = null;

        this.editor = null;

        this.createEditor();
        this.bindEvent();
    },
    createEditor : function() {
        this.editor = UM.getEditor( 'editor' );
    },

    setWarn : function( text ) {
        this.timeout1 && clearTimeout( this.timeout1 );
        $( '.submit-line .post-warn' ).html( text );
        this.timeout1 = setTimeout( function() {
            $( '.submit-line .post-warn' ).html( '' );
        }, 2000 );

    },
    bindEvent : function() {
        var me = this
            editor = this.editor;

        editor.addListener( 'click', function() {
            var contentTxt = editor.getContentTxt();
            if( contentTxt == me.placeholder ) {
                editor.setContent( '' );
                editor.blur();
                editor.focus();
            }
        } );
        $( '.submit-line .public' ).on( 'click', function( e ) {
            var content = editor.getContent(),
                contentTxt = editor.getContentTxt();

            if( contentTxt == me.placeholder || !contentTxt.length ) {
                me.setWarn( '发布内容不能为空' );
                return false;
            }

            if( contentTxt.length < 20 ) {
                me.setWarn( '您发布的文字内容不能少于20个字' );
                return false;
            }

            if( contentTxt.length > 20000 ) {
                me.setWarn( '您发布的文字内容不能大于20000个字' );
                return false;
            }
            $.ajax( {
                url : '/topic/interface/post',
                method : 'POST',
                data : {
                    content : content,
                    topic_id : $( '.topic-area' ).attr( 'data-topic-id' )
                }
            } ).done( function( response ) {
            } );
        } );

    }
} );

J.Package( {
    initialize : function( options ) {
        if( !document.getElementById( 'editor' ) ) return false;

        this.placeholder = '在此输入您想发表的内容',
        this.timeout1 = null;
        this.timeout2 = null;

        this.editor = null;

        this.tpl = $( '#new-post-tpl' ).val();

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

        editor.addListener( 'beforepaste', function( name, data ) {
            var node = $( data.html );
            data.html = node.text();
            node = null;
        } );

        editor.addListener( 'blur', function( e ) {
            var title = $.trim( $( 'input.title' ).val() );
            if( title.length ) return;
            $('input.title').val( me.getTitle( editor.getContent() ) );
        } );

        $( 'a.get-title' ).on( 'click', function( e ) {
            e.preventDefault();
            if( $.trim( editor.getContentTxt() ) == me.placeholder ) return;
            $( 'input.title' ).val( me.getTitle( editor.getContent() ) );
        } );

        $( 'a.remove-to' ).on( 'click', function( e ) {
            e.preventDefault();
            $( 'a.to-title' ).html( '' );
            $( 'input.to' ).val( '' );
            $( '.to-line' ).fadeOut( 'slow' );
        } );

        $( '.submit-line .public' ).on( 'click', function( e ) {
            var to= $( 'input.to' ).val(),
                toTitle,
                title = $.trim( $( 'input.title' ).val() ),
                content = editor.getContent(),
                contentTxt = editor.getContentTxt();

            if( contentTxt == me.placeholder || !contentTxt.length ) {
                me.setWarn( '发布内容不能为空' );
                return false;
            }

            if( contentTxt.length < 10 ) {
                me.setWarn( '您发布的文字内容不能少于10个字' );
                return false;
            }

            if( contentTxt.length > 20000 ) {
                me.setWarn( '您发布的文字内容不能大于20000个字' );
                return false;
            }

            if( !title.length ) {
                title = me.getTitle( content );
                $( 'input.title' ).val( title );
            }

            if( !to.length && !/^\d+$/.test( to ) ) {
                to = 0;
            } else {
                toTitle = $( 'a.to-title' ).html();
            }

            $.ajax( {
                url : '/topic/interface/post',
                method : 'POST',
                data : {
                    content : content,
                    topic_id : $( '.topic-area' ).attr( 'data-topic-id' ),
                    title : title,
                    to : to
                }
            } ).done( function( response ) {
                var errno = +response.errno,
                    data,
                    compiled,
                    html;

                if( !errno ) {
                    compiled = J.template( me.tpl );
                    data = {
                        id : response.data.id,
                        title : title,
                        content : content,
                        to : null
                    };

                    if( to.length && to != 0 ) {
                        data.to = {
                            id : to,
                            title : toTitle
                        };
                    }

                    node = $( compiled( { data : data } ) );

                    $( '.post-list' ).append( node );
                    window.scrollTo( 0, node.position().top );
                    me.editor.setContent( '' );
                    $( 'input.title' ).val( '' );
                    node.css( 'opacity', 1 );
                    return ;
                }

                switch( errno ) {
                    case 15 :
                        me.setWarn( '您的论述太短' );
                        break;
                    case 16 : 
                        me.setWarn( '您的论述超出规定的长度范围' );
                        break;
                    case 2 : 
                        me.setWarn( '参数错误' );
                        break;
                    case 3 :
                        me.setWarn( '您目前没有登录，虚要先登录才能发布论述' );
                        break;
                    case 1 :
                    default :
                        me.setWarn( '系统错误，请稍候再试' );
                        break;
                }
                return false;
            } );
        } );

    },
    getTitle : function( content ) {
        var node = $( '<div>' ),
            title;
        node.append( content );

        title = node.find( 'p' ).eq( 0 ).text();

        if( title.length < 3 ) {
            title = node.text();
        }

        title = $.trim( title.substr( 0, 50 ) );

        return title.substr( 0, 20 );
    }
} );

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
                var errno = +response.errno,
                    data,
                    compiled,
                    html;

                if( !errno ) {
                    compiled = J.template( me.tpl );
                    data = {
                        id : response.data.id,
                        title : me.getTitle( content ),
                        content : content
                    };
                    node = $( compiled( { data : data } ) );



                    $( '.post-list' ).append( node );
                    window.scrollTo( 0, node.position().top );
                    me.editor.setContent( '' );
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

        return title.substr( 0, 20 );
    }
} );

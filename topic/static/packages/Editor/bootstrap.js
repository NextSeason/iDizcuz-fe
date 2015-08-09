J.Package( {
    initialize : function( options ) {
        if( !document.getElementById( 'editor' ) ) return false;

        this.placeholder = '在此输入您想发表的内容',
        this.timeout1 = null;
        this.timeout2 = null;

        this.editor = null;
        this.topic = options.topic;
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

    submit : function() {
        var me = this;
        var to= $( 'input.to' ).val(),
            toTitle,
            title = $.trim( $( 'input.title' ).val() ),
            point_id = $( 'input.point_id' ).val(),
            content = editor.getContent(),
            contentTxt = editor.getContentTxt(),
            imagecode = $.trim( $( 'input.imagecode' ).val() );

        if( contentTxt == this.placeholder || !contentTxt.length ) {
            this.setWarn( '发布内容至少需要10个字符' );
            return false;
        }

        if( contentTxt.length < 10 ) {
            this.setWarn( '您发布的文字内容不能少于10个字' );
            return false;
        }

        if( contentTxt.length > 20000 ) {
            this.setWarn( '您发布的文字内容不能大于20000个字' );
            return false;
        }

        if( !title.length ) {
            title = this.getTitle( content );
            $( 'input.title' ).val( title );
        }

        if( !to.length && !/^\d+$/.test( to ) ) {
            to = 0;
        } else {
            toTitle = $( 'a.to-title' ).html();
        }

        if( this.topic.type == 1 && point_id == 0 ) {
            this.setWarn( '请选择您支持的观点' );
            return false;
        }

        if( !imagecode.length ) {
            this.setWarn( '请输入验证码' );
            return false;
        }

        if( imagecode.length != 4 ) {
            this.setWarn( '验证码不正确' );
            return false;
        }

        $.ajax( {
            url : '/topic/interface/post',
            method : 'POST',
            data : {
                content : content,
                topic_id : this.topic.id,
                point_id : point_id,
                title : title,
                to : to,
                imagecode : imagecode,
                'csrf-token' : $.cookie( 'CSRF-TOKEN' )
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
                    point_id : point_id,
                    content : content,
                    to : 0,
                    ctime : '刚刚'
                };

                if( to != 0 ) {
                    data.to = {
                        id : to,
                        title : toTitle
                    };
                }

                node = $( compiled( { data : data } ) );

                new QRCode( node.find( '.qrcode' ).get( 0 ), {
                    text : node.find( '.share-post-link' ).attr( 'href' ),
                    width : 110,
                    height : 110
                } );

                hideEditorDialog();
                $( '.post-list' ).append( node );
                window.scrollTo( 0, node.position().top );
                me.editor.setContent( '' );
                $( 'input.title' ).val( '' );
                node.css( 'opacity', 1 );
                $( 'a.to-title' ).html( '' );
                $( 'input.to' ).val( '' );
                $( '.to-line' ).hide();
                $( 'input.imagecode' ).val( '' );
                me.refreshImageCode();
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
                case 4 :
                    me.setWarn( '验证码不正确' );
                    me.refreshImageCode();
                    break;
                case 1 :
                default :
                    me.setWarn( '系统错误，请稍候再试' );
                    break;
            }
            return false;
        } );
    },
    refreshImageCode : function() {
        $( '.vcode-area img' ).attr( 'src', '/common/interface/imagecode?_t=' + ( +new Date ) );
    },
    bindEvent : function() {
        var me = this
            editor = this.editor;

        editor.addListener( 'focus', function() {
            var contentTxt = editor.getContentTxt();
            if( contentTxt == me.placeholder ) {
                editor.setContent( '' ); 
            }
        } );

        editor.addListener( 'beforepaste', function( name, data ) {
            var node = $( '<helper>' + data.html + '</helper>' );
            
            data.html = J.encodeHTML( node.text() );
            node = null;
        } );

        editor.addListener( 'blur', function( e ) {
            var title = $.trim( $( 'input.title' ).val() );
            if( title.length ) return;
            $('input.title').val( me.getTitle( editor.getContent() ) );
        } );

        $( 'a.remove-to' ).on( 'click', function( e ) {
            e.preventDefault();
            $( 'a.to-title' ).html( '' );
            $( 'input.to' ).val( '' );
            $( '.to-line' ).hide();
        } );

        $( '.submit-line .public' ).on( 'click', function( e ) {
            e.preventDefault();
            me.submit();
        } );

        $( '#editor-dialog .minus' ).on( 'click', function( e ) {
            e.preventDefault();
            hideEditorDialog();
        } );

        $( '.point-selector .points' ).on( 'click', function( e ) {
            e.preventDefault();
            var point_id = $( this ).attr( 'data-point-id' );
            $( 'input.point_id' ).val( point_id );
            $( '.i-agree i' ).eq(0).replaceWith( '<i class="fa fa-flag point-flag-' + point_id + '"></i>' );
            $( '.i-agree' ).removeClass( 'hover' );
        } );

        $( '.i-agree' ).on( 'mouseover click', function( e ) {
            $( this ).addClass( 'hover' );
        } );

        $( '.i-agree' ).on( 'mouseout', function( e ) {
            $( this ).removeClass( 'hover' );
        } );

        $( '.refresh-imagecode' ).on( 'click', function( e ) {
            e.preventDefault();
            me.refreshImageCode();
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

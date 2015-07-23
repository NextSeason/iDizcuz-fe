J.Package( {
    initialize : function( options ) {
        this.bindEvent();
        this.editor = null;
        this.createEditor();
    },

    createEditor : function() {
        this.editor = UM.getEditor( 'editor' );
    },
    bindEvent : function() {
        var me = this;
        $( '.save' ).on( 'click', function( e ) {
            e.preventDefault();

            var form = $( 'form.article-form' );

            var id = form.find('input.id').val(),
                topic_id = $.trim( form.find( 'input.topic_id' ).val() ),
                title = $.trim( form.find( '.title' ).val() ),
                summary = $.trim( form.find( '.summary' ).val() ),
                time = $.trim( form.find( '.time' ).val() ),
                origin = $.trim( form.find( '.origin' ).val() ),
                origin_url = $.trim( form.find( '.origin_url' ).val() ),
                origin_logo = $.trim( form.find( '.origin_logo' ).val() ),
                author = $.trim( form.find( '.author' ).val() ),
                img = form.find( 'input.img' ).val(),
                content = me.editor.getContent(); 

            if( !title.length ) {
                alert( '标题必须填写' );
                return false;
            }

            if( time.length && new Date( time ) == 'Invalid Date') {
                alert( '时间格式应为：2015-12-31' );
                return false;
            }

            if( topic_id.length && !/^\d+$/.test( topic_id ) ) {
                alert( '绑定话题ID格式不正确' );
                return false;
            }

            var data = {
                id : id,
                topic_id : topic_id,
                title : title,
                content : content,
                time : time.length ? Math.floor( +new Date( time ) / 1000 ) : '',
                summary : summary,
                origin : origin,
                origin_url : origin_url,
                origin_logo : origin_logo,
                author : author,
                img : img
            };

            $.ajax( {
                url : '/mis/interface/article',
                method : 'POST',
                data : data
            } ).done( function( response ) {
                var errno = +response.errno; 
                if( !errno ) {
                    alert( '保存成功' );
                    if( !+id ) {
                        location.href = '/mis/page/article?id=' + response.data.article_id;
                        return;
                    }
                    location.reload();
                }
            } );
        } );

        $( 'input.image' ).on( 'change', function( e ) {
            var file = $( this ).get( 0 ).files[ 0 ];
            $( this ).val('');

            var formData = new FormData();
            formData.append( 'file', file );
 
            var xhr_provider = function() {
                var xhr = $.ajaxSettings.xhr();
 
                if( xhr.upload ) { 
                    xhr.upload.addEventListener( 'progress', function(e) {
                        if(e.lengthComputable) {
                            console.log(e.loaded);
                        }
                    }, false);
                }   
                return xhr;
            };

            $.ajax( {
                url: '/mis/interface/upload',
                type : 'post',
                data: formData,
                contentType: false, 
                processData: false,
                xhr: xhr_provider
            } ).done( function( response ) {
                var errno = +response.errno,
                    url = response.data.url;

                if( !errno ) {
                    $( '.preview-img' ).show().html( '<img src="http://topicstc.idizcuzz.com/' + url + '" />' );
                    $( 'input.img' ).val( url );
                    return;
                }
                         
            } ).fail( function() {
                alert( '图片上传失败' );
            } );
        } );
    }
} );

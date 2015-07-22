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

            var title = $.trim( form.find( '.title' ).val() ),
                summary = $.trim( form.find( '.summary' ).val() ),
                time = $.trim( form.find( '.time' ).val() ),
                origin = $.trim( form.find( '.origin' ).val() ),
                origin_url = $.trim( form.find( '.origin_url' ).val() ),
                origin_logo = $.trim( form.find( '.origin_logo' ).val() ),
                img = form.find( 'input.img' ).val(),
                content = me.editor.getContent(); 

            if( !title.length ) {
                alert( '事件标题必须填写' );
                return false;
            }

            var data = {
                title : title,
                content : content,
                img : img,
                tip : tip,
                origin : origin,
                origin_url : origin_url,
                origin_logo : origin_logo
            };

            $.ajax( {
                url : '/mis/interface/article',
                method : 'POST',
                data : data
            } ).done( function( response ) {
                    
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

J.Package( {
    initialize : function( options ) {
        this.bindEvent();

        this.boxSize = {
            w : 240,
            h : 240
        };

        this.dragging = false;
        this.minSize = {};
        this.maxSize = {};
        this.currentSize = null;
        this.currentPosition = {};
        this.scale = 1;

        this.minScale = 1;

        this.img = null;

        this.imgSize = {};

        this.createCanvas();

        this.uploading = false;
    },

    createCanvas : function() {
        var canvas = document.createElement( 'canvas' );
        canvas.width = 240;
        canvas.height = 240;

        this.canvas = canvas;

        this.canvasContext = canvas.getContext( '2d' );
    },

    dataURLToBlob : function( dataURL ) {
        var byteCharacters = window.atob( dataURL ),
            i = 0,
            l = byteCharacters.length,
            slice,
            buffer = new ArrayBuffer( l ),
            byteArrays = new Uint8Array( buffer );

        for( ; i < l; i += 1 ) {
            byteArrays[ i ] = byteCharacters.charCodeAt( i );
        }
        return new Blob( [ byteArrays ], {
            type : 'image/png'
        } );
    },

    upload : function() {
        var me = this,
            pic = this.canvas.toDataURL( 'image/png' ),
            formData = new FormData();

        console.log( pic, this.dataURLToBlob( pic.replace( /^data:image\/png;base64,/, '' ) ) );

        formData.append( 'image', this.dataURLToBlob( pic.replace( /^data:image\/png;base64,/, '' ) ), 'avatar.png' );
        formData.append( 'csrf-token', $.cookie( 'CSRF-TOKEN' ) );

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

        this.uploading = true;
        $( '.uploading-cover' ).show();
 
        $.ajax( {
            url: '/settings/interface/uploadavatar',
            type : 'post',
            data: formData,
            contentType: false, 
            processData: false,
            xhr: xhr_provider
        } ).done( function( response ) { 
            var errno = +response.errno,
                url = response.data.url;

            this.uploading = false;
            $( '.uploading-cover' ).hide();
 
            if( !errno ) { 
                $( '.avatar' ).css( 'background-image', 'url(' + url + ')' );
                me.hideDialog();
                return;
            }   
     
        } ).fail( function() {
            alert( '图片上传失败' );
            this.uploading = false;
            $( '.uploading-cover' ).hide();
        } );
    },

    clip : function( callback ) {
        var me = this,
            image = new Image(),
            pos = this.currentPosition,
            scale = this.scale,
            size = this.imgSize;

        image.src = this.img.attr( 'src' ),

        // 当 position 中，大于0的值，无论是x 或者 y，应为 画布坐标
        image.addEventListener( 'load', function() {
            me.canvasContext.drawImage( 
                image, 
                Math.max( 0 - pos.x, 0 ) / scale,
                Math.max( 0 - pos.y, 0 ) / scale, 
                size.w,
                size.h,
                Math.max( 0, pos.x ),
                Math.max( 0, pos.y ),
                size.w * scale,
                size.h * scale
            );
            callback();
        }, false );
    },

    hideDialog : function() {
        var uploadDialog = $( '#upload-dialog' );
        uploadDialog.find( '.img-area .inner' ).html( '' );
        uploadDialog.hide();
    },

    bindEvent : function() {
        var me = this,
            btn = $( '.real-file-btn' ),
            uploadDialog = $( '#upload-dialog' );

        btn.on( 'change', function( e ) {
            var files = $( this ).get( 0 ).files;

            if( !files.length ) return false;

            me.readFile( files[ 0 ] );
            me.showDialog();
            $( this ).val( '' );
        } );

        uploadDialog.find( 'input.resize-bar' ).on( 'input change', function( e ) {
            var val = $( this ).val();            
            me.resize( val / 100 * 2 * me.minScale + me.minScale );
        } );

        uploadDialog.find( '.cancel' ).on( 'click', function( e ) {
            e.preventDefault();
            me.hideDialog();
        } );

        uploadDialog.find( '.save' ).on( 'click', function( e ) {
            e.preventDefault();
            if( me.uploading ) return false;
            me.clip( function() {
                me.upload();
            } );
        } );

        uploadDialog.find( '.img-cover' ).on( 'mousedown', function( e ) {
            me.dragging = true;
            me.dragPoint = {
                x : e.clientX,
                y : e.clientY
            };
        } );

        uploadDialog.on( 'mousemove', function( e ) {
            if( !me.dragging ) return;
            var x = e.clientX,
                y = e.clientY;

            var left = x - me.dragPoint.x + me.currentPosition.x,
                top = y - me.dragPoint.y + me.currentPosition.y;

            me.reposition( left, top );

        } );

        uploadDialog.on( 'mouseup', function( e ) {
            if( me.dragging ) {
                var x = e.clientX,
                    y = e.clientY;

                me.currentPosition = {
                    x : x - me.dragPoint.x + me.currentPosition.x,
                    y : y - me.dragPoint.y + me.currentPosition.y
                };

                me.dragging = false;
            }
        } );
    },

    readFile : function( file ) {
        var me = this;
        var reader = new FileReader();

        reader.onloadend = function( e ) {
            var res = e.target.result,
                w, h,
                minWidth, minHeight,
                img = $( '<img src=' + res + ' />' );

            me.img = img;

            $( '#upload-dialog .img-area .inner' ).html( '' ).append( img );

            w = img.width();
            h = img.height();

            me.imgSize = {
                w : w,
                h : h 
            };

            if( w < me.boxSize.w && h < me.boxSize.h ) {
                me.minSize = {
                    w : w,
                    h : h
                }
            } else {
                if( w == h ) {
                    me.minSize = {
                        w : me.boxSize.w,
                        h : me.boxSize.h
                    };
                } else if( w > h ) {
                    minWidth = me.boxSize.w;
                    minHeight = minWidth * h / w;
                    me.minSize = {
                        w : minWidth,
                        h : minHeight
                    };
                } else {
                    minHeight = me.boxSize.h;
                    minWidth = w / h * minHeight;
                    me.minSize = {
                        w : minWidth,
                        h : minHeight
                    }
                }
            }

            me.currentSize = {
                w : me.minSize.w,
                h : me.minSize.h
            };

            me.maxSize = {
                w : me.minSize.w * 2,
                h : me.minSize.h * 2
            }

            me.minScale = me.scale = me.minSize.w / me.imgSize.w;

            me.center();
            me.resize( me.scale );
        };

        reader.readAsDataURL( file );
    },

    resize : function( scale ) {
        this.scale = scale;
        this.currentSize = {
            w : this.imgSize.w * scale,
            h : this.imgSize.h * scale
        };
        this.img.css( 'transform', 'scale(' + scale + ')' );
    },

    /*
    setSize : function( w, h ) {
        var w = this.minSize.w,
            h = this.minSize.h;
        this.img.css( 'width', w ).css( 'height', h );
    },
    */

    reposition : function( left, top ) {
        this.img.css( 'left', left ).css( 'top', top );
    },

    center : function() {
        var left = ( this.boxSize.w - this.currentSize.w ) / 2,
            top = ( this.boxSize.h - this.currentSize.h ) / 2;

        this.currentPosition = {
            x : left,
            y : top
        };

        this.reposition( left, top );
    },

    showDialog : function() {
        $( '#upload-dialog' ).show();
    }
} );

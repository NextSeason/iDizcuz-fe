J.Package( {
    initialize : function( options ) {
        this.bindEvent();

        this.boxSize = {
            w : 240,
            h : 240
        };

        this.canvasWidth = 240;
        this.canvasHeight = 240;

        this.dragging = false;
        this.minSize = {};
        this.maxSize = {};
        this.currentPosition = {};
        this.lastPosition = {};
        this.scale = 1;

        this.minScale = 1;

        this.img = null;

        this.imgSize = {};

        this.createCanvas();

        this.uploading = false;
    },

    createCanvas : function() {
        var canvas = document.createElement( 'canvas' );
        canvas.width = this.canvasWidth;
        canvas.height = this.canvasHeight;
        this.canvasContext = ( this.canvas = canvas ).getContext( '2d' );
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

        formData.append( 'image', this.dataURLToBlob( pic.replace( /^data:image\/png;base64,/, '' ) ), 'avatar.png' );
        formData.append( 'csrf-token', $.cookie( 'CSRF-TOKEN' ) );

        var xhr_provider = function() {
            return $.ajaxSettings.xhr();
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

            me.uploading = false;
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

        this.canvasContext.clearRect( 0, 0, this.canvasWidth, this.canvasHeight );

        image.addEventListener( 'load', function() {
            me.canvasContext.save();
            me.canvasContext.translate( pos.x, pos.y );
            me.canvasContext.scale( scale, scale );
            me.canvasContext.drawImage( image, 0, 0, size.w, size.h );
            me.canvasContext.restore();
            callback();
        }, false );
    },

    hideDialog : function() {
        var uploadDialog = $( '#upload-dialog' );
        uploadDialog.find( '.img-area .inner' ).html( '' );
        uploadDialog.hide();
    },

    zoom : function() {
        var val = $( '#upload-dialog input.resize-bar' ).val(),
            scale = val / 100 * 2 * this.minScale + this.minScale;

        this.resize( scale );

        var x = this.lastPosition.x - ( scale - this.lastScale ) * this.imgSize.w / 2,
            y = this.lastPosition.y - ( scale - this.lastScale ) * this.imgSize.h / 2;
            
        this.reposition( x, y );
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
            uploadDialog.find( 'input.resize-bar' ).val( 0 );
            $( this ).val( '' );
        } );

        uploadDialog.find( 'input.resize-bar' ).on( 'input change', function( e ) {
            me.zoom();
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

            me.lastPosition = {
                x : me.currentPosition.x,
                y : me.currentPosition.y
            };
        } );

        uploadDialog.find( '.zoom-in' ).on( 'click', function( e ) {
            e.preventDefault();
            var val = +uploadDialog.find( 'input.resize-bar' ).val();
            val = Math.min( val + 10, 100 );
            uploadDialog.find( 'input.resize-bar' ).val( val );
            me.zoom();
        } );

        uploadDialog.find( '.zoom-out' ).on( 'click', function( e ) {
            e.preventDefault();
            var val = +uploadDialog.find( 'input.resize-bar' ).val();
            val = Math.max( val - 10, 0 );
            uploadDialog.find( 'input.resize-bar' ).val( val );
            me.zoom();
        } );

        uploadDialog.on( 'mousemove', function( e ) {
            if( !me.dragging ) return;
            var left = e.clientX - me.dragPoint.x + me.lastPosition.x,
                top = e.clientY - me.dragPoint.y + me.lastPosition.y;

            me.reposition( left, top );

        } );

        uploadDialog.on( 'mouseup', function( e ) {
            if( me.dragging ) {
                var x = e.clientX,
                    y = e.clientY;

                me.lastPosition = me.currentPosition;
                me.lastScale = me.scale; 

                me.dragging = false;
            }
        } );

    },

    readFile : function( file ) {
        var me = this;
        var reader = new FileReader();

        reader.onloadend = function( e ) {
            var res = e.target.result,
                w, h, minWidth, minHeight;

            me.img = $( '<img src=' + res + ' />' );

            me.img.on( 'load', function( e ) {
                $( '#upload-dialog .img-area .inner' ).html( '' ).append( me.img );

                w = me.img.width();
                h = me.img.height();
                me.imgSize = { w : w, h : h  };

                if( w < me.boxSize.w && h < me.boxSize.h ) {
                    me.minSize = { w : w, h : h }
                } else {
                    if( w == h ) {
                        me.minSize = { w : me.boxSize.w, h : me.boxSize.h };
                    } else if( w > h ) {
                        minWidth = me.boxSize.w;
                        minHeight = minWidth * h / w;
                        me.minSize = { w : minWidth, h : minHeight };
                    } else {
                        minHeight = me.boxSize.h;
                        minWidth = w / h * minHeight;
                        me.minSize = { w : minWidth, h : minHeight }
                    }
                }

                me.maxSize = { w : me.minSize.w * 2, h : me.minSize.h * 2 }
                me.minScale = me.scale = me.minSize.w / me.imgSize.w;

                me.center();
                me.resize( me.scale );
            } );
        };

        reader.readAsDataURL( file );
    },

    resize : function( scale ) {
        var w = this.imgSize.w * scale,
            h = this.imgSize.h * scale;

        this.scale = scale;

        //this.img.css( 'transform', 'scale(' + scale + ')' );
        this.img.css( 'width', w ).css( 'height', h );
    },

    reposition : function( left, top ) {
        this.currentPosition = {
            x : left,
            y : top
        };
        this.img.css( 'left', left ).css( 'top', top );
    },

    center : function() {
        var left = ( this.boxSize.w - this.imgSize.w * this.scale ) / 2,
            top = ( this.boxSize.h - this.imgSize.h * this.scale ) / 2;

        this.currentPosition = {
            x : left,
            y : top
        };

        this.lastPosition = this.currentPosition;
        this.lastScale = this.scale;

        this.reposition( left, top );
    },

    showDialog : function() {
        $( '#upload-dialog' ).show();
    }
} );

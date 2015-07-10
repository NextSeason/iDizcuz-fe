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

        this.img = null;
        this.imgSize = {};
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
            me.resize( val / 100 * 2 + 1 );
        } );

        uploadDialog.find( '.cancel' ).on( 'click', function( e ) {
            e.preventDefault();
            uploadDialog.find( '.img-area .inner' ).html( '' );
            uploadDialog.hide();
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

            me.center();
            me.setSize();
        };

        reader.readAsDataURL( file );
    },

    resize : function( scale ) {
        this.img.css( 'transform', 'scale(' + scale + ')' );
    },

    setSize : function( w, h ) {
        var w = this.minSize.w,
            h = this.minSize.h;
        this.img.css( 'width', w ).css( 'height', h );
    },

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

    getAdjustedImg : function() {
    },

    upload : function() {
        var formData = new FormData();

        formData.append( 'file', file );

        var xhr_provider = function() {
            var xhr = $.ajaxSettings.xhr();

            if( xhr.upload ) {
                xhr.upload.addEventListener( 'progress', function( e ) {
                }, false );
            }
            return xhr;
        };

        $.ajax( {
            url: '/common/interface/upload',
            type : 'post',
            data: formData,
            contentType: false,
            processData: false,
            xhr: xhr_provider,
        } );
    },
    showDialog : function() {
        $( '#upload-dialog' ).show();
    }
} );

J.Package( {
    initialize : function( options ) {

        this.accountId = +$( '#idizcuz' ).attr( 'data-account-id' );
        this.removePostDialog = $( '#remove-post-dialog' );

        this.bindEvent();
    },
    bindEvent : function() {
        var me = this;
        $( '.topic-area' ).on( 'click', '.op-btn', function( e ) {
            var action = $( this ).attr( 'data-action' );
            e.preventDefault();

            if( !+me.accountId && action != 'share' ) {
                me.redirect( 'signup' );
                return false;
            }
            me[ action + 'Action' ] && me[ action + 'Action' ]( $( this ) );
        } );

        $( '.topic-area' ).on( 'click', '.bubbles .close', function( e ) {
            e.preventDefault();
            $( this ).closest( '.bubbles' ).hide();
        } );

        $( '.topic-area' ).on( 'click', '.report-submit', function( e ) {
            e.preventDefault();
            if( !me.accountId ) {
                me.redirect( 'signup' );
                return false;
            }
            me.submitReport( $( this ) );
        } );

        $( '.topic-area' ).on( 'click', '.reply-to', function( e ) {
            e.preventDefault();
            if( !me.accountId ) {
                me.redirect( 'signin' );
                return false;
            }
            var postEl = me.getPostEl( $( this ) ),
                postId = postEl.attr( 'data-post-id' );

            $( '.to-line' ).show();
            $( 'input.to' ).val( postId );
            $( '.to-title' ).html( postEl.find( 'h2 a' ).html() );

            showEditorDialog();

        } );

        $( '.topic-area' ).on( 'click', '.remove-post', function( e ) {
            e.preventDefault();
            me.removePostDialog.show().find( 'input.post-id' ).val( me.getPostEl( $( this ) ).attr( 'data-post-id' ) );
        } );

        this.removePostDialog.find( '.cancel' ).on( 'click', function( e ) {
            e.preventDefault();
            me.hideRemovePostDialog();
        } );

        this.removePostDialog.find( '.confirm' ).on( 'click', function( e ) {
            e.preventDefault();
            var id = me.removePostDialog.find( 'input.post-id' ).val();
            me.removePost( id );
        } );
    },
    agreeAction : function( el ) {
        var postEl = this.getPostEl( el ),
            postId = postEl.attr( 'data-post-id' ),
            opinion = el.attr( 'data-intent' );

        $.ajax( {
            url : '/topic/interface/vote',
            method : 'POST',
            data : {
                post_id : postId,
                opinion : opinion,
                type : 0,
                value : 1
            }
        } ).done( function( response ) {
            var errno = +response.errno,
                o;

            if( errno ) { 
                if( errno == 3 ) {
                    me.redirect( 'signup' );
                }
                return false; 
            }

            o = +el.find( 'b' ).html();

            el.find( 'b' ).html( o + 1 );

        } );
    },

    markAction : function( el ) {
        var me = this,
            postEl = this.getPostEl( el ),
            postId = postEl.attr( 'data-post-id' ),
            markId = +el.attr( 'data-mark-id' ),
            data = {
                post_id : postId,
                act : +!markId,
                mark_id : markId
            };

        if( markId ) {
            el.removeClass( 'op-unmark' ).addClass( 'op-mark' ).attr( 'data-mark-id', 0 );
            el.html( '<i class="fa fa-star-o"></i> 收藏' );
            if( me.showingBubble( el ) == 'mark' ) me.hideBubble( el );
        }

        $.ajax( {
            url : '/topic/interface/mark',
            method : 'POST',
            data : data
        } ).done( function( response ) {
            var errno = +response.errno,
                data = response.data || {};

            if( errno ) {
            }

            if( +data.mark ) {
                el.removeClass( 'op-mark' ).addClass( 'op-unmark' ).attr( 'data-mark-id', data.mark );
                el.html( '<i class="fa fa-star"></i> 取消收藏' );
                me.showBubble( el );
            }
        } );

    },
    shareAction : function( el ) {
        var postEl = this.getPostEl( el );
        this.showBubble( el );
        if( !el.attr( 'data-has-qrcode' ) ) {
            new QRCode( postEl.find( '.qrcode' ).get( 0 ), {
                text : postEl.find( '.share-post-link' ).attr( 'href' ),
                width : 110,
                height : 110
            } );

            el.attr( 'data-has-qrcode', 1 );
        }
    },

    reportAction : function( el ) {
        this.showBubble( el );
    },
    showingBubble : function( el ) {
        return this.getPostEl( el ).find( '.op-bubbles' ).attr( 'data-showing' );
    },
    showBubble : function( el ) {
        var postEl = this.getPostEl( el ),
            bubbleEl = postEl.find( '.op-bubbles' ),
            action = el.attr( 'data-action' ),
            pos = el.position();

        bubbleEl.attr( 'data-showing', action );
     
        bubbleEl.find( '> .triangle' ).css( 'left', pos.left + el.width() / 2 - 10 );
        bubbleEl.hide();
        bubbleEl.find( '.box' ).hide();
        bubbleEl.find( '.' + action ).show();
        bubbleEl.show();
    },

    hideBubble : function( el ) {
        this.getPostEl( el ).find( '.op-bubbles' ).hide();
    },
    removePost : function( id ) {
        var me = this;

        $.ajax( {
            url : '/topic/interface/removepost',
            method : 'POST',
            data : {
                id : id
            }
        } ).done( function( response ) {
            var errno = +response.errno;

            if( errno > 0 ) {
                me.removePostDialog.find( '.tip' ).hide();
                me.removePostDialog.find( '.fail' ).show();
                return false;
            }

            me.removePostDialog.find( '.tip, .fail' ).hide();

            me.hideRemovePostDialog();
            $( '#post-' + id ).fadeOut( 'slow', function() {
                $( this ).remove();
            } );
        } );
    },

    hideRemovePostDialog : function() {
        this.removePostDialog.find( '.fail' ).hide();
        this.removePostDialog.find( '.tip' ).show();
        this.removePostDialog.find( 'input.post-id' ).val( '' );
        this.removePostDialog.hide();
    },

    submitReport : function( el ) {
        var postEl = this.getPostEl( el ),
            postId = postEl.attr( 'data-post-id' ),
            reportEl = el.closest( '.report' ),
            tipEl = el.parent().find( '.tip' );

        var checked = reportEl.find( 'input[type=radio]:checked' );

        if( !checked.length ) {
            tipEl.html( '请选择投诉原因' ).addClass( 'err' ); 
            return;
        }

        var reason = checked.val();

        var desc = $.trim( reportEl.find( 'textarea.desc' ).val() );

        $.ajax( {
            url : '/topic/interface/report',
            method : 'POST',
            data : {
                post_id : postId,
                reason : reason,
                desc : desc
            }
        } ).done( function( response ) {
            var errno = +response.errno;

            if( !errno ) {
                tipEl.removeClass( 'err' ).html( '您的投诉已经提交，我们会尽快为您处理。感谢您的支持' ); 

                return;
            }
            switch( errno ) {
                case 3 : 
                    tipEl.html( '您需要登录之后才可以进行举报' ).addClass( 'err' ); 
                    setTimeout( function() {
                        me.redirect( 'signup' );
                    }, 1000 );
                    break;
                case 14 : 
                    tipEl.html( '您已经提交过投诉，我们会尽快为您处理' ).addClass( 'err' ); 
                    break;
                default :
                    tipEl.html( '系统错误，请稍候再试' ).addClass( 'err' ); 
                    break;
            }
        } );
    },
    getPostEl : function( el ) {
        return el.closest( 'li.posts' );
    },

    getPostId : function( postEl ) {
        return postEl.attr( 'data-post-id' );
    },
    redirect : function( page ) {
        switch( page ) {
            case 'signup' :
                location.href = '/signup?r=' + encodeURIComponent( location.href );
                break;
            case 'signin' :
                location.href = '/signin?r=' + encodeURIComponent( location.href );
                break;
            default :
                break;
        }
    }
} );

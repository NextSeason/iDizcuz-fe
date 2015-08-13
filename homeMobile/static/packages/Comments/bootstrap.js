J.Package( {
    initialize : function( options ) {
        this.accountId = options.accountId;
        this.compiledTpl = J.template( $( '#comment-list-tpl' ).val() );
        this.container = $( '.post-list' );
        this.bindEvent();
        this.rn = 20;
    },
    bindEvent : function() {
        var me = this;
        this.container.on( 'click', '.comment-box .hide', function( e ) {
            e.preventDefault();
            $( this ).closest( '.comment-box' ).hide();
        } );

        this.container.on( 'click', '.comments', function( e ) {
            e.preventDefault();
            var el = me.getPostEl( $( this ) );
            el.find( '.comment-box' ).show();
            !+ me.getCursor( el ) && me.load( $( this ) );
        } );

        this.container.on( 'submit', 'form.comment-form', function( e ) {
            e.preventDefault();
            me.submit( me.getCommentFormEl( $( this ) ) );
        } );

        this.container.on( 'click', '.comment-item .reply', function( e ) {
            e.preventDefault();
            me.getCommentEl( $( this ) ).find( 'form.comment-form' ).show();

        } );

        this.container.on( 'click', '.comment-box .load-more', function( e ) {
            e.preventDefault();
            me.load( $( this ) );
        } );

        this.container.on( 'click', '.comment-box .clear', function( e ) {
            e.preventDefault();
            me.getCommentFormEl( $( this ) ).find( 'textarea' ).val( '' );
        } );
    },
    load : function( el ) {
        var me = this;
        var postEl = this.getPostEl( el ),
            postId = this.getPostId( postEl ),
            cursor = this.getCursor( postEl );

        $.ajax( {
            url : '/topic/interface/getcomments',
            data : {
                post_id : postId,
                cursor : cursor,
                rn : this.rn
            },
            success : function( response ) {
                var errno = +response.errno;

                if( !errno ) {
                    me.render( postEl, response.data.comments );
                }
            }
        } );
    },
    submit : function( el ) {
        var me = this;

        var postEl = this.getPostEl( el ),
            postId = this.getPostId( postEl ),
            accountId = +el.attr( 'data-account-id' ),
            commentId = el.attr( 'data-comment-id' ),
            content = $.trim( el.find( 'textarea.content' ).val() );

        if( !commentId ) commentId = 0;

        if( !content.length ) return false;

        $.ajax( {
            url : '/topic/interface/comment',
            type : 'POST',
            data : {
                content : content,
                post_id : postId,
                comment_id : commentId,
                'csrf-token' : $.fn.cookie( 'CSRF-TOKEN' )
            },
            success : function( response ) {
                var errno = +response.errno,
                    postEl = me.getPostEl( el ),
                    res,
                    data;

                if( !errno ) {
                    res = response.data;

                    data = {
                        id : res.comment_id,
                        account_id : res.account.id,
                        reply_account_id : accountId,
                        reply_comment_id : commentId,
                        content : content,
                        ctime : '刚刚',
                        account : {
                            id : res.account.id,
                            uname : res.account.uname
                        }
                    };

                    if( commentId ) {
                        data.reply_account = {
                            id : accountId,
                            uname : me.getCommentEl( el ).find( '.u-link' ).text()
                        }
                    }
                    var html = me.compiledTpl( { data : [ data ] } );
                    postEl.find( '.new-comment-list' ).append( html );
                    el.find( 'textarea.content' ).val( '' );
                    accountId && el.hide();
                    return;
                }

                switch( errno ) {
                    case 3 :
                        me.warn( '需要登录才可以评论' );
                        window.scrollTo( 0, 0 );
                        break;
                }

            },
            error : function() {
            }
        } );
    },
    render : function( el, data ) {
        var html = this.compiledTpl( { data : data } ),
            l = data.length;
        l && el.find( '.comments' ).attr( 'data-cursor', data[ l - 1 ].id );

        el.find( '.comment-list' ).append( html );

        if( l == this.rn ) {
            el.find( '.comment-box .load-more' ).show();
        } else {
            el.find( '.comment-box .load-more' ).hide();
        }
    },
    getPostEl : function( el ) {
        return el.closest( '.posts' );
    },
    getPostId : function( el ) {
        return el.attr( 'data-post-id' );
    },
    getCursor : function( el ) {
        return el.find( '.comments' ).attr( 'data-cursor' );
    },
    getCommentEl : function( el ) {
        return el.closest( '.comment-item' );
    },
    getCommentFormEl : function( el ) {
        return el.closest( 'form.comment-form' );
    },
    warn : function( txt ) {
        var dialog = $( '.tip-dialog' ),
            tip = dialog.find( '.tip' );

        tip.html( txt );
        dialog.show();

        setTimeout( function() {
             dialog.hide();
        }, 1500 );
    }
} );
 

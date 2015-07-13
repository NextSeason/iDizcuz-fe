J.Package( {

    initialize : function( options ) {
        this.compiledTpl = J.template( $( '#comments-list-tpl' ).val() );
        this.accountId = $( '#idizcuz' ).attr( 'data-account-id' );
        this.accountUname = $( '#idizcuz' ).attr( 'data-account-uname' );
        this.rn = 20;

        this.bindEvent();
    },
    bindEvent : function() {
        var me = this;

        $( '.topic-area' ).on( 'click', '.comments', function( e ) {
            e.preventDefault();
            me.commentsAction( $( this ) );
        } );

        $( '.topic-area' ).on( 'click', 'a.reply', function( e ) {
            e.preventDefault();
            var el = me.getCommentEl( $( this ) );
            el.find( '.reply-form' ).toggle();
        } );

        $( '.topic-area' ).on( 'click', 'a.remove-comment', function( e ) {
            e.preventDefault();
            var commentEl = me.getCommentEl( $( this ) ),
                id = commentEl.attr( 'data-comment-id' );

            me.removeComment( id );
        } );

        $( '.topic-area' ).on( 'click', 'a.complaint', function( e ) {
            e.preventDefault();
            var pos = $( this ).position();
            $( '#complain-box' )
                .css( 'left', pos.left )
                .css( 'top', pos.top + 20 )
                .show()
                .find( 'input.comment_id' ).val( me.getCommentEl( $( this ) ).attr( 'data-comment-id' ) );
        } );

        $( '.topic-area' ).on( 'click', '.comments-form .submit', function( e ) {
            e.preventDefault();
            me.submitComment( $( this ) );
        } );

        $( '#complain-box .cancel' ).on( 'click', function( e ) {
            e.preventDefault();
            $( '#complain-box' ).hide().find( 'textarea' ).val('');
        } );
    },
    removeComment : function( id ) {
        $.ajax( {
            url : '/topic/interface/removecomment',
            method : 'POST',
            data : {
                id : id
            }
        } ).done( function( response ) {
            $( '#comment-' + id ).remove();
        } );
    },
    commentsAction : function( el ) {
        var postEl = this.getPostEl( el ),
            commentsBoxEl = postEl.find( '.comments-box' );
        commentsBoxEl.toggle();
        if( commentsBoxEl.is( ':hidden' ) ) return;
        if( postEl.find( '.comments-list li' ).length ) return;

        this.getComments( postEl.attr( 'data-post-id' ), 1 );
    },

    getComments : function( postId, pn ) {
        var me = this,
            start = ( pn - 1 ) * this.rn;

        $.ajax( {
            url : '/topic/interface/getcomments',
            method : 'GET',
            data : {
                post_id : postId,
                start : start,
                rn : this.rn
            }
        } ).done( function( response ) {
            var errno = +response.errno;

            if( errno ) {
                return;
            }

            me.renderComments( postId, response.data.comments );

        } );
    },

    renderComments : function( postId, data ) {
        var postEl = $( '#post-' + postId ),
            commentsListEl = postEl.find( '.comments-list' ),
            html,
            i = 0,
            l = data.length;

        for( ; i < l; i += 1 ) {
            data[i].isSelf = ( data[i].account_id == this.accountId );
        }


        html = this.compiledTpl( { data : data } );

        postEl.find( '.comments-list' ).append( html );
        postEl.find( '.comments-box .loading' ).fadeOut( 'slow' );
    },


    submitComment : function( el ) {
        var me = this;

        var postEl = this.getPostEl( el ),
            postId = postEl.attr( 'data-post-id' ),
            commentId = el.attr( 'data-comment-id' ),
            accountId = el.attr( 'data-account-id' ),
            content = el.parent().find( 'input.comment' ).val(),
            data = {};

        if( !content.length ) {
            return false;
        }

        data.content = content;
        data.post_id = postId;

        if( accountId && commentId ) {
            data.account_id = accountId;
            data.comment_id = commentId;
        }

        $.ajax( {
            url : '/topic/interface/comment',
            method : 'POST',
            data : data
        } ).done( function( response ) {
            var errno = +response.errno,
                data;
        
            if( errno ) {
                switch( errno ) {
                    case 3 :
                        location.href = '/signin?r=' + encodeURIComponent( location.href );
                        break;
                    default :
                        break;
                }
                return false;
            }

            data = {
                id : response.data.comment_id,
                account_id : me.accountId,
                reply_account_id : accountId,
                reply_comment_id : commentId,
                content : content,
                ctime : '刚刚',
                account : {
                    id : me.accountId,
                    uname : me.accountUname
                }
            };

            if( accountId ) {
                data.reply_account = {
                    id : accountId,
                    uname : me.getCommentEl( el ).find( '.u-link' ).text()
                };
            }

            me.renderComments( postId, [ data ] );

            el.parent().find( '.comment' ).val( '' );
            accountId && el.parent().hide();

        } ).fail( function() {
            alert( '系统错误，请稍候再试' ); 
        } );

    },
    getCommentEl : function( el ) {
        return el.closest( '.comments-item' );
    },
    getPostEl : function( el ) {
        return el.closest( 'li.posts' );
    }
} );

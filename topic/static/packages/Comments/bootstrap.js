J.Package( {

    initialize : function( options ) {
        this.compiledTpl = J.template( $( '#comments-list-tpl' ).val() );
        this.paginationCompiledTpl = J.template( $( '#post-pagination-tpl' ).val() );
        this.accountId = $( '#idizcuz' ).attr( 'data-account-id' );
        this.accountUname = $( '#idizcuz' ).attr( 'data-account-uname' );
        this.rn = 10;

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
            el.find( '.reply-form .comment' ).focus();
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

        $( '.topic-area' ).on( 'submit', '.comments-form', function( e ) {
            e.preventDefault();
            me.submitComment( $( this ) );
        } );

        $( '#complain-box .cancel' ).on( 'click', function( e ) {
            e.preventDefault();
            $( '#complain-box' ).hide().find( 'textarea' ).val('');
        } );

        $( '.topic-area' ).on( 'click', '.comment-pagination a', function( e ) {
            e.preventDefault();
            var postEl = me.getPostEl( $( this ) );
            me.getComments( postEl.attr( 'data-post-id' ), $( this ).attr( 'data-pn' ) );  
            window.scrollTo( 0, postEl.find( '.comments-box' ).position().top );
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
            $( '#post-' + postId ).find( '.comments-list' ).html('');

            me.renderComments( postId, response.data.comments );

            me.renderPagination( postId, pn, response.data.total );

        } );
    },

    renderPagination : function( postId, pn, total ) {
        var totalPage = Math.ceil( total / this.rn ),
            i, list = [];

        if( totalPage == 1 ) return;

        var first = pn - 5,
            last = first + 9;

        if( first < 1 ) {
            last = Math.min( ( 1 - first ) + last, totalPage );
            first = 1;
        } else if( last > totalPage ) {
            first = Math.max( 1, first - ( last - totalPage ) );
            last = totalPage;
        }

        for( i = first; i <= last; i += 1 ) {
            list.push( { pn : i } );
        }

        var data = {
            current : pn,
            list : list,
            total : totalPage
        };

        var html = this.paginationCompiledTpl( { data : data } );

        $( '#post-' + postId ).find( '.comment-pagination' ).html( html ).show();
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
        postEl.find( '.comments-box .loading' ).fadeOut();
    },


    submitComment : function( el ) {
        var me = this;

        var postEl = this.getPostEl( el ),
            postId = postEl.attr( 'data-post-id' ),
            accountId = el.attr( 'data-account-id' ),
            commentId = el.attr( 'data-comment-id' ),
            content = el.find( 'input.comment' ).val(),
            data = {};

        if( !content.length ) {
            return false;
        }

        data.content = content;
        data.post_id = postId;

        commentId && ( data.comment_id = commentId );

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

            if( commentId ) {
                data.reply_account = {
                    id : accountId,
                    uname : me.getCommentEl( el ).find( '.u-link' ).text()
                };
            }

            me.renderComments( postId, [ data ] );

            el.find( '.comment' ).val( '' );
            accountId && el.hide();

        } ).fail( function() {
            alert( '系统错误，请稍候再试' ); 
        } );

    },
    getCommentEl : function( el ) {
        return el.closest( '.comments-item' );
    },
    getPostEl : function( el ) {
        return el.closest( '.posts' );
    }
} );

J.Package( {

    initialize : function( options ) {
        this.signin = options.signin;
        this.compiledTpl = J.template( $( '#comment-list-tpl' ).val() );
        this.accountId = $( '#idizcuz' ).attr( 'data-account-id' );
        this.accountUname = $( '#idizcuz' ).attr( 'data-account-uname' );
        this.container = options.container || $( '#idizcuz' );
        this.rn = 10;

        this.bindEvent();
    },
    bindEvent : function() {
        var me = this;

        this.container.on( 'click', '.comments', function( e ) {
            e.preventDefault();
            var el = me.getPostEl( $( this ) );
            el.find( '.comment-box' ).toggle();
            if( !+$( this ).attr( 'data-loaded' ) ) me.load( $( this ) );
            $( this ).attr( 'data-loaded', 1 );
        } );

        this.container.on( 'click', 'a.reply', function( e ) {
            e.preventDefault();
            var el = me.getCommentEl( $( this ) );
            el.find( '.reply-form' ).toggle();
            el.find( '.reply-form .comment' ).focus();
        } );

        this.container.on( 'focus', 'input.comment', function( e ) {
            me.signin || me.redirect();
        } );

        this.container.on( 'click', 'a.remove-comment', function( e ) {
            e.preventDefault();
            var commentEl = me.getCommentEl( $( this ) ),
                id = commentEl.attr( 'data-comment-id' );

            me.removeComment( id );
        } );

        /*
        this.container.on( 'click', 'a.complaint', function( e ) {
            e.preventDefault();
            var pos = $( this ).position();
            $( '#complain-box' )
                .css( 'left', pos.left )
                .css( 'top', pos.top + 20 )
                .show()
                .find( 'input.comment_id' ).val( me.getCommentEl( $( this ) ).attr( 'data-comment-id' ) );
        } );
        */

        this.container.on( 'submit', '.comment-form', function( e ) {
            e.preventDefault();

            if( $( this ).attr( 'data-submiting' ) == 'true' ) return false;
            me.submit( $( this ) );
        } );

        $( '#complain-box .cancel' ).on( 'click', function( e ) {
            e.preventDefault();
            $( '#complain-box' ).hide().find( 'textarea' ).val('');
        } );

        this.container.on( 'click', '.comment-box .load-more', function( e ) {
            e.preventDefault();
            me.load( $( this ) );
        } );
    },
    removeComment : function( id ) {
        $.ajax( {
            url : '/topic/interface/removecomment',
            method : 'POST',
            data : {
                id : id,
                'csrf-token' : $.cookie( 'CSRF-TOKEN' )
            }
        } ).done( function( response ) {
            $( '#comment-' + id ).remove();
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
            }
        } ).done( function( response ) {
            var errno = +response.errno;

            if( !errno ) {
                me.render( postEl, response.data.comments );
            }

        } );
    },

    render : function( el, data ) {
        var html = this.compiledTpl( { data : data } ),
            l = data.length;

        l && el.find( '.comments' ).attr( 'data-cursor', data[ l - 1 ].id );

        el.find( '.comment-list' ).append( html );
        el.find( '.comment-box .loading' ).hide();

        var loadMore = el.find( '.comment-box .load-more' );
        l == this.rn ? loadMore.show() : loadMore.hide();
    },


    submit : function( el ) {
        var me = this;

        var postEl = this.getPostEl( el ),
            postId = postEl.attr( 'data-post-id' ),
            accountId = +el.attr( 'data-account-id' ),
            commentId = el.attr( 'data-comment-id' ),
            content = el.find( '.comment' ).html().replace( '<div>', "\n<div>" );

        if( !content.length ) return false;
        if( !commentId ) commentId = 0;

        el.attr( 'data-submiting', 'true' );

        $.ajax( {
            url : '/topic/interface/comment',
            method : 'POST',
            data : {
                content : content,
                post_id : postId,
                comment_id : commentId,
                'csrf-token' : $.cookie( 'CSRF-TOKEN' )
            }
        } ).done( function( response ) {
            var errno = +response.errno,
                data,
                res;

            el.attr( 'data-submiting', 'false' );
        
            if( errno ) {
                switch( errno ) {
                    case 3 :
                        me.redirect();
                        break;
                    default :
                        break;
                }
                return false;
            }

            res = response.data;

            data = {
                id : res.comment_id,
                own : 1,
                account_id : res.account.id,
                reply_account_id : accountId,
                reply_comment_id : commentId,
                content : res.comment,
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
                };
            }

            var html = me.compiledTpl( { data : [ data ] } );
            postEl.find( '.new-comment-list' ).append( html );
            el.find( '.comment' ).html( '' );
            accountId && el.hide();

        } ).fail( function() {
            el.attr( 'data-submiting', 'false' );
            alert( '系统错误，请稍候再试' ); 
        } );

    },
    getCommentEl : function( el ) {
        return el.closest( '.comment-item' );
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
    redirect : function() {
        $( '#signin-dialog' ).show();
    }
} );

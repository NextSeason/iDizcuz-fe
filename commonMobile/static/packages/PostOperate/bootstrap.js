J.Package( {
    initialize : function( options ) {
        this.signin = !!options.signin;
        this.container = options.container || $( '#idizcuz' );
        this.bindEvent();
    },
    bindEvent : function() {
        var me = this;
        this.container.on( 'click', '.op-btn', function( e ) {
            if( +$( this ).attr( 'data-active' ) ) return false;

            var action = $( this ).attr( 'data-action' );

            if( !me.signin && +$( this ).attr( 'data-need-signin' ) ) {
                me.warn( '您需要登录才可以操作' );
                window.scrollTo( 0, 0 );
                return false;
            }

            if( !J.isUndefined( me[ action + 'Action' ] ) ) {
                me[ action + 'Action' ]( $( this ) );
                $( this ).attr( 'data-active', 1 );
            }
        } );
    },

    getPostEl : function( el ) {
        return el.closest( '.posts' );
    },
    getPostId : function( el ) {
        return el.attr( 'data-post-id' );
    },
    markAction : function( el ) {
        var me = this,
            postEl = this.getPostEl( el ),
            postId = this.getPostId( postEl ),
            act = +el.attr( 'data-marked' );


        $.ajax( {
            url : '/topic/interface/mark',
            type : 'POST',
            data : {
                post_id : postId,
                act : +!act,
                'csrf-token' : $.fn.cookie( 'CSRF-TOKEN' )
            },
            success : function( response ) {
                var errno = +response.errno;
                me.unactive( el );
                if( !errno ) {
                    if( act ) {
                        el.addClass( 'dark' ).attr( 'data-marked', +!act );
                    } else {
                        el.removeClass( 'dark' ).attr( 'data-marked', +!act );
                    }
                    return;
                }
            },
            error : function() {
                me.unactive( el );
                me.warn( '操作失败，请确保您的网络状况正常' );
            }
        } );

        

    },

    voteAction : function( el ) {
        var me = this,
            post = this.getPostEl( el ),
            postId = this.getPostId( post ),
            opinion = el.attr( 'data-intent' );

        $.ajax( {
            url : '/topic/interface/vote',
            type : 'POST',
            data : {
                post_id : postId,
                opinion : opinion,
                type : 0,
                value : 1,
                'csrf-token' : $.fn.cookie( 'CSRF-TOKEN' )
            },
            success : function( response ) {
                var errno = +response.errno,
                    o;

                me.unactive( el );
                if( errno ) {
                    if( errno == 3 ) {
                        me.warn( '您需要登录才可以操作' );
                        window.scrollTo( 0, 0 );
                    }
                    return false;
                }

                o = +el.find( 'b' ).html();
                el.find( 'b' ).html( o + 1 );
            },
            error : function() {
                me.unactive( el );
            }
        } );
    },
    unactive : function( el ) {
        el.attr( 'data-active', 0 );

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

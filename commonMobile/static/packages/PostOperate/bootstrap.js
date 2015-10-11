J.Package( {
    initialize : function( options ) {
        this.signin = !!options.signin;
        this.container = options.container || $( '#idizcuz' );
        this.dialog();
        this.bindEvent();
    },
    dialog : function() {
        this.dialog = $( [
            '<div class="dialog tip-dialog">',
                '<div class="wrap">',
                    '<div class="inner">',
                        '<p class="brand tip"></p>',
                    '</div>',
                '</div>',
            '</div>'
        ].join( '' ) );
        
        $( '#idizcuz' ).append( this.dialog );
    },
    bindEvent : function() {
        var me = this;
        this.container.on( 'click', '.op-btn', function( e ) {
            if( +$( this ).attr( 'data-active' ) ) return false;

            var action = $( this ).attr( 'data-action' );

            if( !me.signin && +$( this ).attr( 'data-need-signin' ) ) {
                e.preventDefault();

                me.tip( $( this ), '您需要登录才可以操作', function() {
                    window.scrollTo( 0, 0 );
                } );
                return false;
            }

            if( !J.isUndefined( me[ action + 'Action' ] ) ) {
                $( this ).attr( 'data-active', 1 );
                me[ action + 'Action' ]( $( this ) );
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
                me.tip( '操作失败，请检查网络状况' );
            }
        } );
    },
    voteAction : function( el ) {
        var me = this,
            postEl = this.getPostEl( el ),
            postId = this.getPostId( postEl ),
            opinion = +el.attr( 'data-intent' );

        if( +postEl.attr( 'data-is-own' ) ) {
            this.tip( el, '您不可以' + ( opinion ? '支持' : '反对' ) + '自己的论述' );
            this.unactive( el );
            return;
        }

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
                    switch( errno ) {
                        case 3 :
                            me.tip( el, '您需要登录才可以操作', function() {
                                window.scrollTo( 0, 0 );
                            } );
                            break;
                        case 12 :
                            me.tip( el, '您已评价过这条论述' );
                            break;
                        default :
                            me.tip( el, '操作失败，请稍候再试' );
                            break;
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

    tip : function( target, txt, callback ) {
        var tip = target.closest( '.op-item' ).find( '.bubbles' );

        tip.show().find( '.txt' ).html( txt );

        setTimeout( function() {
            tip.hide();
            callback && callback();
        }, 1500 );
    }
} );

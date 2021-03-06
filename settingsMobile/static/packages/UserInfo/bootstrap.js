J.Package( {
    initialize : function( options ) {
        this.bindEvent();

        this.submiting = false;
    },

    showError : function( txt ) {
        $( '.submit-tip' ).addClass( 'err' ).html( txt );
    },

    showTip : function( txt ) {
        $( '.submit-tip' ).removeClass( 'err' ).html( txt );
    },

    bindEvent : function() {
        var me = this;

        $( '.submit' ).on( 'click', function( e ) {
            e.preventDefault();
            if( me.submiting ) return false;

            var employment = $.trim( $( '.employment' ).val() ),
                position = $.trim( $( '.position' ).val() );
                desc = $.trim( $( '.desc' ).val() ),
                industry = $( '.industries' ).val(),
                sexEl = $( 'input[name=sex]' ),
                year = $( 'select.birth-year' ).val(),
                month = $( 'select.birth-month' ).val(),
                date = $( 'select.birth-date' ).val(),
                birth = [ year, month, date ].join( '-' ),
                i = 0,
                l = sexEl.length,
                sex = 0;


            for( ; i < l; i += 1 ) { 
                if( sexEl.get( i ).checked ) {
                    sex = sexEl.eq( i ).val();
                    break;
                }
            }

            if( employment.length > 20 ) {
                me.submiting = false;
                me.showError( '目前状况「公司/学校/组织机构」不能超过20字' );
                return false;
            }

            if( position.length > 10 ) {
                me.submiting = false;
                me.showError( '目前状况「职位」不能超过10字' );
                return false;
            }

            if( desc.length > 200 ) {
                me.submiting = false;
                me.showError( '个人简介不能超过10字' );
                return false;
            }

            me.submiting = true;
            me.showTip( '数据提交中...' );

            $.ajax( {
                url : 'settings/interface/updateinfo',
                type : 'POST',
                data : {
                    sex : sex,
                    industry : industry,
                    employment : employment,
                    position : position,
                    desc : desc,
                    birth : birth,
                    'csrf-token' : $.fn.cookie( 'CSRF-TOKEN' )
                },
                success : function( response ) {
                    me.submiting = false;
                    me.showTip( '保存成功' );
                },
                error : function() {
                    me.submiting = false;
                    me.showError( '数据提交失败，请稍候再试' );
                }
            } );
        } );
    }
} );

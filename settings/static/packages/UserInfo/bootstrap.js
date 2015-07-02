J.Package( {
    initialize : function( options ) {
        this.bindEvent();

        this.submiting = false;
    },

    showError : function( txt ) {
        $( '.tip' ).addClass( 'err' ).html( txt );
    },

    showTip : function( txt ) {
        $( '.tip' ).removeClass( 'err' ).html( txt );
    },

    bindEvent : function() {
        var me = this;

        $( '.submit' ).on( 'click', function( e ) {
            if( me.submiting ) return false;

            var employment = $.trim( $( '.employment' ).val() ),
                position = $.trim( $( '.position' ).val() );
                desc = $.trim( $( '.desc' ).val() ),
                industry = $( '.industries' ).val(),
                sex = $( 'input[name=sex][checked]' );

            sex = sex.length ? sex.val() : 0;

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
                method : 'POST',
                data : {
                    sex : sex,
                    industry : industry,
                    employment : employment,
                    position : position,
                    desc : desc
                }
            } ).done( function( response ) {
                me.submiting = false;
            } ).failed( function() {
                me.submiting = false;
                me.showError( '数据提交失败，请稍候再试' );
            } );
        } );
    }
} );

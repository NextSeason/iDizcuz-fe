(function(){
    var utils = UM.utils;
    function hrefStartWith(href, arr) {
        href = href.replace(/^\s+|\s+$/g, '');
        for (var i = 0, ai; ai = arr[i++];) {
            if (href.indexOf(ai) == 0) {
                return true;
            }
        }
        return false;
    }

    UM.registerWidget('link', {
        tpl : [
            '<div class="edui-link-div">',
                '<input id="edui-link-Jhref" type="text" placeholder="链接地址" />',
                '<input id="edui-link-Jtitle" type="text" placeholder="链接标题" />',
            '</div>'
        ].join( '' ),
        initContent: function (editor) {
            var lang = editor.getLang('link');
            if (lang) {
                var html = $.parseTmpl(this.tpl, lang.static);
            }
            this.root().html(html);
        },
        initEvent: function (editor, $w) {
            var link = editor.queryCommandValue('link');
            if(link){
                $('#edui-link-Jhref',$w).val(utils.html($(link).attr('href')));
                $('#edui-link-Jtitle',$w).val($(link).attr('title'));
            }
            $('#edui-link-Jhref',$w).focus();
        },
        buttons: {
            'ok': {
                exec: function (editor, $w) {
                    var href = $('#edui-link-Jhref').val().replace(/^\s+|\s+$/g, '');

                    if (href) {
                        if( !/^(https?|ftp):\/\//.test( href ) ) {
                            href = 'http://' + href;
                        }

                        editor.execCommand('link', {
                            'href': href,
                            'target': "_blank",
                            'title': $("#edui-link-Jtitle").val().replace(/^\s+|\s+$/g, ''),
                            '_href': href
                        });
                    }
                }
            },
            'cancel':{}
        },
        width: 400
    })
})();


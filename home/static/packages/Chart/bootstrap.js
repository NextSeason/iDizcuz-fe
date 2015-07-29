J.Package( {
    initialize : function( options ) {
        this.id = options.id;
        this.getData();
    },

    getData : function() {
        var me = this;
        $.ajax( {
            url : '/home/interface/topicpointsdata',
            data : {
                id : this.id,
                _t : +new Date
            }
        } ).done( function( response ) {
            var errno = +response.errno,
                data;

            if( !errno ) {
                data = response.data.points_data;
                me.render( me.formatData( data ) ); 
            }
        } );
    },

    formatData : function( data ) {
        var i = 0,
            l = data.length,
            index = 0;

        for( ; i < l; i += 1 ) {
            index = data[i].post_cnt * 10 + Math.floor( data[i].agree / 20 ) - Math.floor( data[i].disagree / 20 );
            data[i].index = Math.max( index, 0 );
        }

        return data;
    },
    render : function( points_data ) {
        var i = 0,
            l = points_data.length,
            colors = [
                '#E9733C', '#3BA1E0', '#CC3914'
            ],
            data = [],
            a2c = '一,二,三,四,五'.split( ',' );

        for( ; i < l; i += 1 ) {
            data.push( {
                name : '观点' + a2c[i],
                value : points_data[i].index,
                color : colors[i]
            } );
        }

        var chart = new iChart.Donut2D( {
            render : 'focus-chart',
            border : false,
            width : 300,
            height : 220,
            radius:140,
            animation : true,
            mutex : true,
            expand : true,
            center:{
                text:'iDizcuz',
                color:'#6f6f6f',
                fontsize : 12
            },
            data: data,
            tip:{
                 enable : false,
            },
            legend : {
                enable : false,
            },
            sub_option : {
                label : {
                    background_color:null,
                    sign:false,//设置禁用label的小图标
                    padding:'0 4',
                    border:{
                        enable:false,
                        color:'#666666'
                    },
                    fontsize:10,
                    fontweight : 'bold',
                    color : '#4572a7'
                },
                border : {
                    width : 2,
                    color : '#ffffff'
                }
            }
        } );
        chart.draw();
    }
} );

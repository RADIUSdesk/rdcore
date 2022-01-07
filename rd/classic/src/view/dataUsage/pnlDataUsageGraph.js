Ext.define('Rd.view.dataUsage.pnlDataUsageGraph', {
    extend  : 'Ext.panel.Panel',
    alias   : 'widget.pnlDataUsageGraph',
    margins : '0 0 0 0',
    plain   : true,
    border  : false,
    initComponent: function(){
        var me      = this;
        me.store    = Ext.create(Ext.data.Store,{model: 'Rd.model.mUserStat'});

        var chart = Ext.create('Ext.chart.CartesianChart',{
             insetPadding: {
                top     : 20,
                left    : 20,
                right   : 20,
                bottom  : 20
            },
            width: '100%',
            //theme       : 'custom', //FIXME FOR LATER to be fancy
            store       : me.store,
            axes: [
                {
                    type        : 'numeric',
                    position    : 'left',
                    adjustByMajorUnit: true,
                    grid        : true,
                    fields      : ['data_in', 'data_out'],
                    renderer    : function(axis, label, layoutContext) {
                        return Ext.ux.bytesToHuman(label);
                    },
                    minimum: 0
                }, {
                    type        : 'category',
                    position    : 'bottom',
                    grid        : false,
                    fields      : ['time_unit']
                }
            ],
            interactions: ['itemhighlight'],
            series: [
                {
                    type    : 'bar',
                    title   : [ 'Data In', 'Data out' ],
                    xField  : 'time_unit',
                    yField  : ['data_in', 'data_out'],
                    stacked : true,
                    style   : {
                        opacity: 0.80
                    },
                    highlight: {
                        fillStyle: 'yellow'
                    },
                    tooltip: {
                        renderer: function (tooltip, record, item) {
                            var di = Ext.ux.bytesToHuman(record.get("data_in"));
                            var dout = Ext.ux.bytesToHuman(record.get("data_out"));
                            tooltip.setHtml("Data in <b>"+di+"</b><br>Data out <b>"+dout+"</b>");    
                            
                        }
                    }
                }
            ]
        });
        
        me.items = chart;
        me.callParent(arguments);
    }
});

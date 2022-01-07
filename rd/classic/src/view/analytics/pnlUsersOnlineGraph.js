Ext.define('Rd.view.analytics.pnlUsersOnlineGraph', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.analytics.pnlUsersOnlineGraph',
    margins: '0 0 0 0',
    plain: true,
    border: false,
    initComponent: function () {
        var me = this;

        var chart = Ext.create('Ext.chart.CartesianChart', {
            insetPadding: {
                top: 20,
                left: 20,
                right: 20,
                bottom: 20
            },
            width: '50%',
            itemId: 'pnlUsersOnlineGraph',
            store: [],
            axes: [
                {
                    type: 'numeric',
                    position: 'left',
                    adjustByMajorUnit: false,
                    grid: true,
                    fields: ['Users'],
                    renderer: function (axis, label, layoutContext) {
                        return parseInt(label);
                    },
                    minimum: 0
                },
                {
                    type: 'category',
                    position: 'bottom',
                    grid: false,
                    fields: ['Day']
                }
            ],
            interactions: ['itemhighlight'],
            plugins: {
                ptype: 'chartitemevents',
                moveEvents: true
            },
            series: [
                {
                    type: 'bar',
                    title: ['Day'],
                    xField: 'Day',
                    yField: ['Users'],
                    stacked: true,
                    style: {
                        opacity: 0.80
                    },
                    highlight: {
                        fillStyle: 'yellow'
                    },
                    tooltip: {
                        renderer: function (tooltip, record, item) {
                            // var di = Ext.ux.bytesToHuman(record.get("data_in"));
                            // var dout = Ext.ux.bytesToHuman(record.get("data_out"));
                            tooltip.setHtml(record.get("Users") + " users online on " + record.get("Day") + " Total Data Used:" + Ext.ux.bytesToHuman(record.get("DataUsage")));

                        }
                    },
                    listeners: {
                        'itemmouseup': function (obj, record, item) {
                            
                            if(window.barClicked!=undefined){
                                window.barClicked(record.record.get("DataIn"),record.record.get("DataOut"),record.record.get("Day"));
                            }
                            //this.fireEvent("onBarClicked",obj);
                          //  Ext.globalEvents.fireEvent('onBarClicked', obj);

                        }
                    }
                }
            ]

        });

        me.items = chart;
        me.callParent(arguments);
    }
});


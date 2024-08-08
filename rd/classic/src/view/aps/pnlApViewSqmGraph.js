Ext.define('Rd.view.aps.pnlApViewSqmGraph', {
    extend  : 'Ext.panel.Panel',
    alias   : 'widget.pnlApViewSqmGraph',
    border  : false,
    layout  : {
        type    : 'vbox',         
        align   : 'stretch'
    },
    initComponent: function(){
    
        var me      = this; 
        var m       = 5;
        var p       = 5; 
           
        var sPie = Ext.create('Ext.data.Store', {
            fields: [
                { name: 'category', type: 'string' },
                { name: 'count',    type: 'int' }
            ]
        });
        
        var sLine = Ext.create('Ext.data.Store', {
            fields: [
                { name: 'bytes', type: 'int' },
                { name: 'packets', type: 'int' },
                { name: 'drops', type: 'int' },
                { name: 'overlimits', type: 'int' },
                { name: 'backlog', type: 'int' },
                { name: 'qlen', type: 'int' },
                { name: 'memory_used', type: 'int' },
                { name: 'peak_delay_us', type: 'int' },
                { name: 'avg_delay_us', type: 'int' },
                { name: 'base_delay_us', type: 'int' },
                { name: 'way_misses', type: 'int' },
                { name: 'way_indirect_hits', type: 'int' },
                { name: 'id', type: 'int' },
                { name: 'slot_start_txt', type: 'string' },
                { name: 'time_unit', type: 'string' },
                { name: 'processed', type: 'int' }
            ],
            data: [{
                
            }]
        });
        
        var crtPackets = Ext.create('Ext.chart.CartesianChart', {
            store: sLine,
            itemId  : 'crtPackets',
            margin  : m,
            padding : p,
            flex    : 1,
            axes: [
                {
                    type        : 'numeric',
                    position    : 'left',
                    adjustByMajorUnit: true,
                    grid        : true,
                    title: {
                        text: 'Count',
                        fontSize: 15
                    },
                    fields      : ['packets', 'drops', 'processed'],
                    minimum     : 0
                }, 
                {
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
                    title   : ['Packets'],
                    xField  : 'time_unit',
                    yField  : ['processed', 'drops'],
                    stacked : true,
                    style   : {
                        opacity: 0.80
                    },
                    highlight: {
                        fillStyle: 'yellow'
                    },
                    tooltip: {
                        renderer: function (tooltip, record, item) {
                            var p = record.get("processed");
                            var d = record.get("drops");                         
                            tooltip.setHtml("Processed <b>"+p+"</b><br>Dropped <b>"+d+"</b>");                                
                        }
                    }
                }
            ]
        });
        
        
       
        var crtPackets = Ext.create('Ext.chart.CartesianChart', {
            store: sLine,
            itemId  : 'crtPackets',
            margin  : m,
            padding : p,
            flex    : 1,
            axes: [
                {
                    type        : 'numeric',
                    position    : 'left',
                    adjustByMajorUnit: true,
                    grid        : true,
                    title: {
                        text: 'Count',
                        fontSize: 15
                    },
                    fields      : ['packets', 'drops', 'processed'],
                    minimum     : 0
                }, 
                {
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
                    title   : ['Packets'],
                    xField  : 'time_unit',
                    yField  : ['processed', 'drops'],
                    stacked : true,
                    style   : {
                        opacity: 0.80
                    },
                    highlight: {
                        fillStyle: 'yellow'
                    },
                    tooltip: {
                        renderer: function (tooltip, record, item) {
                            var p = record.get("processed");
                            var d = record.get("drops");
                            var bytes = Ext.ux.bytesToHuman(record.get('bytes'));
                            tooltip.setHtml("Processed <b>"+p+"</b><br>Dropped <b>"+d+"</b><br>Bytes <b>"+bytes+"</b>");    
                            
                        }
                    }
                }
            ]
        });
 
                 
        me.items = [
           {
                xtype   : 'panel',
                flex    : 1,
                border  : false,
                layout: {
                    type    : 'hbox',
                    align   : 'stretch'
                },
                items : [
                    {
                        flex            : 1,
                        xtype           : 'polar',
                        store           : sPie,
                        insetPadding    : 50,
                        innerPadding    : 20,
                        itemId          : 'plrPackets',
                        interactions    : ['rotate', 'itemhighlight'],
                        series          : [{
                            type        : 'pie',
                            angleField  : 'count',
                            label: {
                                field       : 'category',
                                display     : 'rotate',
                                contrast    : true,
                                font        : '18px Arial'
                            },
                            highlight   : true,
                            tooltip     : {
                                trackMouse: true,
                                renderer: function(tooltip, record, item) {
                                    tooltip.setHtml(record.get('category') + ': ' + record.get('count'));
                                }
                            }
                        }]                    
                    },
                    {
                        flex  : 2,  
                        xtype: 'cartesian',
                        reference: 'chart',
                        store: sLine,
                        axes: [{
                            type: 'numeric',
                            position: 'left',
                            title: {
                                text: 'Delay (us)',
                                fontSize: 15
                            }
                        }, {
                            type: 'category',
                            position: 'bottom',
                            title: {
                                text: 'Time',
                                fontSize: 15
                            },
                            fields: ['time_unit']
                        }],
                        series: [{
                            type: 'line',
                            xField: 'time_unit',
                            yField: 'peak_delay_us',
                            title: 'Peak Delay (us)',
                            marker: {
                                type: 'cross',
                                size: 4
                            },
                            highlight: {
                                size: 7,
                                radius: 7
                            },
                            tooltip: {
                                trackMouse: true,
                                renderer: function (tooltip, record, item) {
                                    tooltip.setHtml(record.get('time_unit') + ': ' + record.get('peak_delay_us') + ' us');
                                }
                            }
                        }, {
                            type: 'line',
                            xField: 'time_unit',
                            yField: 'avg_delay_us',
                            title: 'Average Delay (us)',
                            marker: {
                                type: 'circle',
                                size: 4
                            },
                            highlight: {
                                size: 7,
                                radius: 7
                            },
                            tooltip: {
                                trackMouse: true,
                                renderer: function (tooltip, record, item) {
                                    tooltip.setHtml(record.get('time_unit') + ': ' + record.get('avg_delay_us') + ' us');
                                }
                            }
                        }, {
                            type: 'line',
                            xField: 'time_unit',
                            yField: 'base_delay_us',
                            title: 'Base Delay (us)',
                            marker: {
                                type: 'square',
                                size: 4
                            },
                            highlight: {
                                size: 7,
                                radius: 7
                            },
                            tooltip: {
                                trackMouse: true,
                                renderer: function (tooltip, record, item) {
                                    tooltip.setHtml(record.get('time_unit') + ': ' + record.get('base_delay_us') + ' us');
                                }
                            }
                        }]
                    }                                  
                ]
            },
            crtPackets
        ];       
        
        me.callParent(arguments);
    }
});

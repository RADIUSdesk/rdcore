Ext.define('Rd.view.charts.pnlChartApData', {
    extend      : 'Ext.panel.Panel',
    xtype       : 'pnlChartApData',
    requires: [  
        'Rd.view.charts.vcChartApData',
        'Rd.view.aps.cmbAccessPointEntryPointReports'
    ],
    controller  : 'vcChartApData',
    apId        : '',
    listeners   : {
        afterrender : 'pnlAfterRender'
    
    },
    url         : '/cake3/rd_cake/ap-reports/view_data_usage.json',
    initComponent: function(){
        var me = this; 
                      
        //Create the store:
        var t = "Data usage";
              
        me.tbar = [
            { xtype: 'buttongroup', items : [
                { xtype: 'button',  glyph: Rd.config.icnReload ,scale: 'small', itemId: 'reload',   tooltip: i18n("sReload"),
                    listeners: {
                        click: 'onBtnReloadClick'
                    }
                },
                {
                    xtype       : 'cmbAccessPointEntryPointReports',
                    allowBlank  : false,
                    labelClsExtra: 'lblRdReq',
                    itemId      : 'ssid',
                    labelWidth  : 40,
                    addAll      : true,
                    apId        : me.apId,
                    listeners   : {
                        change : 'onCmbSsidChange'
                    }
                },
                { xtype: 'button', text: 'Hourly',   toggleGroup: 'time_n', enableToggle : true, scale: 'small', itemId: 'hour', pressed: true,
                    listeners: {
                        toggle: 'onBtnTimeToggled'
                    }
                 },
                { xtype: 'button', text: 'Daily',  toggleGroup: 'time_n', enableToggle : true, scale: 'small', itemId: 'day',
                    listeners: {
                        toggle:'onBtnTimeToggled'
                    }
                },
                { xtype: 'button', text: 'Weekly', toggleGroup: 'time_n', enableToggle : true, scale: 'small', itemId: 'week',
                    listeners: {
                        toggle: 'onBtnTimeToggled'
                    }
                } 
            ]},
             '->',
            {   
                xtype   : 'component', 
                itemId  : 'totals',  
                tpl     : 'In <b>{in}</b> Out <b>{out}</b> Total <b>{total}</b>',   
                style   : 'margin-right:5px', 
                cls     : 'lblRd' 
            }    
        ];
        
         me.store    = Ext.create(Ext.data.Store,{
            fields: [
                {name: 'id',           type: 'int'      },
                {name: 'time_unit',    type: 'string'   },
                {name: 'tx_bytes',     type: 'int'      },
                {name: 'rx_bytes',     type: 'int'      }
            ],
            proxy: {
                type        : 'ajax',
                format      : 'json',
                url         : me.url,
                reader      : {
                    keepRawData     : true,
                    type            : 'json',
                    rootProperty    : 'items',
                    messageProperty : 'message'
                }
            },
            listeners   : {
                beforeload  : function(s){
                    chart.setLoading(true);
                },
                load        : function(s){
                    chart.setLoading(false);
                    var rawData     = chart.getStore().getProxy().getReader().rawData;
                    var totalIn     = Ext.ux.bytesToHuman(rawData.totalIn);
                    var totalOut    = Ext.ux.bytesToHuman(rawData.totalOut);
                    var totalInOut  = Ext.ux.bytesToHuman(rawData.totalInOut);
                    me.down('#totals').update({'in': totalIn, 'out': totalOut, 'total': totalInOut });
                }
            },
            autoLoad: false    
        });
         
        var chart = Ext.create('Ext.chart.CartesianChart',{
             insetPadding: {
                top     : 10,
                left    : 10,
                right   : 10,
                bottom  : 10
            },
            width: '100%',
            store       : me.store,
            legend: {
                docked      : 'bottom'
            }, 
            axes: [
                {
                    type        : 'numeric',
                    position    : 'left',
                    adjustByMajorUnit: true,
                    grid        : true,
                    fields      : ['tx_bytes', 'rx_bytes'],
                    renderer    : function(axis, label, layoutContext) {
                      
                        return Ext.ux.bytesToHuman(label);
                    },
                    minimum: 0
                }, {
                    type    : 'category',
                    fields  : ['time_unit'],
                    position: 'bottom',
                    grid    : true,
                    label   : {
                        rotate: {
                            degrees: -45
                        }
                    }
                }
            ],
            series: [{
                    type: 'area',
                    title   : [ 'TX Bytes', 'RX Bytes' ],
                    xField  : 'time_unit',
                    yField  : ['tx_bytes', 'rx_bytes'],
                    style: {
                        opacity: 0.80
                    },
                    marker: {
                        opacity: 0,
                        scaling: 0.01,
                        fx: {
                            duration: 200,
                            easing: 'easeOut'
                        }
                    },
                    highlightCfg: {
                        opacity: 1,
                        scaling: 1.5
                    },
                    tooltip: {
                        trackMouse: true,
                        renderer: function (tooltip, record, item) {
                            var di = Ext.ux.bytesToHuman(record.get("tx_bytes"));
                            var dout = Ext.ux.bytesToHuman(record.get("rx_bytes"));
                            tooltip.setHtml("Data TX <b>"+di+"</b><br>Data RX <b>"+dout+"</b>");       
                        }
                    }
                }
            ]        
        });            
        me.items = chart;   
        me.callParent(arguments);
    }
});

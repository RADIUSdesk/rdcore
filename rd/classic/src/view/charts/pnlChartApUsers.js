Ext.define('Rd.view.charts.pnlChartApUsers', {
    extend      : 'Ext.panel.Panel',
    xtype       : 'pnlChartApUsers',
    requires: [  
        'Rd.view.charts.vcChartApUsers',
        'Rd.view.aps.cmbAccessPointEntryPointReports'
    ],
    controller  : 'vcChartApUsers',
    apId        : '',
    listeners   : {
        afterrender : 'pnlAfterRender'
    
    },
    url         : '/cake3/rd_cake/ap-reports/view_connected_users.json',
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
                tpl     : 'Users: <b>{users}</b>',   
                style   : 'margin-right:5px', 
                cls     : 'lblRd' 
            }   
        ];
          
        me.store    = Ext.create(Ext.data.Store,{
            fields: [
                {name: 'id',            type: 'int'      },
                {name: 'time_unit',     type: 'string'   },
                {name: 'users',         type: 'int'      }
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
                    var totalUsers  = rawData.totalUsers;
                    me.down('#totals').update({'users': totalUsers});
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
                    increment   : 1,
                    grid        : true,
                    fields      : ['users'],
                    minimum     : 0
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
            series: [
                {
                    type: 'area',
                    title   : [ 'Users'],
                    xField  : 'time_unit',
                    yField  : ['users'],
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
                            var d = record.get("users")
                            tooltip.setHtml("<b>"+d+"</b> Users");     
                        }
                    }
                }
            ]        
        });      
        me.items = chart;
        me.callParent(arguments);
    }
});

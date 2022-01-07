Ext.define('AmpConf.view.permanentUsers.PermanentUsersShow', {
    extend      : 'Ext.Panel',
    xtype       : 'PermanentUsers_show',
    controller  : 'PermanentUsersShowController',
    title       : 'Permanent User',
    config: {
        username : undefined,
        type     : 'permanent'
    }, 
    requires: [
        'Ext.chart.*',
        'Ext.chart.theme.Blue'
    ],
    
    layout  : 'fit',
    tbar        : [
        {
            iconCls     : 'x-fa fa-chevron-left',
            handler     : 'onExit'
        },
        '->',
        {
            iconCls     : 'x-fa fa-hourglass',
            text        : '1D',
            itemId      : 'span_1d',
            reference   : 'span_1d',
            enableToggle: true,
            handler     : 'onBtnTimeTap',
            allowDepress: false,
            pressed     : true,
            hidden      : true
        },
        {
            iconCls     : 'x-fa fa-hourglass',
            text        : '7D',
            itemId      : 'span_7d',
            reference   : 'span_7d',
            enableToggle: true,
            allowDepress: false,
            handler     : 'onBtnTimeTap',
            hidden      : true
        },
        {
            iconCls     : 'x-fa fa-hourglass',
            text        : '30D',
            itemId      : 'span_30d',
            reference   : 'span_30d',
            enableToggle: true,
            allowDepress: false,
            handler     : 'onBtnTimeTap',
            hidden      : true
        },
        {
            iconCls     : 'x-fa fa-sync',
            handler     : 'onRefreshTap'
        }
    ],
    initialize: function() {
        var me      = this;   
        me.store    = Ext.create(Ext.data.Store,{
            model: 'AmpConf.model.mUserStat',
            proxy: {
                type        : 'ajax',
                format      : 'json',
                url         : '/cake3/rd_cake/rd-clients/get-usage-graph.json',
                reader      : {
                    type            : 'json',
                    rootProperty    : 'items',
                    messageProperty : 'message',
                    keepRawData     : true
                }
            },
            listeners   : {
                metachange : function(store,meta_data,event){
                    me.getController().onStoreMetaChange(meta_data);
                }
            },
            autoLoad: false   
        });
        
        var t = {
                theme   : 'blue',
                width   : '100%',
                height  : '100%',
                xtype   : 'cartesian',
                shadow  : 'true',
                reference: 'chart',
                insetPadding: '20 10',
                store   : me.store,
                legend: {
                    type: 'sprite'
                }, 
                axes: [
                    {
                        type        : 'numeric',
                        position    : 'left',
                        adjustByMajorUnit: true,
                        grid        : true,
                        fields      : ['data_in', 'data_out'],
                        renderer    : function(axis, label, layoutContext) {
                            return AmpConf.util.Utilities.bytesToHuman(label);
                        },
                        minimum: 0
                    }, {
                        type        : 'category',
                        position    : 'bottom',
                        grid        : false,
                        fields      : ['time_unit']
                    }
                ],
                series: [
                    {
                        type    : 'area',
                        title   : [ 'Data In', 'Data out' ],
                        xField  : 'time_unit',
                        yField  : ['data_in', 'data_out'],
                        stacked : true,
                        style   : {
                            opacity: 0.80
                        },
                        marker: {
                        opacity: 0,
                        scaling: 0.01,
                        animation: {
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
                                var di      = AmpConf.util.Utilities.bytesToHuman(record.get("data_in"));
                                var dout    = AmpConf.util.Utilities.bytesToHuman(record.get("data_out"));
                                tooltip.setHtml("Data in <b>"+di+"</b><br>Data out <b>"+dout+"</b>");       
                            }
                        }
                    }
                ]
        };
        
        me.setItems([
            {
                xtype : 'tabpanel',
                reference : 'tabpanel',
                tabBar: {
                    docked: 'bottom',
                    defaults: {
                        iconAlign: 'top'
                    }
                },
                listeners: {
                    activeItemchange  : 'onTabActiveItemChange',
                    activate: 'onTabActiveItemChange'
                },
                items: [
                {
                    title   : 'Overview',
                    layout: {
                        type    : 'vbox',
                        align   : 'stretch'
                    },
                    padding : 5,                  
                    items   : [
                        {
                            xtype   : 'panel',
                            itemId  : 'pnlInfo',
                            height  : 170,
                            tpl     : new Ext.XTemplate(
                                '<div>',   
                                    '<ul class="fa-ul">',    
                                        "<li><i class='fa-li fa  fa-globe'></i> {realm}</li>",
                                        "<li><i class='fa-li fa  fa-cubes'></i> {profile}</li>",
                                        "<li><i class='fa-li fa  fa-star'></i><b>Created</b> {created}</li>",
                                        '<tpl if="Ext.isDefined(last_reject_time)">', 
                                            "<li style='color:#d1671b;'><i class='fa-li fa fa-exclamation-circle'></i> <b>Last Failed Login</b> {last_reject_time}</li>",
                                        "</tpl>",
                                        '<tpl if="Ext.isDefined(last_reject_message)">', 
                                            "<li style='color:#d1671b;'><i class='fa-li fa fa-exclamation-circle'></i> <b>Failed Login Message</b> {last_reject_message}</li>",
                                        "</tpl>",
                                        '<tpl if="Ext.isDefined(last_accept_time)">', 
                                            "<li style='color:green;'><i class='fa-li fa fa-check-circle'></i> <b>Last Good Login</b> {last_accept_time}</li>",
                                        "</tpl>",
                                        '<tpl if="Ext.isDefined(data_cap)">', 
                                            "<li><i class='fa-li fa fa-database'></i> <b>Data Cap</b> {data_cap}</li>",
                                        "</tpl>",
                                        '<tpl if="Ext.isDefined(data_used)">', 
                                            "<li style='color:blue;'><i class='fa-li fa fa-database'></i> <b>Data Used</b> {data_used}</li>",
                                        "</tpl>",
                                        '<tpl if="Ext.isDefined(time_cap)">', 
                                            "<li><i class='fa-li fa fa-clock'></i> <b>Time Cap</b> {time_cap}</li>",
                                        "</tpl>",
                                        '<tpl if="Ext.isDefined(time_used)">', 
                                            "<li style='color:blue;'><i class='fa-li fa fa-clock'></i> <b>Time Used</b> {time_used}</li>",
                                        "</tpl>",
                                    '</ul>',
                                '</div>'
                            )
                        },
                        {
                            xtype   : 'progressbarwidget',
                            itemId  : 'pbData',
                          //  text    : '<i class="fa  fa-database"></i> Data Usage',
                            height  : 40,
                         //   margin  : 5,
                         //   padding : 5,
                            //cls     : 'wifired',
                            value   : 1 
                        },
                        {
                            xtype   : 'progressbarwidget',
                            itemId  : 'pbTime',
                            text    : '<i class="fa fa-clock"></i> Time Usage',
                            height  : 40,
                            margin  : 5,
                            padding : 5,
                            //cls     : 'wifigreen',
                            value   : 0.2
                        } 
                    ],       
                    itemId  : 'tabOverview'
                },
                {
                    title   : 'Graphs',
                    items   : t,
                    itemId  : 'tabGraphs'
                }]
            }     
     
        ]);   
        me.callParent();
         
    },
    updateContent(item_id){
        //Update the content
        var me = this;
        me.getController().onUpdateContent(item_id);
    }   
});


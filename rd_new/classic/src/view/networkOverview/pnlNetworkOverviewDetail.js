Ext.define('Rd.view.networkOverview.pnlNetworkOverviewDetail', {
   extend      : 'Ext.panel.Panel',
    alias       : 'widget.pnlNetworkOverviewDetail',
	layout: {
        type    : 'vbox',
        pack    : 'start',
        align   : 'stretch'
    },
	bodyBorder  : false,
    requires    : [
    
    ],
    initComponent: function() {
        var me   = this;
        
        var data_graph = {
            xtype: 'cartesian',
            width: '100%',
            height: 300,
            store: {
                data: []
            },

            legend: {
                type: 'sprite',
                docked: 'bottom'
            },

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
            series: [{
                type    : 'bar',
                title   : [ 'Data In', 'Data out' ],
                xField  : 'time_unit',
                yField  : ['data_in', 'data_out'],
                stacked : true,
                style   : {
                    opacity: 0.80,
                    minGapWidth: 30
                },
                highlight: {
                    fillStyle: 'yellow'
                },
                style: {
                    opacity: 0.80,
                    minGapWidth: 30
                },
                tooltip: {
                    renderer: function (tooltip, record, item) {
                        var di = Ext.ux.bytesToHuman(record.get("data_in"));
                        var dout = Ext.ux.bytesToHuman(record.get("data_out"));
                        tooltip.setHtml("Data in <b>"+di+"</b><br>Data out <b>"+dout+"</b>");    
                        
                    }
                }
            }],

            plugins: {
                ptype: 'chartitemevents',
                moveEvents: true
            }
    };
    
    var plrOnline =  {
         xtype: 'polar',
         width: '100%',
         height: 200,

        interactions: ['rotate', 'itemhighlight'],
        innerPadding: 10,
        store: {
             fields: ['name', 'data1'],
             data: [{
                 name: '20 ONLINE',
                 data1: 30
             }, {
                 name: '20 OFFLINE',
                 data1: 20
             }]
         },

         series: {
             type: 'pie',
             highlight: true,
             angleField: 'data1',
             /*label: {
                 field: 'name',
                 display: 'rotate'
             },*/
             donut: 50
         },
         flex: 1
     };
        
        
              
        me.items = [
        {
            xtype       : 'container',
            layout      : 'hbox',
            scrollable  : true,
            flex        : 1,
            items       : [
                {
                    xtype       : 'panel',
                    itemId      : 'pnlMeshes',
                    title       : 'MESH NODES',
                    flex        : 1,
                    ui          : 'panel-blue',
                    padding     : 10,
                    glyph       : Rd.config.icnMesh,
                    items       : [
                        {
                            xtype   : 'container',
                            layout  : {
                                type    : 'hbox',                            
                                pack    : 'start',
                                align   : 'stretch'
                            },
                            items   : [
                                {
                                    xtype   : 'container',
                                    itemId  : 'cntInfo',
                                    tpl     : new Ext.XTemplate(
                                        '<div class="divInfo">',   
                                        '<h1 style="font-size:250%;font-weight:lighter;"><i class="fa fa-database"></i> {data_total}</h1>',       
                                        '<p style="font-size:110%;" class="txtGrey txtBold">',
                                            '<i class="fa fa-arrow-circle-down"></i> {data_in}',
                                            '&nbsp;&nbsp;&nbsp;&nbsp;',
                                            '<i class="fa fa-arrow-circle-up"></i> {data_out}',
                                        '</p>',
                                         '<h1 style="font-size:250%;font-weight:lighter;"><i class="fa fa-user"></i> {users}</h1>', 
                                        '</div>'
                                    ),
                                    data    : {
                                    },
                                    flex :1
                                },
                                plrOnline
                            ]
                        },
                        data_graph
                    ]
                },
                {
                    xtype       : 'panel',
                    itemId      : 'pnlAps',
                    title       : 'APs/ROUTERS',
                    flex        : 1,
                    ui          : 'panel-blue',
                    padding     : 10,
                    glyph       : Rd.config.icnSsid,
                    items       : [
                        {
                            xtype   : 'container',
                            layout  : {
                                type    : 'hbox',                            
                                pack    : 'start',
                                align   : 'stretch'
                            },
                            items   : [
                                {
                                    xtype   : 'container',
                                    itemId  : 'cntInfo',
                                    tpl     : new Ext.XTemplate(
                                        '<div class="divInfo">',   
                                        '<h1 style="font-size:250%;font-weight:lighter;"><i class="fa fa-database"></i> {data_total}</h1>',       
                                        '<p style="font-size:110%;" class="txtGrey txtBold">',
                                            '<i class="fa fa-arrow-circle-down"></i> {data_in}',
                                            '&nbsp;&nbsp;&nbsp;&nbsp;',
                                            '<i class="fa fa-arrow-circle-up"></i> {data_out}',
                                        '</p>',
                                         '<h1 style="font-size:250%;font-weight:lighter;"><i class="fa fa-user"></i> {users}</h1>', 
                                        '</div>'
                                    ),
                                    data    : {
                                    },
                                    flex :1
                                },
                                plrOnline
                            ]
                        },
                        data_graph
                    ]
                }
            ]
        } 
    ];
    me.callParent(arguments);
    }
});

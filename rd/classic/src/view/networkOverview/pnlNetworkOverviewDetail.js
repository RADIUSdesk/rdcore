Ext.define('Rd.view.networkOverview.pnlNetworkOverviewDetail', {
   extend      : 'Ext.panel.Panel',
    alias       : 'widget.pnlNetworkOverviewDetail',
	layout: {
        type    : 'hbox',
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
            flex:   1,
            store: {
                data: []
            },

            legend: false,

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
                colors: ['#56b3fa', '#3e8ebe' ], // Custom color set
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
                 colors: ['#009933', '#ffad33'], // specify colors for each slice
                 /*label: {
                     field: 'name',
                     display: 'rotate'
                 },*/
                 donut: 50
             },
             
            flex: 1
         };
         
         var pnlMeshes = {
            xtype       : 'panel',
            itemId      : 'pnlMeshes',
            title       : 'MESH NODES',
            flex        : 1,
            ui          : 'panel-blue',
            padding     : 10,
            glyph       : Rd.config.icnNetwork,
            layout      : {
                type    : 'vbox',
                align   : 'stretch'
            },
            items       : [
                {
                    xtype   : 'container',
                    layout  : {
                        type    : 'hbox',                            
                        pack    : 'start',
                        align   : 'stretch'
                    },
                    items   : [
                        plrOnline,
                        {
                            xtype   : 'container',
                            itemId  : 'cntInfo',

                            tpl     : new Ext.XTemplate(
                                '<div class="parent-div">',
                                  '<div class="sub-div-1">',
                                    '<p style="font-size:250%;font-weight:bolder;color:#29465b;"><i class="fa fa-laptop"></i> {users}</p>',
                                    "<tpl if='total_networks == total_networks_online'>",
                                        '<p style="font-size:130%;color:#808080;font-weight:bolder;">',
                                    "<tpl else>",
                                        '<p style="font-size:130%;color:#c27819;font-weight:bolder;">',
                                    "</tpl>",                                  
                                        '<i class="fa fa-share-alt"></i> {total_networks} NETWORKS ',
                                    "<tpl if='total_networks_online == 0'>",
                                       '({total_networks_online} <i class="fa fa-circle"></i>)',
                                    "<tpl else>",
                                        '<span style="color:green;">({total_networks_online} <i class="fa fa-circle"></i>)</span>',
                                    "</tpl>",
                                    '</p>',                                 
                                    "<tpl if='total_nodes == total_nodes_online'>",
                                        '<p style="font-size:130%;color:#808080;font-weight:bolder;">',
                                    "<tpl else>",
                                        '<p style="font-size:130%;color:#c27819;font-weight:bolder;">',
                                    "</tpl>",
                                        '<i class="fa fa-cube"></i> {total_nodes} NODES ',
                                    "<tpl if='total_nodes_online == 0'>",  
                                        '({total_nodes_online} <i class="fa fa-circle"></i>)',
                                    "<tpl else>",
                                        '<span style="color:green;">({total_nodes_online} <i class="fa fa-circle"></i>)</span>',
                                    "</tpl>",
                                    '</p>',
                                  '</div>',
                                  '<div class="sub-div-2">',
                                  '<p style="font-size:250%;font-weight:bolder;color:#29465b;"><i class="fa fa-database"></i> {data_total}</p>',
                                  '<p style="font-size:130%;color:#808080;font-weight:bolder;">',
                                    '<i class="fa fa-arrow-circle-down"></i> {data_in}',
                                    '&nbsp;&nbsp;&nbsp;&nbsp;',
                                    '<i class="fa fa-arrow-circle-up"></i> {data_out}',
                                  '</p>',
                                  '</div>',                                
                                '</div>'
                            ),
                            data    : {
                            },
                            flex :2
                        }
                        
                    ]
                },
                data_graph
            ]
        };
        
        var pnlAps = {
                        xtype       : 'panel',
            itemId      : 'pnlAps',
            title       : 'APs/ROUTERS',
           // hidden      : true,
            flex        : 1,
            ui          : 'panel-blue',
            padding     : 10,
            layout      : {
                type    : 'vbox',
                align   : 'stretch'
            },
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
                        plrOnline,
                        {
                            xtype   : 'container',
                            itemId  : 'cntInfo',
                            tpl     : new Ext.XTemplate(
                                '<div class="parent-div">',
                                  '<div class="sub-div-1">',
                                    '<p style="font-size:270%;font-weight:bolder;color:#29465b;"><i class="fa fa-laptop"></i> {users}</p>',
                                    "<tpl if='total_aps == total_aps_online'>",
                                        '<p style="font-size:130%;color:#808080;font-weight:bolder;">',
                                    "<tpl else>",
                                        '<p style="font-size:130%;color:#c27819;font-weight:bolder;">',
                                    "</tpl>",
                                    '<i class="fa fa-wifi"></i> {total_aps} AP ',
                                    "<tpl if='total_aps_online == 0'>",  
                                        '({total_aps_online} <i class="fa fa-circle"></i>)',
                                    "<tpl else>",
                                        '<span style="color:green;">({total_aps_online} <i class="fa fa-circle"></i>)</span>',
                                    "</tpl>",
                                    '</p>',
                                  '</div>',
                                  '<div class="sub-div-2">',
                                  '<p style="font-size:270%;font-weight:bolder;color:#29465b;"><i class="fa fa-database"></i> {data_total}</p>',
                                  '<p style="font-size:130%;color:#808080;font-weight:bolder;">',
                                    '<i class="fa fa-arrow-circle-down"></i> {data_in}',
                                    '&nbsp;&nbsp;&nbsp;&nbsp;',
                                    '<i class="fa fa-arrow-circle-up"></i> {data_out}',
                                  '</p>',
                                  '</div>',                                
                                '</div>'
                            ),
                            data    : {
                            },
                            flex :2
                        },
                    ]
                },
                data_graph
            ]
        };
                     
        me.items = [ pnlMeshes, pnlAps ];

        me.callParent(arguments);
    }
});

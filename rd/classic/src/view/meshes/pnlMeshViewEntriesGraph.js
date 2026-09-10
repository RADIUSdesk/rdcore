Ext.define('Rd.view.meshes.pnlMeshViewEntriesGraph', {
    extend  : 'Ext.panel.Panel',
    alias   : 'widget.pnlMeshViewEntriesGraph',
    border  : false,
    layout: {
        type    : 'vbox',
        align   : 'stretch'
    },
    bodyStyle: {backgroundColor : 'pink' },
    hide_owner  : false,
    requires: [
        'Rd.view.meshes.pnlMeshViewDeviceDetail',
        'Rd.view.dataUsage.pnlDataUsageGraph',
        'Rd.view.meshes.winMeshEditMacFirewall'
    ],
    height  : 550,
    hidePlrNodes : true,
    initComponent: function(){
    
        var me      = this; 
        var m       = 5;
        var p       = 5;   
        var s       = Ext.create('Ext.data.Store', {
            fields  :[ 
                {name: 'id',            type: 'int'},
                {name: 'name',          type: 'string'},
                {name: 'alias',         type: 'string'},
                {name: 'mac',           type: 'string'},
                {name: 'vendor',        type: 'string'},
                {name: 'data_in',       type: 'int'},
                {name: 'data_out',      type: 'int'},
                {name: 'data_total',    type: 'int'}
            ]
        });
        
        var s_nodes   = Ext.create('Ext.data.Store', {
            fields  :[ 
                {name: 'id',            type: 'int'},
                {name: 'name',          type: 'string'},
                {name: 'data_in',       type: 'int'},
                {name: 'data_out',      type: 'int'},
                {name: 'data_total',    type: 'int'}
            ]
        });
        
        var bottom_items = [
            {
                xtype   : 'pnlDataUsageGraph',
                flex    : 2,
                margin  : m,
                padding : p,
                layout  : 'fit',
                border  : false
                
            }
        ];
                 
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
                        xtype   : 'panel',
                        margin  : m,
                        padding : p,
                      //  flex    : 1,
                        cls     : 'mesh-card',
                        layout  : 'fit',
                        border  : true,
                        width   : 300,
                        itemId  : 'total',
                        tpl     : [
                            '<div class="mesh-usage-card">',

                                '<div class="mesh-usage-title">',
                                    '<tpl if="graph_item==\'ssid\'">',
                                        '<i class="fa fa-wifi"></i>',
                                        '<span>{ssid}</span>',
                                    '</tpl>',

                                    '<tpl if="graph_item==\'device\'">',
                                        '<i class="fa fa-laptop"></i>',
                                        '<span>{mac}</span>',
                                    '</tpl>',

                                    '<tpl if="graph_item==\'node\'">',
                                        '<i class="fa fa-cube"></i>',
                                        '<span>{node}</span>',
                                    '</tpl>',
                                '</div>',

                                '<div class="mesh-usage-total">',
                                    '<i class="fa fa-database"></i>',
                                    '<span>{data_total}</span>',
                                '</div>',

                                '<div class="mesh-usage-caption">',
                                    'Total Data',
                                '</div>',

                                '<div class="mesh-usage-breakdown">',

                                    '<div class="mesh-usage-stat">',
                                        '<div class="mesh-usage-stat-value">',
                                            '<i class="fa fa-arrow-circle-down"></i>',
                                            '<span>{data_in}</span>',
                                        '</div>',
                                        '<div class="mesh-usage-stat-label">',
                                            'Download',
                                        '</div>',
                                    '</div>',

                                    '<div class="mesh-usage-stat">',
                                        '<div class="mesh-usage-stat-value">',
                                            '<i class="fa fa-arrow-circle-up"></i>',
                                            '<span>{data_out}</span>',
                                        '</div>',
                                        '<div class="mesh-usage-stat-label">',
                                            'Upload',
                                        '</div>',
                                    '</div>',

                                '</div>',

                            '</div>'
                        ],                  
                        data    : {
                        }
                    },
                  /*  {
                        flex            : 1,
                        margin          : m,
                        padding         : p,
                        border          : true,
                        cls             : 'mesh-card',
                        itemId          : 'plrTopTen',
                        xtype           : 'polar',
                        innerPadding    : 10,
                        interactions    : ['rotate', 'itemhighlight'],
                        store           : s,
                        series: {
                           type         : 'pie',                       
                           highlight    : true,
                           angleField   : 'data_total',
                           label        : {
                               field    : 'name',
                               display  : 'rotate'
                           },
                           donut        : 25,    
                           tooltip : {
                                trackMouse: true,
                                renderer: function (tooltip, record, item) {
                                    tooltip.setHtml(
                                        "<h2>"+record.get('mac')+"</h2><h3>"+Ext.ux.bytesToHuman(record.get('data_total'))+"</h3>"                           
                                    );
                                }
                            }    
                        }
                    },*/
                    {
                        flex        : 1,
                        margin      : m,
                        padding     : p,
                        border      : true,
                        cls         : 'mesh-card',
                        itemId      : 'plrTopTen',
                        xtype       : 'cartesian',

                        flipXY      : true,

                        store       : s,

                        interactions: ['itemhighlight'],

                        axes: [
                            {
                                type    : 'numeric',
                                position: 'bottom',
                                fields  : 'data_total',
                                renderer    : function(axis, label, layoutContext) {
                                    return Ext.ux.bytesToHuman(label);
                                },
                                grid: true,
                                label  : Rd.config.rdGraphLabel
                            },
                            {
                                type    : 'category',
                                position: 'left',
                                fields  : 'name',
                                renderer: function(axis, name) {
                                    return Ext.String.ellipsis(String(name), 15);
                                },
                                label       : Rd.config.rdGraphLabel
                            }
                        ],

                        series: [
                            {
                                type     : 'bar',
                                xField   : 'name',
                                yField   : 'data_total',
                              //  colors   : Rd.config.rdGraphBarColors, // Custom color set
                                highlight: true,

                                style: {
                                    opacity: 0.85,
                                    minGap : 2
                                },
                                renderer: function (sprite, config, rendererData, index) {
                                    return {
                                        fillStyle: Rd.config.rdGraphBarColors[index % Rd.config.rdGraphBarColors.length]
                                    };
                                },

                                tooltip: {
                                    trackMouse: true,

                                    renderer: function(tooltip, record) {
                                        tooltip.setHtml(
                                            '<b>' + record.get('name') + '</b><br>' +
                                            Ext.ux.bytesToHuman(record.get('data_total'))
                                        );
                                    }
                                }
                            }
                        ]
                    },
                    {
                        xtype           : 'pnlMeshViewDeviceDetail',
                        margin          : m,
                        padding         : p,
                        hidden          : true,
                        cls             : 'mesh-card',
                        flex            : 1,
                        itemId          : 'pnlMeshViewUser'  
                    },
                    
                    {
                        xtype   : 'grid',
                        margin  : m,
                        padding : p,
                        ui      : 'light',
                        cls     : 'mesh-card', //No effect check CSS
                        title   : 'Top 10 Devices',
                        glyph   : Rd.config.icnUser,
                        itemId  : 'gridTopTen',
                        border  : true,       
                        store   : s,
                        emptyText: 'No Devices',
						multiSelect	: true,
                        tools   : [
                            {
                                tooltip : 'Create Alias',
                                itemId  : 'toolAlias',
                                glyph   : Rd.config.icnEdit
                            },
                            {
                                tooltip : 'Apply Firewall Profile',
                                itemId  : 'toolFirewall',
                                glyph   : Rd.config.icnFire
                            },
                            {
                                tooltip : 'Limit Speed',
                                itemId  : 'toolLimit',
                                glyph   : Rd.config.icnSpeed
                            },
                            {
                                tooltip : 'Block Device',
                                itemId  : 'toolBlock',
                                glyph   : Rd.config.icnBan
                            }
                        ],
                        columns: [
                            { 
                            	text		: 'Alias / MAC Address',
                            	dataIndex	: 'name',
                            	flex		: 1,
                            	hidden		: false,
                            	xtype       : 'templatecolumn',
								tpl         : new Ext.XTemplate(
								    '<tpl if="cloud_flag & block_flag">',
								    	'<tpl if="alias">{alias}<tpl else>{mac}</tpl>',
								        '   <span style="font-size:larger;color:#cc6600;"><i class="fa fa-cloud"></i>  <i class="fa fa-ban"></i></span>',
								   	'<tpl elseif="cloud_flag & firewall_flag">',
								    	'<tpl if="alias">{alias}<tpl else>{mac}</tpl>',
								    	'   <span style="font-size:larger;color:#cc6600;"><i class="fa fa-cloud"></i>  <span style="font-family:FontAwesome;">&#xf06d;</span> {fw_profile}</span>',
								    '<tpl elseif="cloud_flag & limit_flag">',
								    	'<tpl if="alias">{alias}<tpl else>{mac}</tpl>',
								    	'   <span style="font-size:larger;color:#cc6600;"><i class="fa fa-cloud"></i>  <span style="font-family:FontAwesome;">&#xf0e4;</span> <br>(<i class="fa fa-arrow-circle-down"></i> {bw_down} / <i class="fa fa-arrow-circle-up"></i> {bw_up} )</span>',
								    '<tpl elseif="block_flag">',
								    	'<tpl if="alias">{alias}<tpl else>{mac}</tpl>',
								        '   <span style="font-size:larger;color:#cc6600;"><i class="fa fa-ban"></i></span>',
								  	'<tpl elseif="firewall_flag">',
								    	'<tpl if="alias">{alias}<tpl else>{mac}</tpl>',
								        '   <span style="font-size:larger;color:#cc6600;"><span style="font-family:FontAwesome;">&#xf06d;</span> {fw_profile}</span>',
								    '<tpl elseif="limit_flag">',
								    	'<tpl if="alias">{alias}<tpl else>{mac}</tpl>',
								        '   <span style="font-size:larger;color:#cc6600;"><span style="font-family:FontAwesome;">&#xf0e4;</span> <br>(<i class="fa fa-arrow-circle-down"></i> {bw_down} / <i class="fa fa-arrow-circle-up"></i> {bw_up} )</span>',
								    '<tpl else>',
								        '<tpl if="alias">{alias}<tpl else>{mac}</tpl>',
								    '</tpl>'
								)   
                            },                          
                            { text: 'Vendor',               dataIndex: 'vendor', flex: 1,  hidden: true},
                            { text: 'MAC',                  dataIndex: 'mac',    flex: 1,  hidden: true},
                            { text: 'Data In',   dataIndex: 'data_in',  hidden: true, renderer: function(value){
                                    return Ext.ux.bytesToHuman(value)              
                                } 
                            },
                            { text: 'Data Out',  dataIndex: 'data_out', hidden: true,renderer: function(value){
                                    return Ext.ux.bytesToHuman(value)              
                                } 
                            },
                            { text: 'Data Total',dataIndex: 'data_total',tdCls: 'gridMain',renderer: function(value){
                                    return Ext.ux.bytesToHuman(value)              
                                } 
                            }
                        ],
                        flex: 1
                    }
                ]
            },
            {
                xtype   : 'panel',
                flex    : 1,
                border  : false,
                layout: {
                    type    : 'hbox',
                    align   : 'stretch'
                },
                items   : [
                    {
                        xtype   : 'pnlDataUsageGraph',
                        flex    : 2,
                        margin  : m,
                        padding : p,
                        layout  : 'fit',
                        border  : false
                        
                    },
                    {
                        flex            : 1,
                        margin          : m,
                        padding         : p,
                        border          : false,
                        itemId          : 'plrNodes',
                        xtype           : 'polar',
                        innerPadding    : 10,
                        hidden          : me.hidePlrNodes,
                        interactions    : ['rotate', 'itemhighlight'],
                        store           : s_nodes,
                        series: {
                           type         : 'pie',                       
                           highlight    : true,
                           angleField   : 'data_total',
                           label        : {
                               field    : 'name',
                               display  : 'rotate'
                           },
                           donut        : 10,    
                           tooltip : {
                                trackMouse: true,
                                renderer: function (tooltip, record, item) {
                                    tooltip.setHtml(
                                        "<h2>"+record.get('name')+"</h2><h3>"+Ext.ux.bytesToHuman(record.get('data_total'))+"</h3>"                           
                                    );
                                }
                            }    
                        }
                    }
                ]
            }
        ];       
        
        me.callParent(arguments);
    }
});

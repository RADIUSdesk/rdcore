Ext.define('Rd.view.networkOverview.gridNetworkOverviewMesh' ,{
    extend      : 'Ext.grid.Panel',
    alias       : 'widget.gridNetworkOverviewMesh',
    stateful    : true,
    stateId     : 'StateGNOM',
    stateEvents : ['groupclick','columnhide'],
    border      : false,
    requires    : [
        'Rd.view.networkOverview.vcNetworkOverviewMesh'
    ],
    controller  : 'vcNetworkOverviewMesh',
    viewConfig: {
        loadMask    :true
    },
    dockedItems : [{
        xtype   : 'toolbar',
        dock    : 'top',
        frame   : true,
        border  : true,
        items   : [
                { 
                    xtype   : 'button',
                    glyph   : Rd.config.icnReload ,
                    scale   : 'small', 
                    itemId  : 'reload',
                    tooltip : i18n('sReload'),
                    ui      : 'button-orange',
                    listeners : {
                        click: 'onClickReloadButton'
                    }
                },  
                '|',
                 { 
                    xtype       : 'button', 
                    scale       : 'small',
                    toggleGroup : 'timeSpanDash',
                    pressed     : true,			
                    text        : 'NOW',
                    ui          : 'button-metal',
                    listeners   : {
                        click: 'onClickNowButton'
                    }
                },                           
                { 
                    xtype       : 'button', 
                    scale       : 'small',
                    toggleGroup : 'timeSpanDash',		
                    text        : '24 Hours',
                    ui          : 'button-metal',
                    listeners   : {
                        click: 'onClickDayButton'
                    }
                },
                { 
                    xtype       : 'button',
                    ui          : 'button-metal', 
                    text        : '7 Days',
                    toggleGroup : 'timeSpanDash',   
                    scale       : 'small',
                    listeners   : {
                         click: 'onClickWeekButton'
                    }
                },
                { 
                    xtype       : 'button', 
                    text        : '30 Days',
                    toggleGroup : 'timeSpanDash',
                    ui          : 'button-metal',
                    scale       : 'small',
                    listeners   : {
                         click: 'onClickMonthButton'
                    }
                },
                '|',
                 {

                    xtype       : 'textfield',
                    emptyText   : 'Filter Results',
                    itemId      : 'filterName',
                    listeners: {
                        change: 'onFilterNameChange'
                    }            
                }, 
                '|',
                 { 
                    xtype       : 'button', 
                    glyph       : Rd.config.icnView,
                    scale       : 'small',
                    tooltip     : 'View Mesh',
                    listeners   : {
                         click: 'onClickViewButton'
                    }
                }  
            ]
        }
    ],
    columns  : [
        { text: i18n('sName'),      dataIndex: 'name',          tdCls: 'gridMain', flex: 1,stateId: 'StateGNOM2'},
		{
			text: 'Avail',
			width: 75,
			dataIndex: 'uptimhistpct',
			align: 'center',
			xtype: 'widgetcolumn',
			stateId		: 'StateGMO2a',
			sortable: false,
			widget: {
				xtype: 'sparklinepie',
				sliceColors: [ '#0e0', '#b21111' ],
				centered: true,
				tipTpl: 'Avg: {value:number("0.0")} ({percent:number("0.0")}%)'
			}
		},
        { 
            text        : '<i class="fa fa-user"></i> '+Rd.config.meshUsers,  
            dataIndex   : 'users',      
            stateId     : 'StateGNOM3',
            sortable    : false,
            xtype       : 'templatecolumn',
            width       : Rd.config.gridNumberCol,
            tpl         : new Ext.XTemplate(
                "<tpl><div class=\"fieldGrey\">{users}</div></tpl>"
            ) 
        },
        { 
            text        : '<i class="fa fa-database"></i> '+Rd.config.meshData,  
            dataIndex   : 'data',      
            stateId     : 'StateGNOM4',
            sortable    : false,
            xtype       : 'templatecolumn',
            width       : Rd.config.gridNumberCol,
            tpl         : new Ext.XTemplate(
                "<tpl><div class=\"fieldGrey\">{data}</div></tpl>"
            ) 
        },          
        { 
            text        : '<i class="fa fa-plus-circle"></i> '+Rd.config.meshNodes,
            dataIndex   : 'node_count',    
            xtype       : 'templatecolumn', 
            sortable    : false,
            tpl         : new Ext.XTemplate(
                        "<tpl><div class=\"fieldGreyWhite\">{node_count}</div></tpl>"
                    ),  
            stateId     : 'StateGNOM5', 
            width       : Rd.config.gridNumberCol        
        },
        { 
            text        : '<i class="fa fa-check-circle"></i> '+Rd.config.meshNodesOnline,  
            dataIndex   : 'nodes_up',      
            xtype       :  'templatecolumn', 
            tpl         :    new Ext.XTemplate(
                        "<tpl if='nodes_up &gt; 0'><div class=\"fieldGreenWhite\">{nodes_up}</div>",
                        "<tpl else><div class=\"fieldBlue\">{nodes_up}</div></tpl>"
                    ),
            stateId     : 'StateGNOM6',
            width       : Rd.config.gridNumberCol
        },
        { 
            text        : '<i class="fa fa-exclamation-circle"></i> '+Rd.config.meshNodesOffline,  
            dataIndex   : 'nodes_down',      
            xtype       :  'templatecolumn', 
            tpl         :    new Ext.XTemplate(
                        "<tpl if='nodes_down &gt; 0'><div class=\"fieldRedWhite\">{nodes_down}</div>",
                        "<tpl else><div class=\"fieldBlue\">{nodes_down}</div></tpl>"
                    ),
            stateId     : 'StateGNOM7',
            width       : Rd.config.gridNumberCol
        }
    ], 
    initComponent: function(){
        var me      = this;
        me.store    = Ext.create(Rd.store.sMeshOverview,{
            autoLoad: false 
        });
		me.store.load(); 
        me.callParent(arguments);
    }
});

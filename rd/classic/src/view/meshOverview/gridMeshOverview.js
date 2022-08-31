Ext.define('Rd.view.meshOverview.gridMeshOverview' ,{
    extend      : 'Ext.grid.Panel',
    alias       : 'widget.gridMeshOverview',
    multiSelect : false,
    stateful    : true,
    stateId     : 'StateGridMeshes',
    stateEvents : ['groupclick','columnhide'],
    border      : false,
    allowDeselect: true,
    viewConfig  : {
        loadMask:true
    },
    //plugins     : 'gridfilters',  //*We specify this
    initComponent: function(){
        var me      = this;
        
        me.store    = me.up('panel').store;
        
        me.bbar     =  [
            {
                 xtype       : 'pagingtoolbar',
                 store       : me.store,
                 dock        : 'bottom',
                 displayInfo : true
            }  
        ];
                    
        me.columns  = [
            {xtype: 'rownumberer',stateId: 'StateGMO1'},
            { text: i18n('sName'),      dataIndex: 'name',          tdCls: 'gridMain', flex: 1,stateId: 'StateGMO2'},
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
                stateId     : 'StateGMO3',
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
                stateId     : 'StateGMO4',
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
                stateId     : 'StateGMO5', 
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
                stateId     : 'StateGMO6',
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
                stateId     : 'StateGMO7',
                width       : Rd.config.gridNumberCol
            }
        ];
        me.callParent(arguments);
    }
});

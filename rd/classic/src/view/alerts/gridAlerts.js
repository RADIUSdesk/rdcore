Ext.define('Rd.view.alerts.gridAlerts' ,{
    extend      :'Ext.grid.Panel',
    alias       : 'widget.gridAlerts',
    multiSelect : true,
    stateful    : true,
    stateId     : 'StateGridAlerts',
    stateEvents :['groupclick','columnhide'],
    border      : false,
    requires    : [
        'Rd.view.components.ajaxToolbar',
        'Ext.toolbar.Paging',
        'Ext.ux.ProgressBarPager',
        'Rd.store.sAlerts',
        'Rd.store.sAlerts',
        'Rd.model.mAlert',
        'Rd.view.alerts.vcAlerts',
    ],
    viewConfig  : {
        loadMask:true
    },
    urlMenu     : '/cake3/rd_cake/alerts/menu_for_grid.json',
    plugins     : 'gridfilters',  //*We specify this
    controller  : 'vcAlerts',
    initComponent: function(){
        var me      = this;
        me.store    = Ext.create('Rd.store.sAlerts',{});
        me.bbar = [{
            xtype       : 'pagingtoolbar',
            store       : me.store,
            displayInfo : true,
            plugins     : {
                'ux-progressbarpager': true
            }
        }];
        me.tbar     = Ext.create('Rd.view.components.ajaxToolbar',{'url': me.urlMenu});
        me.columns  = [ 
             { 
                text        : 'Network',
                dataIndex   : 'network', 
                hidden      : false,  
                xtype       : 'templatecolumn', 
                tpl         :    new Ext.XTemplate(
                    "<tpl if='type==\"mesh\"'><div class=\"fieldTealWhite\"><span style=\"font-family:FontAwesome;\">&#xf20e;</span> {network}</div></tpl>",
                    "<tpl if='type==\"ap_profile\"'><div class=\"fieldBlueWhite\"><i class=\"fa fa-wifi\"></i> {network}</div></tpl>"
                ),
                stateId		: 'StateGridAlerts1',
                flex        : 1,
                filter      : {type: 'string'},
                sortable    : false
            },
            { 
                text        : 'Device',
                dataIndex   : 'device', 
                hidden      : false,  
                xtype       : 'templatecolumn', 
                tpl         :    new Ext.XTemplate(
                    "<div class=\"fieldGreyWhite\">{device}</div>"
                ),
                stateId		: 'StateGridAlerts2',
                flex        : 1,
                filter      : {type: 'string'},
                sortable    : false
            },
            { 
                text        : 'Description',
                dataIndex   : 'description', 
                tdCls       : 'gridMain',
                flex        : 1,
                hidden      : false,
                stateId     : 'StateGridAlerts3',
                sortable    : false
            },    
            { 
                text        : 'Detected',
                dataIndex   : 'detected', 
                hidden      : false,  
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<tpl if='acknowledged == null'>",
                        "<tpl if='resolved == null'>",
                            '<div class=\"fieldRed\">{detected_in_words}</div>',
                        '<tpl else>',
                            '<div class=\"fieldGreen\">{detected_in_words}</div>',
                        '</tpl>',
                    '<tpl else>',
                        "<tpl if='resolved == null'>",
                            '<div class=\"fieldOrange\">{detected_in_words}</div>',
                        '<tpl else>',
                            '<div class=\"fieldGreen\">{detected_in_words}</div>',
                        '</tpl>',
                    "</tpl>"
                ),
                stateId		: 'StateGridAlerts4',
                filter      : {type: 'date',dateFormat: 'Y-m-d'},
                flex        : 1
            },
            { 
                text        : 'Acknowledged',
                dataIndex   : 'acknowledged', 
                hidden      : false,  
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<tpl if='acknowledged== null'><div class=\"fieldGrey\">{acknowledged_in_words}</div>",
                    "<tpl else><div class=\"fieldBlue\">{acknowledged_in_words}</div>",
                    '<i class="fa fa-clock-o"></i> <span style="color:blue;">{before_acknowledged_in_words}</span> to acknowledge by <span style="color:blue;">{acknowledged_by}</span>.',
                    "</tpl>",
                ),
                stateId		: 'StateGridAlerts5',
                filter      : {type: 'date',dateFormat: 'Y-m-d'},
                flex        : 1
            },
            { 
                text        : 'Resolved',
                dataIndex   : 'resolved', 
                hidden      : false,  
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<tpl if='resolved== null'><div class=\"fieldGrey\">{resolved_in_words}</div>",
                    "<tpl else><div class=\"fieldBlue\">{resolved_in_words}</div>",
                    '<i class="fa fa-clock-o"></i> <span style="color:blue;">{before_resolved_in_words}</span> to resolve.',
                    "</tpl>",
                ),
                stateId		: 'StateGridAlerts6',
                filter      : {type: 'date',dateFormat: 'Y-m-d'},
                flex        : 1
            },        
            { 
                text        : 'Created',
                dataIndex   : 'created', 
                hidden      : true,  
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<div class=\"fieldBlue\">{created_in_words}</div>"
                ),
                stateId		: 'StateGridAlerts7',
                filter      : {type: 'date',dateFormat: 'Y-m-d'},
                flex        : 1
            },  
            { 
                text        : 'Modified',
                dataIndex   : 'modified', 
                hidden      : true, 
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<div class=\"fieldBlue\">{modified_in_words}</div>"
                ),
                flex        : 1,
                filter      : {type: 'date',dateFormat: 'Y-m-d'},
                stateId		: 'StateGridAlerts8'
            },
            {
                xtype       : 'actioncolumn',
                text        : 'Actions',
                width       : 80,
                stateId     : 'StateGridAlerts9',
                items       : [				
					 { 
						iconCls : 'txtRed x-fa fa-trash',
						tooltip : 'Delete',
                        handler: function(view, rowIndex, colIndex, item, e, record, row) {
                            this.fireEvent('itemClick', view, rowIndex, colIndex, item, e, record, row, 'delete');
                        }
                    },
					{  
                        iconCls : 'txtBlue x-fa fa-handshake-o',
                        tooltip : 'Acknowledge',
						handler: function(view, rowIndex, colIndex, item, e, record, row) {
                            this.fireEvent('itemClick', view, rowIndex, colIndex, item, e, record, row, 'acknowledge');
                        }
					}
				]
	        }      
        ];        
        me.callParent(arguments);
    }
});

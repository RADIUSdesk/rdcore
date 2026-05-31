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
    viewConfig: {
        loadMask    :true,
        stripeRows  : false,
        getRowClass : function (record) {
            if (record.get('resolved')) {
                return 'alert-row alert-resolved';
            }
            if (record.get('acknowledged')) {
                return 'alert-row alert-ack';
            }
            return 'alert-row alert-active';
        }
    },
    urlMenu     : '/cake4/rd_cake/alerts/menu_for_grid.json',
    plugins     : 'gridfilters',  //*We specify this
    controller  : 'vcAlerts',
    initComponent: function(){
        var me      = this;
        me.store    = Ext.create('Rd.store.sAlerts',{});
        
        if(me.cloud){
            me.store.getProxy().setExtraParam('scope','cloud');
        }
        
        me.bbar = [{
            xtype       : 'pagingtoolbar',
            store       : me.store,
            displayInfo : true,
            plugins     : {
                'ux-progressbarpager': true
            }
        }];
        me.tbar     = Ext.create('Rd.view.components.ajaxToolbar',{'url': me.urlMenu});
        
        var category = Ext.create('Ext.data.Store', {
            fields: ['id', 'text'],
            data : [
                {"id":"alert",   "text": "Alert"},
                {"id":"event", 	 "text": "Event"},
				{"id":"info",    "text": "Info"}
            ]
        });
                
        me.columns  = [ 
            { 
                text        : 'Category',
                dataIndex   : 'category',
                width       : 120, 
                hidden      : false,
                xtype       : 'templatecolumn', 
                tpl         :    new Ext.XTemplate(
                    "<tpl if='category==\"alert\"'><div class=\"rd-badge rd-badge--amber\">Alert</div></tpl>",
                    "<tpl if='category==\"event\"'><div class=\"rd-badge rd-badge--blue\">Event</div></tpl>",
                    "<tpl if='category==\"info\"'><div class=\"rd-badge  rd-badge--gray\">Info</div></tpl>",
                ),
                stateId		: 'sgAlerts1',
                filter      : {
                    type    : 'list',
                    store   : category       
                },
                sortable    : false
            },
             { 
                text        : 'Network',
                dataIndex   : 'network',
                width       : 120, 
                hidden      : false,
                xtype       : 'templatecolumn', 
                tpl         :    new Ext.XTemplate(
                    "<tpl if='type==\"mesh\"'><div class=\"rd-badge\"><span style=\"font-family:FontAwesome;\">&#xf20e;</span> {network}</div></tpl>",
                    "<tpl if='type==\"ap_profile\"'><div class=\"rd-badge\"><i class=\"fa fa-wifi\"></i> {network}</div></tpl>"
                ),
                stateId		: 'sgAlerts2',
                filter      : {type: 'string'},
                sortable    : false
            },
            { 
                text        : 'Device',
                dataIndex   : 'device',
                width       : 120, 
                hidden      : false, 
                stateId		: 'sgAlerts3',
                filter      : {type: 'string'},
                sortable    : false
            },
            { 
                text        : 'Description',
                dataIndex   : 'description', 
                flex        : 2,
                hidden      : false,
                stateId     : 'sgAlerts4',
                sortable    : false
            },    
            { 
                text        : 'Detected',
                dataIndex   : 'detected', 
                hidden      : false,  
                xtype       : 'templatecolumn',
                width       : 140, 
                tpl         : new Ext.XTemplate(
                    "<tpl if='category == \"event\" || category == \"info\"'>",
                        '<div class=\"rd-badge rd-badge--blue\">{detected_in_words}</div>',
                    "<tpl else>",
                    
                        "<tpl if='acknowledged == null'>",
                            "<tpl if='resolved == null'>",
                                '<div class=\"rd-badge rd-badge--amber\">{detected_in_words}</div>',
                            '<tpl else>',
                                '<div class=\"rd-badge rd-badge--green\">{detected_in_words}</div>',
                            '</tpl>',
                        '<tpl else>',
                            "<tpl if='resolved == null'>",
                                '<div class=\"rd-badge rd-badge--blue\">{detected_in_words}</div>',
                            '<tpl else>',
                                '<div class=\"rd-badge rd-badge--green\">{detected_in_words}</div>',
                            '</tpl>',
                        "</tpl>",
                        
                    "</tpl>"
                ),
                stateId		: 'sgAlerts5',
                filter      : {type: 'date',dateFormat: 'Y-m-d'}
            },
            {
                text        : 'Acknowledged',
                dataIndex   : 'acknowledged',
                hidden      : false,
                xtype       : 'templatecolumn',
                tpl         : new Ext.XTemplate(

                    // Events / info do not require acknowledgement
                    "<tpl if='category == \"event\" || category == \"info\"'>",
                        "<span class='rd-dash'>—</span>",
                    "<tpl else>",

                        // Normal alert handling
                        "<tpl if='acknowledged == null'>",
                            "<div class=\"rd-badge rd-badge--grey\">{acknowledged_in_words}</div>",
                        "<tpl else>",
                            "<div class=\"rd-badge rd-badge--blue\">{acknowledged_in_words}</div>",
                            "<div><i class=\"fa fa-clock-o\"></i> " +
                                "<span style=\"color:blue;\">{before_acknowledged_in_words}</span> " +
                                "to acknowledge by " +
                                "<span style=\"color:blue;\">{acknowledged_by}</span>." +
                            "</div>",
                        "</tpl>",

                    "</tpl>"
                ),
                stateId    : 'sgAlerts6',
                filter     : {type: 'date',dateFormat: 'Y-m-d'},
                flex       : 1
            },
            { 
                text        : 'Resolved',
                dataIndex   : 'resolved', 
                hidden      : false, 
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    // Events / info do not require acknowledgement
                    "<tpl if='category == \"event\" || category == \"info\"'>",
                        "<span class='rd-dash'>—</span>",
                    "<tpl else>",            
                        "<tpl if='resolved== null'><div class=\"rd-badge rd-badge--grey\">{resolved_in_words}</div>",
                        "<tpl else><div class=\"rd-badge rd-badge--green\">{resolved_in_words}</div>",
                        '<div><i class="fa fa-clock-o"></i> <span style="color:blue;">{before_resolved_in_words}</span> to resolve.</div>',
                        "</tpl>",
                        
                    "</tpl>"
                ),
                stateId		: 'sgAlerts7',
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
                stateId		: 'sgAlerts8',
                filter      : {type: 'date',dateFormat: 'Y-m-d'},
                flex        : 1
            },  
            { 
                text        : 'Modified',
                dataIndex   : 'modified', 
                hidden      : true, 
                flex        : 1,
                filter      : {type: 'date',dateFormat: 'Y-m-d'},
                stateId		: 'sgAlerts9'
            },
            {
                xtype       : 'actioncolumn',
                text        : 'Actions',
                width       : 80,
                stateId     : 'sgAlerts10',
                items       : [				
					 { 
						iconCls : 'x-fa fa-trash',
						tooltip : 'Delete',
                        handler: function(view, rowIndex, colIndex, item, e, record, row) {
                            this.fireEvent('itemClick', view, rowIndex, colIndex, item, e, record, row, 'delete');
                        }
                    },
					{  
                        iconCls : 'x-fa fa-handshake-o',
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

Ext.define('Rd.view.vouchers.gridVouchers' ,{
    extend:'Ext.grid.Panel',
    alias : 'widget.gridVouchers',
    multiSelect: true,
    store : 'sVouchers',
    stateful: true,
    stateId: 'StateGridVouchers',
    stateEvents:['groupclick','columnhide'],
    border: false,
    requires: [
        'Rd.view.components.ajaxToolbar',
        'Ext.toolbar.Paging',
        'Ext.ux.ProgressBarPager'
    ],
    viewConfig: {
        loadMask:true
    },
    urlMenu: '/cake3/rd_cake/vouchers/menu-for-grid.json',
    plugins     : 'gridfilters',  //*We specify this
    initComponent: function(){
        var me      = this;
        me.menu_grid = new Ext.menu.Menu({
            items: [
                { text: 'Change Password', glyph: Rd.config.icnLock,   handler: function(){
                     me.fireEvent('menuItemClick',me,'password');
                }},
                
                { text: 'Test RADIUS',     glyph: Rd.config.icnRadius, handler: function(){
                     me.fireEvent('menuItemClick',me,'radius');
                }},
                { text: 'Usage Graphs',    glyph: Rd.config.icnGraph,  handler: function(){
                     me.fireEvent('menuItemClick',me,'graphs');
                }}
            ]
         });

        me.bbar = [{
            xtype       : 'pagingtoolbar',
            store       : me.store,
            displayInfo : true,
            plugins     : {
                'ux-progressbarpager': true
            }
        }];
        
        me.tbar     = Ext.create('Rd.view.components.ajaxToolbar',{'url': me.urlMenu});
            
        var status = Ext.create('Ext.data.Store', {
            fields: ['id', 'text'],
            data : [
                {"id":"new",       	"text": "New"},
                {"id":"used", 		"text": "Used"},
				{"id":"depleted",   "text": "Depleted"},
				{"id":"expired",    "text": "Expired"}
            ]
        });

        me.columns  = [
           // {xtype: 'rownumberer',stateId: 'StateGridVouchers1'},
            { text: i18n('sOwner'),        dataIndex: 'owner',      tdCls: 'gridTree', flex: 1,filter: {type: 'string'},stateId: 'StateGridVouchers2',
                hidden: true
            },  
            { text: i18n('sName'),         dataIndex: 'name',       tdCls: 'gridMain', flex: 1,filter: {type: 'string'},stateId: 'StateGridVouchers3'},
            { text: i18n('sPassword'),     dataIndex: 'password',   tdCls: 'gridTree', flex: 1,filter: {type: 'string'}, sortable: false,stateId: 'StateGridVouchers4', hidden: true},
            { 
                text        : i18n('sBatch'),
                sortable    : true,
                flex        : 1,
                tdCls       : 'gridTree', 
                xtype       : 'templatecolumn', 
                tpl:        new Ext.XTemplate(
                                '<tpl if="Ext.isEmpty(batch)"><div class=\"fieldBlue\">'+i18n('s_br_Single_voucher_br')+'</div>',
                                '<tpl else><div class=\"fieldGrey\">','{batch}','</div></tpl>' 
                            ),
                dataIndex   : 'batch',
                filter: { type: 'string'},stateId: 'StateGridVouchers5'
            },
            { text: i18n('sRealm'),        dataIndex: 'realm',     tdCls: 'gridTree', flex: 1,filter: {type: 'string'}, sortable : false,stateId: 'StateGridVouchers6'},
            { text: i18n('sProfile'),      dataIndex: 'profile',   tdCls: 'gridTree', flex: 1,filter: {type: 'string'}, sortable : false,stateId: 'StateGridVouchers7'},
            {
                header: i18n('sData_used'),
                dataIndex: 'perc_data_used',
                width: 110,
                // This is our Widget column
                xtype: 'widgetcolumn',
                tdCls: 'gridTree',
                widget: {
                    xtype: 'progressbarwidget'
                },
                onWidgetAttach: function(column, widget, record) {
                    var v = record.get('perc_data_used');
                    widget.toggleCls("wifigreen",true);
                    if(v == null){
                     widget.setText('');
                    }else{
                        if(v < 70){
                            var cls = "wifigreen";
                            widget.toggleCls("wifiyellow",false);
                            widget.toggleCls("wifired",false);
                            widget.toggleCls(cls,true);     
                        } 
                        if(v >= 70 && v < 90){
                            cls = "wifiyellow";
                            widget.toggleCls("wifigreen",false);
                            widget.toggleCls("wifired",false);
                            widget.toggleCls(cls,true);   
                        }
                        if(v >= 90){
                            cls = "wifired"
                            widget.toggleCls("wifigreen",false);
                            widget.toggleCls("wifiyellow",false);
                            widget.toggleCls(cls,true);   
                        }  
                        widget.setValue(v / 100);
                        widget.setText( v +" %");
                    }    
                },
                stateId: 'StateGridVouchers8'
            },
            {
                header: i18n('sTime_used'),
                dataIndex: 'perc_time_used',
                width: 110,
                xtype: 'widgetcolumn',
                tdCls: 'gridTree',
                widget: {
                    xtype: 'progressbarwidget'
                },
                onWidgetAttach: function(column, widget, record) {
                    var v = record.get('perc_time_used');            
                    widget.toggleCls("wifired",true);
                    if(v == null){
                      widget.setText('');
                    }else{
                        if(v < 70){
                            var cls = "wifigreen";
                            widget.toggleCls("wifiyellow",false);
                            widget.toggleCls("wifired",false);
                            widget.toggleCls(cls,true);     
                        } 
                        if(v >= 70 && v < 90){
                            cls = "wifiyellow";
                            widget.toggleCls("wifigreen",false);
                            widget.toggleCls("wifired",false);
                            widget.toggleCls(cls,true);   
                        }
                        if(v >= 90){
                            cls = "wifired"
                            widget.toggleCls("wifigreen",false);
                            widget.toggleCls("wifiyellow",false);
                            widget.toggleCls(cls,true);   
                        }  
                        widget.setValue(v / 100);
                        widget.setText( v +" %");
                        widget.toggleCls(cls,true);
                    }    
                },
                stateId: 'StateGridVouchers9'
            },
            { 
                text        : i18n('sStatus'),
                flex        : 1,  
                tdCls       : 'gridTree',
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                                "<tpl if='status == \"new\"'><div class=\"fieldGreen\">"+i18n('sNew')+"</div></tpl>",
                                "<tpl if='status == \"used\"'><div class=\"fieldYellow\">"+i18n('sUsed')+"</div></tpl>",
                                "<tpl if='status == \"depleted\"'><div class=\"fieldOrange\">"+i18n('sDepleted')+"</div></tpl>",
                                "<tpl if='status == \"expired\"'><div class=\"fieldRed\">"+i18n('sExpired')+"</div></tpl>"
                ),
                dataIndex   : 'status',
                filter      : {
                type    : 'list',
                store   : status
              },stateId: 'StateGridVouchers10'
            },
            { 
                text        : i18n('sLast_accept_time'),
                dataIndex   : 'last_accept_time',
                tdCls       : 'gridTree',
                hidden      : true, 
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<div class=\"fieldBlue\">{last_accept_time_in_words}</div>"
                ),
                flex        : 1,
                filter      : {type: 'date',dateFormat: 'Y-m-d'},
                stateId		: 'StateGridVouchers11'
            },  
            {
                text        : i18n('sLast_accept_nas'),
                flex        : 1,
                dataIndex   : 'last_accept_nas',
                tdCls       : 'gridTree',
                hidden      : true,
                filter      : {type: 'string'},stateId: 'StateGridVouchers12'
            },
            { 
                text        : i18n('sLast_reject_time'),
                dataIndex   : 'last_reject_time',
                tdCls       : 'gridTree',
                hidden      : true, 
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<div class=\"fieldBlue\">{last_reject_time_in_words}</div>"
                ),
                flex        : 1,
                filter      : {type: 'date',dateFormat: 'Y-m-d'},
                stateId		: 'StateGridVouchers13'
            },  
            {
                text        : i18n('sLast_reject_nas'),
                flex        : 1,
                dataIndex   : 'last_reject_nas',
                tdCls       : 'gridTree',
                hidden      : true,
                filter      : {type: 'string'},stateId: 'StateGridVouchers14'
            },
            {
                text        : i18n('sLast_reject_message'),
                flex        : 1,
                dataIndex   : 'last_reject_message',
                tdCls       : 'gridTree',
                hidden      : true,
                filter      : {type: 'string'},stateId: 'StateGridVouchers15'
            },
            {
                text        : 'Extra field name',
                flex        : 1,
                dataIndex   : 'extra_name',
                tdCls       : 'gridTree',
                hidden      : true,
                filter      : {type: 'string'},stateId: 'StateGridVouchers16'
            },
            {
                text        : 'Extra field value',
                flex        : 1,
                dataIndex   : 'extra_value',
                tdCls       : 'gridTree',
                hidden      : true,
                filter      : {type: 'string'},stateId: 'StateGridVouchers17'
            },
            { 
                text        : 'Created',
                dataIndex   : 'created', 
                tdCls       : 'gridTree',
                hidden      : true,  
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<div class=\"fieldBlue\">{created_in_words}</div>"
                ),
                stateId		: 'StateGridVouchers18',
                filter      : {type: 'date',dateFormat: 'Y-m-d'},
                flex        : 1
            },  
            { 
                text        : 'Modified',
                dataIndex   : 'modified', 
                tdCls       : 'gridTree',
                hidden      : true, 
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<div class=\"fieldBlue\">{modified_in_words}</div>"
                ),
                flex        : 1,
                filter      : {type: 'date',dateFormat: 'Y-m-d'},
                stateId		: 'StateGridVouchers19'
            },
            { 
                text        : 'Expire',
                dataIndex   : 'expire', 
                tdCls       : 'gridTree',
                hidden      : true, 
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<div class=\"fieldBlue\">{expire_in_words}</div>"
                ),
                flex        : 1,
                filter      : {type: 'date',dateFormat: 'Y-m-d'},
                stateId		: 'StateGridVouchers19a'
            },
            { 
                text        : 'Valid After First Login',
                dataIndex   : 'time_valid', 
                tdCls       : 'gridTree',
                hidden      : true, 
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<div class=\"fieldBlue\">{time_valid_in_words}</div>"
                ),
                flex        : 1,
                filter      : {type: 'string'},
                stateId		: 'StateGridVouchers19b'
            },
            {
                xtype       : 'actioncolumn',
                text        : 'Actions',
                width       : 80,
                stateId     : 'StateGridVouchers20',
                items       : [				
					 { 
						iconCls : 'txtRed x-fa fa-trash',
						tooltip : 'Delete',
						isDisabled: function (grid, rowIndex, colIndex, items, record) {
                                if (record.get('delete') == true) {
                                     return false;
                                } else {
                                    return true;
                                }
                        },
                        handler: function(view, rowIndex, colIndex, item, e, record, row) {
                            this.fireEvent('itemClick', view, rowIndex, colIndex, item, e, record, row, 'delete');
                        }
                    },
                    {  
                        iconCls : 'txtBlue x-fa fa-pen',
                        tooltip : 'Edit',
                        isDisabled: function (grid, rowIndex, colIndex, items, record) {
                                if (record.get('update') == true) {
                                     return false;
                                } else {
                                    return true;
                                }
                        },
						handler: function(view, rowIndex, colIndex, item, e, record, row) {
                            this.fireEvent('itemClick', view, rowIndex, colIndex, item, e, record, row, 'update');
                        }
					},{  
                       iconCls :'txtGreen x-fa fa-bars',
                       tooltip : 'More Actions',
                       handler: function(view, rowIndex, colIndex, item, e, record) {
                           var position = e.getXY();
                           e.stopEvent();
                           me.selRecord = record;
                           me.view = view;
                           me.menu_grid.showAt(position);
                       }
                    }
				]
            }                                  
        ];
        
        me.callParent(arguments);
    }
});

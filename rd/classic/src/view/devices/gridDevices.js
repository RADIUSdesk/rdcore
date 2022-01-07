Ext.define('Rd.view.devices.gridDevices' ,{
    extend:'Ext.grid.Panel',
    alias : 'widget.gridDevices',
    multiSelect: true,
    store : 'sDevices',
    stateful: true,
    stateId: 'StateGridDevices',
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
    urlMenu: '/cake3/rd_cake/devices/menu-for-grid.json',
    plugins     : 'gridfilters',  //*We specify this
   
    initComponent: function(){
        var me      = this;
        
         me.menu_grid = new Ext.menu.Menu({
            items: [
               { text: 'Enable/Disable',  glyph: Rd.config.icnLight,  handler: function(){
                    me.fireEvent('menuItemClick',me,'disable');
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
        
        var menu_grid = new Ext.menu.Menu({
           items: [
               { text: 'Add', handler: function() {console.log("Add");} },
               { text: 'Delete', handler: function() {console.log("Delete");} }
           ]
        });

        me.columns  = [
          //  {xtype: 'rownumberer',stateId: 'StateGridDevices1'},
            { text: i18n('sOwner'),dataIndex: 'permanent_user',     tdCls: 'gridTree', flex: 1,filter: {type: 'string'},stateId: 'StateGridDevices2'},
            { text: i18n('sMAC_address'),   dataIndex: 'name',      tdCls: 'gridMain', flex: 1,filter: {type: 'string'},stateId: 'StateGridDevices3'},
            { text: i18n('sDescription'),   dataIndex: 'description',tdCls: 'gridTree', flex: 1,filter: {type: 'string'},stateId: 'StateGridDevices4'},
           // { text: i18n('sVendor'),        dataIndex: 'vendor',    tdCls: 'gridTree', flex: 1,filter: {type: 'string'}},
            { text: i18n('sRealm'),         dataIndex: 'realm',     tdCls: 'gridTree', flex: 1,filter: {type: 'string'}, sortable: false,stateId: 'StateGridDevices5'},
            { text: i18n('sProfile'),       dataIndex: 'profile',   tdCls: 'gridTree', flex: 1,filter: {type: 'string'}, sortable: false,stateId: 'StateGridDevices6'},
            { 
                text        : i18n('sActive'),
                tdCls       : 'gridTree',   
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                                 "<tpl if='active == true'><div class=\"fieldGreen\"><i class=\"fa fa-check-circle\"></i> "+i18n("sYes")+"</div></tpl>",
                                "<tpl if='active == false'><div class=\"fieldRed\"><i class=\"fa fa-times-circle\"></i> "+i18n("sNo")+"</div></tpl>"
                            ),
                dataIndex   : 'active',
                filter      : {
                        type            : 'boolean',
                        defaultValue    : false,
                        yesText         : 'Yes',
                        noText          : 'No'
                },stateId: 'StateGridDevices7'
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
                stateId		: 'StateGridDevices8'
            },  
            {
                text        : i18n('sLast_accept_nas'),
                flex        : 1,
                dataIndex   : 'last_accept_nas',
                tdCls       : 'gridTree',
                hidden      : true,
                filter      : {type: 'string'},stateId: 'StateGridDevices9'
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
                stateId		: 'StateGridDevices10'
            },  
            {
                text        : i18n('sLast_reject_nas'),
                flex        : 1,
                dataIndex   : 'last_reject_nas',
                tdCls       : 'gridTree',
                hidden      : true,
                filter      : {type: 'string'},stateId: 'StateGridDevices11'
            },
            {
                text        : i18n('sLast_reject_message'),
                flex        : 1,
                dataIndex   : 'last_reject_message',
                tdCls       : 'gridTree',
                hidden      : true,
                filter      : {type: 'string'},stateId: 'StateGridDevices12'
            },
            {
                header      : i18n('sData_used'),
                hidden      : true,
                dataIndex   : 'perc_data_used',
                width       : 110,
                xtype       : 'widgetcolumn',
                tdCls       : 'gridTree',
                widget: {
                    xtype   : 'progressbarwidget'
                },
                onWidgetAttach: function(column, widget, record) {
                    var v = record.get('perc_data_used');
                    widget.toggleCls("wifigreen",true);
                    if(v == null){
                     widget.setText('');
                    }else{
                        var cls = "wifigreen";
                        if(v > 70){
                            cls = "wifiyellow";
                        }
                        if(v > 90){
                            cls = "wifired"
                        }  
                        widget.setValue(v / 100);
                        widget.setText( v +" %");
                        widget.toggleCls(cls,true);
                    }    
                },
                stateId: 'StateGridDevices13'
            },          
            {
                header      : i18n('sTime_used'),
                hidden      : true,
                dataIndex   : 'perc_time_used',
                width       : 110,
                xtype       : 'widgetcolumn',
                tdCls       : 'gridTree',
                widget      : {
                    xtype   : 'progressbarwidget'
                },
                onWidgetAttach: function(column, widget, record) {
                    var v = record.get('perc_time_used');            
                    widget.toggleCls("wifired",true);
                    if(v == null){
                      widget.setText('');
                    }else{
                        var cls = "wifigreen";
                        if(v > 70){
                            cls = "wifiyellow";
                        }
                        if(v > 90){
                            cls = "wifired"
                        }  
                        widget.setValue(v / 100);
                        widget.setText( v +" %");
                        widget.toggleCls(cls,true);
                    }    
                },
                stateId: 'StateGridDevices14'
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
                stateId		: 'StateGridDevices15',
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
                stateId		: 'StateGridDevices16'
            },   
            { 
                text    : i18n('sNotes'),
                sortable: false,
                hidden  : false,
                hidden   : true, 
                width   : 130,
                xtype   : 'templatecolumn', 
                tdCls   : 'gridTree',
                tpl     : new Ext.XTemplate(
                                "<tpl if='notes == true'><span class=\"fa fa-thumb-tack fa-lg txtGreen\"></tpl>"
                ),
                dataIndex: 'notes',stateId: 'StateGridDevices17'
            },
            {
                xtype       : 'actioncolumn',
                text        : 'Actions',
                width       : 80,
                stateId     : 'StateGridDevices18',
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

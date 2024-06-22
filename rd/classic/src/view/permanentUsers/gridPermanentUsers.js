Ext.define('Rd.view.permanentUsers.gridPermanentUsers' ,{
    extend:'Ext.grid.Panel',
    alias : 'widget.gridPermanentUsers',
    multiSelect: true,
    store : 'sPermanentUsers',
    stateful: true,
    stateId: 'StateGridPermanentUsers',
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
    urlMenu: '/cake4/rd_cake/permanent-users/menu-for-grid.json',
    plugins     : 'gridfilters',  //*We specify this
    initComponent: function(){
        var me      = this;
        
        me.menu_grid = new Ext.menu.Menu({
           items: [
               { text: 'eMail Credentials', glyph: Rd.config.icnEmail,   handler: function(){
                    me.fireEvent('menuItemClick',me,'email');
               }},
               {
                    xtype: 'menuseparator'
               },
               { text: 'Change Password', glyph: Rd.config.icnLock,   handler: function(){
                    me.fireEvent('menuItemClick',me,'password');
               }},
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
        
       // me.menu_grid
        
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
            { text: i18n('sUsername'),     dataIndex: 'username',   tdCls: 'gridMain', flex: 1,filter: {type: 'string'},stateId: 'StateGridPermanentUsers3'},
            { text: i18n('sAuth_type'),    dataIndex: 'auth_type',  tdCls: 'gridTree', flex: 1,filter: {type: 'string'},stateId: 'StateGridPermanentUsers4', hidden      : true},
            { text: i18n('sRealm'),        dataIndex: 'realm',      tdCls: 'gridTree', flex: 1,filter: {type: 'string'},stateId: 'StateGridPermanentUsers5'},
            { text: i18n('sProfile'),      dataIndex: 'profile',    tdCls: 'gridTree', flex: 1,filter: {type: 'string'},stateId: 'StateGridPermanentUsers6'},
            {
                text        : i18n('sName'),
                flex        : 1,
                dataIndex   : 'name',
                tdCls       : 'gridTree',
                hidden      : true,
                filter      : {type: 'string'},stateId: 'StateGridPermanentUsers7'
            },
            {
                text        : i18n('sSurname'),
                flex        : 1,
                dataIndex   : 'surname',
                tdCls       : 'gridTree',
                hidden      : true,
                filter      : {type: 'string'},stateId: 'StateGridPermanentUsers8'
            },
            {
                text        : i18n('sPhone'),
                dataIndex   : 'phone',
                tdCls       : 'gridTree',
                hidden      : true,
                filter      : {type: 'string'},stateId: 'StateGridPermanentUsers9'
            },
            {
                text        : i18n('s_email'),
                flex        : 1,
                dataIndex   : 'email',
                tdCls       : 'gridTree',
                hidden      : true,
                filter      : {type: 'string'},stateId: 'StateGridPermanentUsers10'
            },
            {
                text        : i18n('sAddress'),
                flex        : 1,
                dataIndex   : 'address',
                tdCls       : 'gridTree',
                hidden      : true,
                filter      : {type: 'string'},stateId: 'StateGridPermanentUsers11'
            },
            { 
                text        : i18n('sActive'),
                tdCls       : 'gridTree',   
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                                "<tpl if='active == true'><div class=\"fieldGreen\"><i class=\"fa fa-check-circle\"></i></div></tpl>",
                                "<tpl if='active == false'><div class=\"fieldRed\"><i class=\"fa fa-times-circle\"></i></div></tpl>"
                            ),
                dataIndex   : 'active',
                filter      : {
                        type            : 'boolean',
                        defaultValue    : false,
                        yesText         : 'Yes',
                        noText          : 'No'
                },stateId: 'StateGridPermanentUsers12'
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
                stateId		: 'StateGridPermanentUsers13'
            },    
            {
                text        : i18n('sLast_accept_nas'),
                flex        : 1,
                dataIndex   : 'last_accept_nas',
                tdCls       : 'gridTree',
                hidden      : true,
                filter      : {type: 'string'},stateId: 'StateGridPermanentUsers14'
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
                stateId		: 'StateGridPermanentUsers15'
            },   
            {
                text        : i18n('sLast_reject_nas'),
                flex        : 1,
                dataIndex   : 'last_reject_nas',
                tdCls       : 'gridTree',
                hidden      : true,
                filter      : {type: 'string'},stateId: 'StateGridPermanentUsers16'
            },
            {
                text        : i18n('sLast_reject_message'),
                flex        : 1,
                dataIndex   : 'last_reject_message',
                tdCls       : 'gridTree',
                hidden      : true,
                filter      : {type: 'string'},stateId: 'StateGridPermanentUsers17'
            },
            { 
                text        : 'Last Seen',
                dataIndex   : 'last_seen',
                tdCls       : 'gridTree',
                hidden      : false,
                sortable    : false, 
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<tpl if='last_seen.status == \"never\"'><span style='color:blue;'><span class='fa' style='font-family:FontAwesome;'>&#xf10c</span></span>  Never</tpl>",
                    "<tpl if='last_seen.status == \"offline\"'><span class='fa' style='font-family:FontAwesome;'>&#xf10c</span>  Offline for {last_seen.span}</tpl>",
                    "<tpl if='last_seen.status == \"online\"'>",
                        "<tpl if='active == true'><span style='color:green;'><i class=\"fa fa-circle\"></i></span></tpl>",
                        "<tpl if='active == false'><span style='color:orange;'><i class=\"fa fa-circle\"></i></span></tpl>",
                        '  Online for {last_seen.span}',
                    '</tpl>'
                ),
                width       : 180,
                stateId		: 'StateGridPermanentUsers17a'
            },
            {
                text        : 'Framed IP Address',
                dataIndex   : 'framedipaddress',
                tdCls       : 'gridTree',
                hidden      : true,
                sortable    : false,
                width       : 180,
                stateId     : 'StateGridPermanentUsers17b'
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
                stateId: 'StateGridPermanentUsers18'
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
                stateId: 'StateGridPermanentUsers19'
            },
			{
                text        : 'Static IP',
                flex        : 1,
                dataIndex   : 'static_ip',
                tdCls       : 'gridTree',
                hidden      : true,
                filter      : {type: 'string'},
				stateId		: 'StateGridPermanentUsers20'
            },
			{
                text        : 'Extra name',
                flex        : 1,
                dataIndex   : 'extra_name',
                tdCls       : 'gridTree',
                hidden      : true,
                filter      : {type: 'string'},
				stateId		: 'StateGridPermanentUsers21'
            },
			{
                text        : 'Extra value',
                flex        : 1,
                dataIndex   : 'extra_value',
                tdCls       : 'gridTree',
                hidden      : true,
                filter      : {type: 'string'},
				stateId		: 'StateGridPermanentUsers22'
            },
            {
                text        : 'Site',
                flex        : 1,
                dataIndex   : 'site',
                tdCls       : 'gridTree',
                hidden      : true,
                filter      : {type: 'string'},
				stateId		: 'StateGridPermanentUsers22a'
            },
            {
                text        : 'PPSK',
                flex        : 1,
                dataIndex   : 'ppsk',
                tdCls       : 'gridTree',
                hidden      : true,
                filter      : {type: 'string'},
				stateId		: 'StateGridPermanentUsers22b'
            },
            {
                text        : 'VLAN',
                flex        : 1,
                dataIndex   : 'vlan',
                tdCls       : 'gridTree',
                hidden      : true,
                filter      : 'number',
				stateId		: 'StateGridPermanentUsers22c'
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
                stateId		: 'StateGridPermanentUsers23',
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
                stateId		: 'StateGridPermanentUsers24'
            },
            {
                xtype       : 'actioncolumn',
                text        : 'Actions',
                width       : 80,
                stateId     : 'StateGridPermanentUsers26',
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
                       isDisabled: function (grid, rowIndex, colIndex, items, record) {
                            if (record.get('extra') == true) {
                                 return false;
                            } else {
                                return true;
                            }
                       },
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

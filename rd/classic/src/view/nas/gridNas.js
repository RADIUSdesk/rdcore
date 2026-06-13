
Ext.define('Rd.view.nas.gridNas' ,{
    extend      : 'Ext.grid.Panel',
    alias       : 'widget.gridNas',
    store       : 'sNas',
    stateful    : true,
    multiSelect : true,
    stateId     : 'StateGridNas',
    stateEvents : ['groupclick','columnhide'],
    viewConfig  : {
        preserveScrollOnRefresh: true
    },
    border      : false,
    requires    : [
        'Rd.view.components.ajaxToolbar'
    ],
    urlMenu         : '/cake4/rd_cake/nas/menu-for-grid.json',
    urlRealmFilter  : '/cake4/rd_cake/realms/index-for-filter.json',
    plugins         : 'gridfilters',  //*We specify this
    initComponent: function(){
        var me      = this;         
         me.bbar    =  [
            {
                 xtype       : 'pagingtoolbar',
                 store       : me.store,
                 dock        : 'bottom',
                 displayInfo : true
            }  
        ];
        
        // tiny helpers (same as in Exit Points grid)
        var dash = '<span class="rd-dash">—</span>';
        var chip = function (cls, iconCls, text) {
            var icon = iconCls ? '<i class="' + iconCls + '"></i>' : '';
            return '<span class="rd-chip ' + (cls || '') + '">' + icon + Ext.htmlEncode(text) + '</span>';
        }; 

        me.tbar     = Ext.create('Rd.view.components.ajaxToolbar',{'url': me.urlMenu});     
        me.columns  = [
            { text: i18n('sIP_Address'),    dataIndex: 'nasname',      tdCls: 'gridMain', flex: 1, filter: {type: 'string'},stateId: 'StateGridNas1'},
            { text: i18n('sName'),          dataIndex: 'shortname',    tdCls: 'gridMain', flex: 1, filter: {type: 'string'},stateId: 'StateGridNas2'},
            { text: 'Secret',               dataIndex: 'secret',       tdCls: 'gridTree', flex: 1, filter: {type: 'string'}, hidden: true,stateId: 'StateGridNas2a'},
            { text: i18n('sNAS-Identifier'),dataIndex: 'nasidentifier',tdCls: 'gridMain', flex: 1, filter: {type: 'string'}, hidden: false,stateId: 'StateGridNas3'},
            { text: 'Auth Port'            ,dataIndex: 'auth_port',    tdCls: 'gridTree', flex: 1, filter: {type: 'string'}, hidden: true,stateId: 'StateGridNas3a'},
            { text: 'Acct Port'            ,dataIndex: 'acct_port',    tdCls: 'gridTree', flex: 1, filter: {type: 'string'}, hidden: true,stateId: 'StateGridNas3b'},
            { text: 'COA Port'             ,dataIndex: 'coa_port',     tdCls: 'gridTree', flex: 1, filter: {type: 'string'}, hidden: true,stateId: 'StateGridNas3c'},
            { text: 'Type'                 ,dataIndex: 'type',         tdCls: 'gridTree', flex: 1, filter: {type: 'string'}, hidden: true,stateId: 'StateGridNas3d'},
            
            { 
                text        : 'System Wide',
                flex        : 1,  
                renderer    : function (v) {
                    return v ? chip('rd-chip--muted', 'fa fa-check', 'System Wide') : dash;
                },
                dataIndex   : 'for_system',
                filter      : {
                        type            : 'boolean',
                        defaultValue    : false,
                        yesText         : 'Yes',
                        noText          : 'No'
                }, stateId: 'StateGridNas4'
            },
            { 
                text:   i18n('sRealms'),
                sortable: false,
                flex: 1,  
                xtype:  'templatecolumn', 
                tpl:    new Ext.XTemplate(
                            '<tpl if="Ext.isEmpty(realms)"><div class=\"rd-chip rd-chip--blue\">Available to all!</div></tpl>', //Warn them when available     to all
                            '<tpl for="realms">',     // interrogate the realms property within the data
                                "<tpl if='other_cloud == true'><div class=\"rd-chip rd-chip--grey\">{name}</div></tpl>",
                                "<tpl if='other_cloud == false'><div class=\"rd-chip rd-chip--green\">{name}</div></tpl>",
                            '</tpl>'
                        ),
                dataIndex: 'realms',
                stateId: 'StateGridNas5'
            },
            { 
                text        : i18n("sStatus"),   
                dataIndex   : 'status',  
                flex        : 1,
                renderer    : function(value,metaData, record){
                    if(value != 'unknown'){                    
                        var online      = record.get('status_time');
                        if(value == 'up'){
                            return "<div class=\"fieldGreen\">"+i18n("sUp")+" "+Ext.ux.secondsToHuman(online)+"</div>";
                        }
                        if(value == 'down'){
                            return "<div class=\"fieldRed\">"+i18n("sDown")+" "+Ext.ux.secondsToHuman(online)+"</div>";
                        }

                    }else{
                        return "<div class=\"fieldBlue\">"+i18n("sUnknown")+"</div>";
                    }              
                },stateId: 'StateGridNas6'
            },
            {
                xtype       : 'actioncolumn',
                text        : 'Actions',
                width       : 80,
                stateId     : 'StateGridNas7',
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
					},
                    {  
                        iconCls : 'txtBlue x-fa fa-gears',
                        tooltip : 'Mikrotik API',
                        isDisabled: function (grid, rowIndex, colIndex, items, record) {
                                if (record.get('type') == 'Mikrotik-API') {
                                     return false;
                                } else {
                                    return true;
                                }
                        },
						handler: function(view, rowIndex, colIndex, item, e, record, row) {
                            this.fireEvent('itemClick', view, rowIndex, colIndex, item, e, record, row, 'mikrotik_api');
                        }
					}
				]
            }   
        ];

        me.callParent(arguments);
    }
});

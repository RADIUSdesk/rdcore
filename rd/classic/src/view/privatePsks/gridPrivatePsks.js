Ext.define('Rd.view.privatePsks.gridPrivatePsks' ,{
    extend      :'Ext.grid.Panel',
    alias       : 'widget.gridPrivatePsks',
    multiSelect : true,
    store       : 'sPrivatePsks',
    stateful    : true,
    stateId     : 'StateGridPrivatePsks',
    stateEvents : ['groupclick','columnhide'],
    border      : false,
    requires    : [
        'Rd.view.components.ajaxToolbar',
        'Ext.toolbar.Paging',
        'Ext.ux.ProgressBarPager',
        'Rd.view.privatePsks.vcPrivatePsks',
        'Rd.view.privatePsks.winPrivatePskGroupAdd',
        'Rd.view.privatePsks.winPrivatePskAdd',
        'Rd.view.privatePsks.winPrivatePskEdit',
    ],
    viewConfig: {
        loadMask:true
    },
    urlMenu     : '/cake4/rd_cake/private-psks/menu-for-grid.json',     
    plugins     : [
        'gridfilters'
    ],    
    controller   : 'vcPrivatePsks', 
    initComponent: function(){
        var me  = this;
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
            { text: 'PPSK Group',  dataIndex: 'ppsk_name', flex: 1,filter: {type: 'string'},stateId: 'StateGridPPSK1'},
            {
                text        : 'System Wide',  
                xtype       : 'templatecolumn',
                width       : 100, 
                tpl         : new Ext.XTemplate(
                                "<tpl if='for_system == true'><div class=\"fieldBlue\">"+i18n("sYes")+"</div></tpl>",
                                "<tpl if='for_system == false'><div class=\"fieldGrey\">"+i18n("sNo")+"</div></tpl>"
                            ),
                dataIndex   : 'for_system',
                filter      : {
                        type            : 'boolean',
                        defaultValue    : false,
                        yesText         : 'Yes',
                        noText          : 'No'
                }, stateId: 'StateGridPPSK2'
            },
            { text: 'PSK',          dataIndex: 'name',  tdCls: 'gridMain', flex: 1,filter: {type: 'string'},stateId: 'StateGridPPSK3'}, 
            { text: 'Comment',      dataIndex: 'comment', flex: 1,filter: {type: 'string'},stateId: 'StateGridPPSK4'},  
            { 
                text        : i18n('sActive'), 
                xtype       : 'templatecolumn', 
                width       : 100,
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
                },stateId: 'StateGridPPSK5'
            },
            { 
                text        : 'VLAN',
                xtype       : 'templatecolumn', 
                width       : 100,
                tpl         : new Ext.XTemplate(
                    "<tpl if='vlan == \"\"'>",
                        "<div class=\"fieldGrey\">Default</div>",                    
                    "<tpl else>",
                        "<div class=\"fieldBlue\">{vlan}</div>",
                    "</tpl>"
                ),
                dataIndex   : 'vlan',
                stateId     : 'StateGridPPSK6'
            },
            { 
                text        : 'MAC Address',
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<tpl if='mac == \"\"'>",
                        "<div class=\"fieldGrey\">Any Device</div>",                    
                    "<tpl else>",
                        "<div class=\"fieldBlue\">{mac}</div>",
                    "</tpl>"
                ),
                dataIndex   : 'vlan',
                filter      : {type: 'string'},
                stateId     : 'StateGridPPSK7',
                flex        : 1
            },        
            { 
                text        : 'Created',
                dataIndex   : 'created', 
                hidden      : false,  
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<div class=\"fieldBlue\">{created_in_words}</div>"
                ),
                stateId		: 'StateGridPPSK8',
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
                stateId		: 'StateGridPPSK9'
            },
            {
                xtype       : 'actioncolumn',
                text        : 'Actions',
                width       : 80,
                stateId     : 'StateGridPPSK10',
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
                       handler: function(view, rowIndex, colIndex, item, e, record, row) {
                            this.fireEvent('itemClick', view, rowIndex, colIndex, item, e, record, row, 'update');
                       }
                    }
				]
            }     
        ];        
        me.callParent(arguments);
    }
});

Ext.define('Rd.view.clients.gridClients' ,{
    extend      :'Ext.grid.Panel',
    alias       : 'widget.gridClients',
    multiSelect : true,
    store       : 'sClients',
    stateful    : true,
    stateId     : 'StateGridClients',
    stateEvents : ['groupclick','columnhide'],
    border      : false,
    padding     : 0,
    ui          : 'light',
    columnLines : false,
    rowLines    : false,
    stripeRows  : true,
    viewConfig  : {
        loadMask    :true
    },
    listeners       : {
        activate  : 'onViewActivate'
    },
    plugins     : [
        'gridfilters'
    ],
    requires    : [
        'Rd.view.components.ajaxToolbar',
        'Ext.toolbar.Paging',
        'Ext.ux.ProgressBarPager',
        'Rd.view.clients.vcClients',
        'Rd.view.clients.winClientAdd',
        'Rd.view.clients.winClientEdit'
    ],
    controller  : 'vcClients',
    urlMenu     : '/cake4/rd_cake/clients/menu-for-grid.json',  
    initComponent: function(){
        var me     = this;
        me.tbar    = Ext.create('Rd.view.components.ajaxToolbar',{'url': me.urlMenu}); 
        me.store   = Ext.create('Rd.store.sClients');
        me.bbar    =  [
            {
                 xtype       : 'pagingtoolbar',
                 store       : me.store,
                 dock        : 'bottom',
                 displayInfo : true
            }  
        ];            
        me.columns  = [
            { 
                text        : 'Username',               
                dataIndex   : 'username',
                tdCls       : 'gridMain', 
                flex        : 1,
                stateId     : 'sgc1'
            }, 
            {
                text        : i18n('sName'),
                dataIndex   : 'name',
                flex        : 1,
                hidden      : true,
                filter      : {type: 'string'}, stateId: 'sgc2'
            },
            {
                text        : i18n('sSurname'),
                dataIndex   : 'surname',
                flex        : 1,
                hidden      : true,
                filter      : {type: 'string'}, stateId: 'sgc3'
            },
            {
                text        : i18n('sPhone'),
                dataIndex   : 'phone',
                flex        : 1,
                hidden      : true,
                filter      : {type: 'string'}, stateId: 'sgc4'
            },
            {
                text        : 'Address',
                flex        : 1,
                dataIndex   : 'address',
                hidden      : true,
                filter      : {type: 'string'}, stateId: 'sgc5'
            },
            { 
                text        : 'APs',
                dataIndex   : 'aps', 
                tdCls       : 'gridTree',
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<div class=\"rd-chip rd-chip--blue\">TO BE COMPLETED</div>"
                ),
                flex        : 1,
                stateId     : 'sgc6'
            },
            { 
                text        : 'Nodes',
                dataIndex   : 'nodes', 
                tdCls       : 'gridTree',
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<div class=\"rd-chip rd-chip--blue\">TO BE COMPLETED</div>"
                ),
                flex        : 1,
                stateId     : 'sgc7'
            },
            { 
                text        : 'Permanent Users',
                dataIndex   : 'permanent_users', 
                tdCls       : 'gridTree',
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<div class=\"rd-chip rd-chip--blue\">TO BE COMPLETED</div>"
                ),
                flex        : 1,
                stateId     : 'sgc8'
            },
            { 
                text        : i18n('sActive'),  
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                                "<tpl if='active == true'><div class=\"rd-chip rd-chip--green\">"+i18n("sYes")+"</div></tpl>",
                                "<tpl if='active == false'><div class=\"rd-chip rd-chip--gray\">"+i18n("sNo")+"</div></tpl>"
                            ),
                dataIndex   : 'active',
                filter      : {
                        type            : 'boolean',
                        yesText         : 'Yes',
                        noText          : 'No'
                }, stateId: 'sgc9'
            },          
            { 
                text        : 'Created',
                dataIndex   : 'created', 
                tdCls       : 'gridTree',
                hidden      : true,  
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<div class=\"rd-chip rd-chip--blue\">{created_in_words}</div>"
                ),
                flex        : 1,
                format      : 'Y-m-d H:i:s',
                filter      : {type: 'date',dateFormat: 'Y-m-d'}
            },  
            { 
                text        : 'Modified',
                dataIndex   : 'modified', 
                tdCls       : 'gridTree',
                hidden      : true, 
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<div class=\"rd-chip rd-chip--blue\">{modified_in_words}</div>"
                ),
                flex        : 1,
                filter      : {type: 'date',dateFormat: 'Y-m-d'}
            },
            {
                xtype       : 'actioncolumn',
                text        : 'Actions',
                width       : 80,
                items       : [					 
                    { 
						iconCls : 'txtGrey x-fa fa-trash',
						tooltip : 'Delete',
                        handler: function(view, rowIndex, colIndex, item, e, record, row) {
                            this.fireEvent('itemClick', view, rowIndex, colIndex, item, e, record, row, 'delete');
                        }
                    },
                    {  
                        iconCls : 'txtGrey x-fa fa-pen',
                        tooltip : 'Edit',
						handler: function(view, rowIndex, colIndex, item, e, record, row) {
                            this.fireEvent('itemClick', view, rowIndex, colIndex, item, e, record, row, 'edit');
                        }
					}
				]
	        }      
        ]; 
        me.callParent(arguments);
    }
});

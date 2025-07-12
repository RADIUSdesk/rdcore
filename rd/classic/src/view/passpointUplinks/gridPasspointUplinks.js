Ext.define('Rd.view.passpointUplinks.gridPasspointUplinks' ,{
    extend      : 'Ext.grid.Panel',
    alias       : 'widget.gridPasspointUplinks',
    store       : 'sPasspointUplinks',
    stateful    : true,
    multiSelect : true,
    stateId     : 'StateGridPasspointUplinks',
    stateEvents : ['groupclick','columnhide'],
    viewConfig  : {
        preserveScrollOnRefresh: true
    },
    border      : false,
    urlMenu     : '/cake4/rd_cake/passpoint-uplinks/menu-for-grid.json',
    plugins     : 'gridfilters',
    requires    : [
        'Rd.view.components.ajaxToolbar',
        'Rd.view.passpointUplinks.pnlPasspointUplinkAddEdit',
        'Rd.view.passpointUplinks.vcPasspointUplinks' 
    ],
    listeners       : {
        activate  : 'onViewActivate'
    },
    controller  : 'vcPasspointUplinks',
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

        me.tbar     = Ext.create('Rd.view.components.ajaxToolbar',{'url': me.urlMenu});     
        me.columns  = [
            { text: 'Name',          dataIndex: 'name',    tdCls: 'gridMain', flex: 1, filter: {type: 'string'}},
            { 
                text        : 'Connection',  
                xtype       : 'templatecolumn',
                tdCls       : 'gridTree', 
                flex        : 1,
                tpl         : new Ext.XTemplate(
                                '<tpl if="connection_type==\'passpoint\'">Passpoint</tpl>',
                                '<tpl if="connection_type==\'wpa_enterprise\'">WPA Enterprise</tpl>',
                            ),
                dataIndex   : 'connection_type'
            },
            { text: 'SSID',          dataIndex: 'ssid',     tdCls: 'gridTree', flex: 1, filter: {type: 'string'}},
            { text: 'RCOI',          dataIndex: 'rcoi',     tdCls: 'gridTree', flex: 1, filter: {type: 'string'}},
            { text: 'NAI Relam',     dataIndex: 'nai_realm',tdCls: 'gridTree', flex: 1, filter: {type: 'string'}},           
            { 
                text        : 'EAP Method',  
                xtype       : 'templatecolumn',
                tdCls       : 'gridTree', 
                flex        : 1,
                tpl         : new Ext.XTemplate(
                                '<tpl if="eap_method==\'peap\'">PEAP</tpl>',
                                '<tpl if="eap_method==\'ttls_pap\'">TTLS with PAP</tpl>',
                                '<tpl if="eap_method==\'ttls_mschap\'">TTLS with MSCHAP</tpl>',
                                '<tpl if="eap_method==\'tls\'">TLS</tpl>',
                            ),
                dataIndex   : 'eap_method'
            },
            { text: 'Identity',      dataIndex: 'identity', tdCls: 'gridTree', flex: 1, filter: {type: 'string'}, hidden:true},
            { text: 'Password',      dataIndex: 'password', tdCls: 'gridTree', flex: 1, filter: {type: 'string'}, hidden:true},
            { 
                text        : 'System Wide',  
                xtype       : 'templatecolumn', 
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
                }
            },
            
            {
                xtype       : 'actioncolumn',
                text        : 'Actions',
                width       : 70,
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
					}
				]
            }   
        ];
        me.callParent(arguments);
    }
});

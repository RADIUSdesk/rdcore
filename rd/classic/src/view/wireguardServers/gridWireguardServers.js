Ext.define('Rd.view.wireguardServers.gridWireguardServers' ,{
    extend      : 'Ext.grid.Panel',
    alias       : 'widget.gridWireguardServers',
    multiSelect : true,
    store       : 'sWireguardServers',
    stateful    : true,
    stateId     : 'StateGridWireguardervers',
    stateEvents : ['groupclick','columnhide'],
    border      : false,
    requires    : [
        'Rd.view.components.ajaxToolbar'
    ],
    viewConfig: {
        loadMask:true
    },
    urlMenu: '/cake3/rd_cake/wireguard-servers/menu_for_grid.json',
    plugins     : 'gridfilters',  //*We specify this
    initComponent: function(){
        var me      = this;
        
        me.bbar     =  [
            {
                 xtype       : 'pagingtoolbar',
                 store       : me.store,
                 dock        : 'bottom',
                 displayInfo : true,
                 plugins     : {
                    'ux-progressbarpager': true
                }
            }  
        ];
        me.tbar     = Ext.create('Rd.view.components.ajaxToolbar',{'url': me.urlMenu});

        me.columns  = [
            {xtype: 'rownumberer',stateId: 'StateGridWireguardServers1'},
            { text: i18n('sOwner'),        dataIndex: 'owner', tdCls: 'gridTree', flex: 1,filter: {type: 'string'},stateId: 'StateGridWireguardServers2',
                hidden: true
            },
            { text: i18n('sName'),         dataIndex: 'name', tdCls: 'gridMain', flex: 1,filter: {type: 'string'},stateId: 'StateGridWireguardServers3'},
            { text: i18n('sDescription'),  dataIndex: 'description',  tdCls: 'gridTree', flex: 1,filter: {type: 'string'},stateId: 'StateGridWireguardServers4'},
            { 
                text:   i18n('sAvailable_to_sub_providers'),
                flex: 1,  
                xtype:  'templatecolumn', 
                tpl:    new Ext.XTemplate(
                            "<tpl if='available_to_siblings == true'><div class=\"fieldGreen\">"+i18n("sYes")+"</div></tpl>",
                            "<tpl if='available_to_siblings == false'><div class=\"fieldRed\">"+i18n("sNo")+"</div></tpl>"
                        ),
                dataIndex: 'available_to_siblings',
                filter      : {
                        type    : 'boolean',
                        defaultValue   : false,
                        yesText : 'Yes',
                        noText  : 'No'
                },stateId: 'StateGridWireguardServers5',
                tdCls: 'gridTree'
            },
            { 
                text:   i18n('sLocal_slash_Remote'),
                flex: 1,  
                xtype:  'templatecolumn', 
                tpl:    new Ext.XTemplate(
                            '<tpl if="local_remote ==\'local\'"><div class="fieldGreen">'+i18n("sLocal")+'</div></tpl>',
                            '<tpl if="local_remote ==\'remote\'"><div class="fieldBlue">'+i18n("sRemote")+'</div></tpl>'
                        ),
                dataIndex: 'local_remote',
                stateId: 'StateGridWireguardServers6',
                tdCls: 'gridTree'
            },
            { 
                text        : 'Protocol',  
                dataIndex   : 'protocol',  
                tdCls       : 'gridTree', 
                flex        : 1,
                filter      : { type: 'string' },
                stateId     : 'StateGridWireguardServers7', 
                hidden      : true
            },
            { 
                text        : 'IP Address',  
                dataIndex   : 'ip_address',  
                tdCls       : 'gridTree', 
                flex        : 1,
                filter      : { type: 'string' },
                stateId     : 'StateGridWireguardServers8', 
                hidden      : false
            },
            { 
                text        : 'Port',  
                dataIndex   : 'port',  
                tdCls       : 'gridTree', 
                flex        : 1,
                filter      : { type: 'string' },
                stateId     : 'StateGridWireguardServers9', 
                hidden      : false
            },
            { 
                text        : 'Gateway IP',  
                dataIndex   : 'vpn_gateway_address',  
                tdCls       : 'gridTree', 
                flex        : 1,
                filter      : { type: 'string' },
                stateId     : 'StateGridWireguardServers10', 
                hidden      : true
            },
            { 
                text        : 'Bridge Start IP',  
                dataIndex   : 'vpn_bridge_start_address',  
                tdCls       : 'gridTree', 
                flex        : 1,
                filter      : { type: 'string' },
                stateId     : 'StateGridWireguardServers11', 
                hidden      : true
            },
            { 
                text        : 'Bridge Mask',  
                dataIndex   : 'vpn_mask',  
                tdCls       : 'gridTree', 
                flex        : 1,
                filter      : { type: 'string' },
                stateId     : 'StateGridWireguardServers12', 
                hidden      : true
            },
            { 
                text        : 'Config Preset',  
                dataIndex   : 'config_preset',  
                tdCls       : 'gridTree', 
                flex        : 1,
                filter      : { type: 'string' },
                stateId     : 'StateGridWireguardServers13', 
                hidden      : true
            },
			{ text: 'Extra name',  dataIndex: 'extra_name',  tdCls: 'gridTree', flex: 1,filter: {type: 'string'},stateId: 'StateGridWireguardServers14', hidden: true},
			{ text: 'Extra value', dataIndex: 'extra_value', tdCls: 'gridTree', flex: 1,filter: {type: 'string'},stateId: 'StateGridWireguardServers15',hidden: true}
        ];
           
        me.callParent(arguments);
    }
});

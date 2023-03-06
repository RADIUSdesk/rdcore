Ext.define('Rd.view.dynamicClientMacs.gridDynamicClientMacs' ,{
    extend		:'Ext.grid.Panel',
    alias 		: 'widget.gridDynamicClientMacs',
    padding     : Rd.config.gridSlim,
    emptyText	: '-Empty Result Set-',
    multiSelect	: true,
    requires	: [
   		'Rd.view.dynamicClientMacs.vcDynamicClientMacs',
   		'Rd.view.dynamicClientMacs.winDynamicClientMacAttach',
   		'Rd.view.dynamicClientMacs.winDynamicClientMacAlias'
    ],
    controller  : 'vcDynamicClientMacs',
    viewConfig  : {
        loadMask    :true
    },
    listeners       : {
        activate  : 'onViewActivate'
    },
    urlMenu		: '/cake4/rd_cake/dynamic-client-macs/menu-for-grid.json',
    plugins     : 'gridfilters',  //*We specify this
    requires	: [
        'Rd.view.components.ajaxToolbar',
        'Ext.toolbar.Paging',
        'Ext.ux.ProgressBarPager'
    ],
    initComponent: function(){
        var me  = this;   
        me.tbar = Ext.create('Rd.view.components.ajaxToolbar',{'url': me.urlMenu});                 
        var store = Ext.create('Ext.data.Store', {
		   fields: [
			   {name: 'id',   	type: 'int'},
			   {name: 'mac', 	type: 'string'},
			   {name: 'alias', 	type: 'string'},
			   {name: 'dynamic_client_name',type: 'string'},
			   {name: 'dynamic_client_id', 	type: 'int'},
			   {name: 'client_mac_id', 	type: 'int'},
			   {name: 'created',        type: 'date'},
         	   {name: 'modified',       type: 'date'}
		   	],
		   	pageSize    : 100,
    		remoteSort  : true,
    		remoteFilter: true,
		   	proxy: {
				    type    : 'ajax',
				    format  : 'json',
				    batchActions: true, 
				    url     : '/cake4/rd_cake/dynamic-client-macs/index.json',
				    reader: {
				        type            : 'json',
				        rootProperty    : 'items',
				        messageProperty : 'message',
				        totalProperty   : 'totalCount' //Required for dynamic paging
				    },
				    simpleSortMode: true //This will only sort on one column (sort) and a direction(dir) value ASC or DESC
			},
			autoLoad: true // add mode must auto load else leave it for load action on window (edit)
		});
		
		me.store = store;
		
		me.bbar = [{
            xtype       : 'pagingtoolbar',
            store       : me.store,
            displayInfo : true,
            plugins     : {
                'ux-progressbarpager': true
            }
        }];
                       
        me.columns  = [
			{ text: i18n('sMAC_address'),   dataIndex: 'mac',       tdCls: 'gridMain', flex: 1,filter: {type: 'string'},stateId: 'StateGridDcm1'},
			{ text: 'Alias',   				dataIndex: 'alias',     tdCls: 'gridTree', flex: 1,stateId: 'StateGridDcm2'},
			{ text: 'Vendor',   			dataIndex: 'vendor',    tdCls: 'gridTree', flex: 1,stateId: 'StateGridDcm3'},
			{ 
				text		: 'RADIUS Client',   	    
				dataIndex	: 'dynamic_client_name',     
				tdCls		: 'gridTree', 
				flex		: 1,
				stateId		: 'StateGridDcm4',
				filter      : {
                    type            : 'string'
                }			
			},
			{ 
				text		: 'RADIUS Client',   	    
				dataIndex	: 'nasidentifier',     
				tdCls		: 'gridTree', 
				flex		: 1,
				stateId		: 'StateGridDcm5',
				filter      : {
                    type            : 'string'
                }			
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
                stateId		: 'StateGridDcm6',
                filter      : {type: 'date',dateFormat: 'Y-m-d'},
                flex        : 1
            },  
            { 
                text        : 'Last Seen',
                dataIndex   : 'modified', 
                tdCls       : 'gridTree',
                hidden      : false, 
                xtype       : 'templatecolumn', 
                tpl         : new Ext.XTemplate(
                    "<div class=\"fieldBlue\">{modified_in_words}</div>"
                ),
                flex        : 1,
                filter      : {type: 'date',dateFormat: 'Y-m-d'},
                stateId		: 'StateGridDcm7'
            }
        ];
        me.callParent(arguments);
    }
});

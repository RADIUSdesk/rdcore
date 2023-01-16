Ext.define('Rd.view.mikrotik.gridMtHotspotActive' ,{
    extend		:'Ext.grid.Panel',
    alias 		: 'widget.gridMtHotspotActive',
    multiSelect	: true,
    stateful	: true,
    stateId		: 'MtHsActive',
    stateEvents	:['groupclick','columnhide'],
    border		: false,
    requires	: [
        'Rd.view.components.ajaxToolbar',
        'Ext.toolbar.Paging',
        'Ext.ux.ProgressBarPager',
        'Rd.view.mikrotik.vcMtHotspotActive',
    ],
    controller  : 'vcMtHotspotActive',
    viewConfig  : {
        loadMask    :true
    },
    listeners       : {
        activate  : 'onViewActivate'
    },
    urlMenu     : '/cake4/rd_cake/dynamic-clients/menu_for_grid_mt_hs_active.json',
    plugins     : 'gridfilters',  //*We specify this
    initComponent: function(){
        var me  = this;
        me.store   = Ext.create('Rd.store.sMtHotspotActives');
        me.store.getProxy().setExtraParams({ 'id' : me.dynamic_client_id });
        me.store.load();

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
 		    { 
				text		: 'User',      
				dataIndex	: 'user',     
				tdCls		: 'gridMain', 
				flex		: 1,
				stateId		: 'MtHsActive1'
			},
            { 
				text		: 'Address',      
				dataIndex	: 'address',     
				tdCls		: 'gridTree', 
				flex		: 1,
				stateId		: 'MtHsActive2',
                hidden      : false
			},
			{ 
				text		: 'Uptime',      
				dataIndex	: 'uptime',     
				tdCls		: 'gridTree', 
				flex		: 1,
				stateId		: 'MtHsActive3',
                hidden      : false
			},
            { 
				text		: 'Server',      
				dataIndex	: 'server',     
				tdCls		: 'gridTree', 
				flex		: 1,
				stateId		: 'MtHsActive4',
                hidden      : true
			},
            { 
				text		: 'MAC Address',      
				dataIndex	: 'mac-address',     
				tdCls		: 'gridTree', 
				flex		: 1,
				stateId		: 'MtHsActive5',
                hidden      : false
			},
            { 
				text		: 'Login-By',      
				dataIndex	: 'login-by',     
				tdCls		: 'gridTree', 
				flex		: 1,
				stateId		: 'MtHsActive6',
                hidden      : true
			},
            { 
				text		: 'Uptime',      
				dataIndex	: 'uptime',     
				tdCls		: 'gridTree', 
				flex		: 1,
				stateId		: 'MtHsActive7',
                hidden      : false
			},
            { 
				text		: 'Idle-Time',      
				dataIndex	: 'idle-time',     
				tdCls		: 'gridTree', 
				flex		: 1,
				stateId		: 'MtHsActive8',
                hidden      : true
			},
            { 
				text		: 'Keepalive-Timeout',      
				dataIndex	: 'keepalive-timeout',     
				tdCls		: 'gridTree', 
				flex		: 1,
				stateId		: 'MtHsActive9',
                hidden      : true
			},
            { 
				text		: 'Bytes-In',      
				dataIndex	: 'bytes-in',     
				tdCls		: 'gridTree', 
				flex		: 1,
				stateId		: 'MtHsActive10',
                hidden      : true
			},
            { 
				text		: 'Bytes-Out',      
				dataIndex	: 'bytes-out',     
				tdCls		: 'gridTree', 
				flex		: 1,
				stateId		: 'MtHsActive10',
                hidden      : true
			},
            { 
				text		: 'Packets-In',      
				dataIndex	: 'packets-in',     
				tdCls		: 'gridTree', 
				flex		: 1,
				stateId		: 'MtHsActive11',
                hidden      : true
			},
            { 
				text		: 'Packets-Out',      
				dataIndex	: 'packets-out',     
				tdCls		: 'gridTree', 
				flex		: 1,
				stateId		: 'MtHsActive12',
                hidden      : true
			},
            { 
				text		: 'Radius',      
				dataIndex	: 'radius',     
				tdCls		: 'gridTree', 
				flex		: 1,
				stateId		: 'MtHsActive13',
                hidden      : true
			}
        ];
        me.callParent(arguments);
    }
});

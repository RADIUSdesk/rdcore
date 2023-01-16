Ext.define('Rd.view.mikrotik.gridMtPppoeActive' ,{
    extend		:'Ext.grid.Panel',
    alias 		: 'widget.gridMtPppoeActive',
    multiSelect	: true,
    stateful	: true,
    stateId		: 'MtPpActive',
    stateEvents	:['groupclick','columnhide'],
    border		: false,
    requires	: [
        'Rd.view.components.ajaxToolbar',
        'Ext.toolbar.Paging',
        'Ext.ux.ProgressBarPager',
        'Rd.view.mikrotik.vcMtPppoeActive',
    ],
    controller  : 'vcMtPppoeActive',
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
        me.store   = Ext.create('Rd.store.sMtPppoeActives');
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
				text		: 'Name',      
				dataIndex	: 'name',     
				tdCls		: 'gridMain', 
				flex		: 1,
				stateId		: 'MtPppActive1'
			},
            { 
				text		: 'Service',      
				dataIndex	: 'service',     
				tdCls		: 'gridTree', 
				flex		: 1,
				stateId		: 'MtPppActive2',
                hidden      : true
			},
			{ 
				text		: 'Caller-Id',      
				dataIndex	: 'caller-id',     
				tdCls		: 'gridTree', 
				flex		: 1,
				stateId		: 'MtPppActive3',
                hidden      : false
			},
            { 
				text		: 'Address',      
				dataIndex	: 'address',     
				tdCls		: 'gridTree', 
				flex		: 1,
				stateId		: 'MtPppActive4',
                hidden      : false
			},
            { 
				text		: 'Uptime',      
				dataIndex	: 'uptime',     
				tdCls		: 'gridTree', 
				flex		: 1,
				stateId		: 'MtPppActive5',
                hidden      : false
			},
            { 
				text		: 'Encoding',      
				dataIndex	: 'encoding',     
				tdCls		: 'gridTree', 
				flex		: 1,
				stateId		: 'MtPppActive6',
                hidden      : true
			},
            { 
				text		: 'Session-Id',      
				dataIndex	: 'session-id',     
				tdCls		: 'gridTree', 
				flex		: 1,
				stateId		: 'MtPppActive7',
                hidden      : true
			},
            { 
				text		: 'In Limit',      
				dataIndex	: 'limit-bytes-in',     
				tdCls		: 'gridTree', 
				flex		: 1,
				stateId		: 'MtPppActive8',
                hidden      : true
			},
            { 
				text		: 'Out Limit',      
				dataIndex	: 'limit-bytes-out',     
				tdCls		: 'gridTree', 
				flex		: 1,
				stateId		: 'MtPppActive9',
                hidden      : true
			},
            { 
				text		: 'Radius',      
				dataIndex	: 'radius',     
				tdCls		: 'gridTree', 
				flex		: 1,
				stateId		: 'MtPppActive10',
                hidden      : true
			}
        ];
        me.callParent(arguments);
    }
});
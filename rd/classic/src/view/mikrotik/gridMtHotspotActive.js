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
 		//	{xtype: 'rownumberer',stateId: 'StateGridUdc1'},
            { 
				text		: 'User',      
				dataIndex	: 'user',     
				tdCls		: 'gridTree', 
				flex		: 1,
				stateId		: 'MtHsActive2'
			},
			{ 
				text		: 'Address',      
				dataIndex	: 'address',     
				tdCls		: 'gridTree', 
				flex		: 1,
				stateId		: 'MtHsActive3'
			},
            { 
				text		: 'Uptime',      
				dataIndex	: 'uptime',     
				tdCls		: 'gridTree', 
				flex		: 1,
				stateId		: 'MtHsActive4'
			}
        ];
        me.callParent(arguments);
    }
});

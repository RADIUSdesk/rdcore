Ext.define('Rd.store.sNetworkOverviewMaps', {
    extend      : 'Ext.data.Store',
    model       : 'Rd.model.mMeshOverviewMap',
	storeId		: 'sNetworkOverviewMaps',
    proxy: {
            type    : 'ajax',
            format  : 'json',
            batchActions: true, 
            url     : '/cake4/rd_cake/clouds/index_mesh_overview.json', //THIS WE USE WITH STREETVIEW MIGRATION
            extraParams: { 'timespan': 'now','node':0},
            reader: {
                type            : 'json',
                rootProperty    : 'items',
                messageProperty : 'message',
                totalProperty   : 'total' //Required for dynamic paging
            },
            simpleSortMode: true //This will only sort on one column (sort) and a direction(dir) value ASC or DESC
    }
});

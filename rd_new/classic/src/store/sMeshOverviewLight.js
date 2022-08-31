Ext.define('Rd.store.sMeshOverviewLight', {
    extend      : 'Ext.data.Store',
    model       : 'Rd.model.mMeshOverviewLight',
    pageSize    : 100,
    remoteSort  : false,
    remoteFilter: false,
	storeId		: 'sMeshOverviewLight',
    proxy: {
            type    : 'ajax',
            format  : 'json',
            batchActions: true, 
            url     : '/cake4/rd_cake/mesh-overviews-light/index.json',
            extraParams: { 'timespan': 'hourly'},
            reader: {
                type            : 'json',
                rootProperty    : 'items',
                messageProperty : 'message',
                totalProperty   : 'totalCount' //Required for dynamic paging
            },
            simpleSortMode: true //This will only sort on one column (sort) and a direction(dir) value ASC or DESC
    },
    autoLoad: false
});

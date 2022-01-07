Ext.define('Rd.store.sMeshTopData', {
    extend      : 'Ext.data.Store',
    model       : 'Rd.model.mMeshTopData',
	storeId		: 'sMeshTopData',
    pageSize    : 100,
    remoteSort  : false,
    remoteFilter: true,
	proxy: {
            type    : 'ajax',
            format  : 'json',
            batchActions: true, 
            url     : '/cake3/rd_cake/mesh-topdata/index.json',
            extraParams: { 'timespan': 'monthly'},
            reader: {
                type            : 'json',
                rootProperty    : 'items',
                messageProperty : 'message',
                totalProperty   : 'totalCount' //Required for dynamic paging
            },
            api: {
                destroy  : '/cake3/rd_cake/meshes/delete.json'
            },
            simpleSortMode: true //This will only sort on one column (sort) and a direction(dir) value ASC or DESC
    }	
});

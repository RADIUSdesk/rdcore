Ext.define('Rd.store.sMeshOverview', {
    extend      : 'Ext.data.Store',
    model       : 'Rd.model.mMeshOverview',
    pageSize    : 100,
    remoteSort  : true,
    remoteFilter: true,
    proxy: {
            type    : 'ajax',
            format  : 'json',
            batchActions: true, 
            url     : '/cake4/rd_cake/mesh-overviews/index.json', 
            extraParams: { 'timespan': 'hourly'},
            reader: {
                type            : 'json',
                rootProperty    : 'items',
                messageProperty : 'message',
                totalProperty   : 'totalCount' //Required for dynamic paging
            },
            api: {
                destroy  : '/cake4/rd_cake/meshes/delete.json'
            },
            simpleSortMode: true //This will only sort on one column (sort) and a direction(dir) value ASC or DESC
    },
    autoLoad: false
});

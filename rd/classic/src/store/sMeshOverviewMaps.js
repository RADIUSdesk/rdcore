Ext.define('Rd.store.sMeshOverviewMaps', {
    extend      : 'Ext.data.Store',
    model       : 'Rd.model.mMeshOverviewMap',
	storeId		: 'sMeshOverviewMaps',
    proxy: {
            type    : 'ajax',
            format  : 'json',
            batchActions: true, 
            url     : '/cake3/rd_cake/mesh-overview-maps/index.json', //This is the one we use (before Streetview)
            //url     : '/cake3/rd_cake/tree-tags/index_mesh_overview.json', //This one was commented out)
            url     : '/cake3/rd_cake/clouds/index_mesh_overview.json', //THIS WE USE WITH STREETVIEW MIGRATION
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

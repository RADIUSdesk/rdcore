Ext.define('Rd.store.sMeshNodeRogues', {
    extend      : 'Ext.data.Store',
    model       : 'Rd.model.mMeshNodeRogue',
    remoteSort  : false,
    proxy       : {
        type    : 'ajax',
        format  : 'json',
        batchActions: true, 
        url     : '/cake3/rd_cake/node-reports/scans-for-node.json',
        reader: {
            type            : 'json',
            rootProperty    : 'items',
            messageProperty : 'message',
            totalProperty   : 'totalCount' //Required for dynamic paging
        },
        simpleSortMode: true //This will only sort on one column (sort) and a direction(dir) value ASC or DESC
    },
    autoLoad    : false
});

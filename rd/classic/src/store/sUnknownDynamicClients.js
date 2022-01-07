
Ext.define('Rd.store.sUnknownDynamicClients', {
    extend      : 'Ext.data.Store',
    model       : 'Rd.model.mUnknownDynamicClient',
    remoteSort  : false,
    proxy: {
            type    : 'ajax',
            format  : 'json',
            batchActions: true, 
            url     : '/cake3/rd_cake/unknown-dynamic-clients/index.json',
            reader: {
                type            : 'json',
                rootProperty    : 'items',
                messageProperty : 'message',
                totalProperty   : 'totalCount' //Required for dynamic paging
            },
            api: {
                destroy  : '/cake3/rd_cake/unknown-dynamic-clients/delete.json'
            },
            simpleSortMode: true //This will only sort on one column (sort) and a direction(dir) value ASC or DESC
    },
    autoLoad    : false
});

Ext.define('Rd.store.sRadaccts', {
    extend: 'Ext.data.Store',
    model: 'Rd.model.mRadacct',
    pageSize: 150,
    remoteSort: true,
    remoteFilter: true,
    proxy: {
            type    : 'ajax',
            format  : 'json',
            batchActions: true, 
            url     : '/cake3/rd_cake/radaccts/index.json',
            autoLoad: false,
            reader: {
                keepRawData     : true,
                type: 'json',
                rootProperty: 'items',
                messageProperty: 'message',
                totalProperty: 'totalCount' //Required for dynamic paging
            },
            simpleSortMode: true //This will only sort on one column (sort) and a direction(dir) value ASC or DESC
    },
    autoLoad    : false
});

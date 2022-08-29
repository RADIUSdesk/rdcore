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
            url     : '/cake4/rd_cake/radaccts/index.json',
            autoLoad: false,
            reader: {
                type: 'json',
                keepRawData: true,
                rootProperty: 'items',
                messageProperty: 'message',
                totalProperty: 'totalCount' //Required for dynamic paging
            },
            listeners: {
                exception: function(proxy, response, operation, eOpts) {
                    //FIXME Do proper error handling
                }
            },
            simpleSortMode: true //This will only sort on one column (sort) and a direction(dir) value ASC or DESC
    },
    autoLoad    : false
});

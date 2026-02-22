Ext.define('Rd.store.sImportFailures', {
    extend      : 'Ext.data.Store',
    model       : 'Rd.model.mImportFailure',
    pageSize    : 100,
    remoteSort  : true,
    remoteFilter: true,
    proxy       : {
        type    : 'ajax',
        format  : 'json',
        batchActions: true, 
        url     : '/cake4/rd_cake/import-failures/index.json',
        reader  : {
            type            : 'json',
            rootProperty    : 'items',
            messageProperty : 'message',
            totalProperty   : 'totalCount' //Required for dynamic paging
        },
        simpleSortMode  : true //This will only sort on one column (sort) and a direction(dir) value ASC or DESC
    },
    autoLoad    : true
});

Ext.define('Rd.store.sTopUpTransactions', {
    extend      : 'Ext.data.Store',
    model       : 'Rd.model.mTopUpTransaction',
    pageSize    : 100,
    remoteSort  : true,
    remoteFilter: true,
    proxy: {
            type    : 'ajax',
            format  : 'json',
            batchActions: true, 
            url     : '/cake3/rd_cake/top-up-transactions/index.json',
            reader: {
                type            : 'json',
                rootProperty    : 'items',
                messageProperty : 'message',
                totalProperty   : 'totalCount' 
            },
            simpleSortMode: true 
    },
    autoLoad: true
});

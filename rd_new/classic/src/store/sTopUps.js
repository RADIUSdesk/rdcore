Ext.define('Rd.store.sTopUps', {
    extend      : 'Ext.data.Store',
    model       : 'Rd.model.mTopUp',
    pageSize    : 100,
    remoteSort  : true,
    remoteFilter: true,
    proxy: {
            type    : 'ajax',
            format  : 'json',
            batchActions: true, 
            url     : '/cake3/rd_cake/top-ups/index.json',
            reader: {
                type: 'json',
                rootProperty: 'items',
                messageProperty: 'message',
                totalProperty: 'totalCount' 
            },
            simpleSortMode: true 
    },
    autoLoad: true
});

Ext.define('Rd.store.sAccessProvidersGrid', {
    extend      : 'Ext.data.Store',
    model       : 'Rd.model.mAccessProviderGrid',
    pageSize    : 100,
    remoteSort  : true,
    remoteFilter: true,
    proxy: {
            type    : 'ajax',
            format  : 'json',
            batchActions: true, 
            url     : '/cake3/rd_cake/access-providers/index.json',
            reader: {
                type            : 'json',
                rootProperty    : 'items',
                messageProperty : 'message',
                totalProperty   : 'totalCount' 
            },
            simpleSortMode: true 
    },
    autoLoad: false
});

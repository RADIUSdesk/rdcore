Ext.define('Rd.store.sIpPools', {
    extend      : 'Ext.data.Store',
    model       : 'Rd.model.mIpPool',
    pageSize    : 100,
    remoteSort  : true,
    remoteFilter: true,
    proxy: {
            type    : 'ajax',
            format  : 'json',
            batchActions: true, 
            //url     : '/cake2/rd_cake/ip_pools/index.json',
            url     : '/cake3/rd_cake/ip-pools/index.json',
            reader: {
                type			: 'json',
                rootProperty    : 'items',
                messageProperty	: 'message',
                totalProperty	: 'totalCount' 
            },
            simpleSortMode: true 
    },
    autoLoad: true
});

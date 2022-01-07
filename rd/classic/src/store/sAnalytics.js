Ext.define('Rd.store.sAnalytics', {
    extend      : 'Ext.data.Store',
    model       : 'Rd.model.mAnalytics',
    remoteSort  : true,
    remoteFilter: true,
    proxy: {
            type    : 'ajax',
            format  : 'json',
            url     : '/cake3/rd_cake/analytics/index.json',
            reader: {
                type            : 'json',
                rootProperty    : 'items',
                messageProperty : 'message',
                totalProperty   : 'totalCount' //Required for dynamic paging
            },            
            simpleSortMode: true //This will only sort on one column (sort) and a direction(dir) value ASC or DESC
    },
    autoLoad: false
});


Ext.define('Rd.store.sDnsDeskUsers', {
    extend      : 'Ext.data.Store',
    model       : 'Rd.model.mDnsDeskUser',
    proxy       : {
        type    : 'ajax',
        format  : 'json',
        batchActions: true, 
        url     : '/cake3/rd_cake/dns-desk-users/index.json',
        reader: {
            type            : 'json',
            rootProperty    : 'items',
            messageProperty : 'message',
            totalProperty   : 'totalCount' //Required for dynamic paging
        },
        simpleSortMode: true //This will only sort on one column (sort) and a direction(dir) value ASC or DESC
    },
    autoLoad: true
});

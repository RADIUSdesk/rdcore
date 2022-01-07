Ext.define('Rd.store.sDnsDeskPolicies', {
    extend      : 'Ext.data.Store',
    model       : 'Rd.model.mDnsDeskPolicy',
    proxy       : {
        type    : 'ajax',
        format  : 'json',
        batchActions: true, 
        url     : '/cake3/rd_cake/dns-desk-policies/index.json',
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

Ext.define('Rd.store.sEmailHistories', {
    extend      : 'Ext.data.Store',
    model       : 'Rd.model.mEmailHistory',
    proxy       : {
        type    : 'ajax',
        format  : 'json',
        batchActions: true, 
        url     : '/cake4/rd_cake/settings/email-histories-index.json',
        reader: {
            type            : 'json',
            rootProperty    : 'items',
            messageProperty : 'message',
            totalProperty   : 'totalCount' //Required for dynamic paging
        },
        simpleSortMode: true //This will only sort on one column (sort) and a direction(dir) value ASC or DESC
    },
    autoLoad    : true,
    groupField  : 'name'
});

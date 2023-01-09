Ext.define('Rd.store.sSmsHistories', {
    extend      : 'Ext.data.Store',
    model       : 'Rd.model.mSmsHistory',
    proxy       : {
        type    : 'ajax',
        format  : 'json',
        batchActions: true, 
        url     : '/cake4/rd_cake/settings/sms-histories-index.json',
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

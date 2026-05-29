Ext.define('Rd.store.sAuditLogs', {
    extend      : 'Ext.data.Store',
    model       : 'Rd.model.mAuditLog',
    proxy       : {
        type    : 'ajax',
        format  : 'json',
        batchActions: true, 
        url     : '/cake4/rd_cake/audit-logs/index.json',
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

Ext.define('Rd.store.sVouchers', {
    extend      : 'Ext.data.Store',
    model       : 'Rd.model.mVoucher',
    pageSize    : 100,
    remoteSort  : true,
    remoteFilter: true,
    proxy: {
            type    : 'ajax',
            format  : 'json',
            batchActions: true, 
            url     : '/cake3/rd_cake/vouchers/index.json',
            reader: {
                type: 'json',
                rootProperty: 'items',
                messageProperty: 'message',
                totalProperty: 'totalCount' //Required for dynamic paging
            },
            simpleSortMode: true //This will only sort on one column (sort) and a direction(dir) value ASC or DESC
    },
    listeners: {
        load: function(store, records, successful, operation) {
            if(!successful){ 
                var error = operation.getError();
                Ext.ux.Toaster.msg(
                    'Warning',
                    error,
                    Ext.ux.Constants.clsWarn,
                    Ext.ux.Constants.msgWarn
                );
            }
        }
    },
    autoLoad: false
});

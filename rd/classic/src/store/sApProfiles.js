Ext.define('Rd.store.sApProfiles', {
    extend      : 'Ext.data.Store',
    model       : 'Rd.model.mApProfile',
    pageSize    : 100,
    remoteSort  : true,
    remoteFilter: true,
    proxy: {
            type    : 'ajax',
            format  : 'json',
            batchActions: true,
            url     : '/cake3/rd_cake/ap-profiles/index.json',
            reader: {
                type            : 'json',
                rootProperty    : 'items',
                messageProperty : 'message',
                totalProperty   : 'totalCount' //Required for dynamic paging
            },
            listeners: {
                exception: function(proxy, response, operation){
                    Ext.ux.Toaster.msg(
                        i18n('sError_encountered'),
                        response.responseText,
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
                    );
                }
            },
            api: {
                destroy  : '/cake3/rd_cake/ap-profiles/delete.json'
            },
            simpleSortMode: true //This will only sort on one column (sort) and a direction(dir) value ASC or DESC
    },
    autoLoad: true
});

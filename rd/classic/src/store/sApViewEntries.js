Ext.define('Rd.store.sApViewEntries', {
    extend  : 'Ext.data.Store',
    model   : 'Rd.model.mApViewEntry',
    remoteSort: false,
    groupField: 'name',
    proxy: {
            type    : 'ajax',
            format  : 'json',
            url     : '/cake3/rd_cake/ap-reports/view_entries.json',
            reader  : {
                type            : 'json',
                rootProperty    : 'items',
                messageProperty : 'message',
                totalProperty   : 'totalCount' //Required for dynamic paging
            }
    },
    autoLoad: false
});

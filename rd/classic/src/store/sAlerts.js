Ext.define('Rd.store.sAlerts', {
    extend      : 'Ext.data.Store',
    model       : 'Rd.model.mAlert',
    buffered    : true,
    leadingBufferZone: 150, 
    pageSize    : 50,
    remoteSort  : true,
    remoteFilter: true,
    proxy: {
            type    : 'ajax',
            format  : 'json',
            batchActions: true, 
            url     : '/cake3/rd_cake/alerts/index.json',
            reader: {
                type            : 'json',
                rootProperty    : 'items',
                messageProperty : 'message',
                totalProperty   : 'totalCount' //Required for dynamic paging
            },
            api     : {
                destroy  : '/cake3/rd_cake/alerts/delete.json'
            },
            simpleSortMode: true //This will only sort on one column (sort) and a direction(dir) value ASC or DESC
    },
    autoLoad: true
});

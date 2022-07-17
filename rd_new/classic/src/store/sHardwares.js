Ext.define('Rd.store.sHardwares', {
    extend: 'Ext.data.Store',
    model: 'Rd.model.mHardware',
    pageSize    : 100,
    //To make it load AJAXly from the server specify the follown 3 attributes
    remoteSort: true,
    remoteFilter: true,
    proxy: {
        type    : 'ajax',
        format  : 'json',
        batchActions: true, 
        url     : '/cake3/rd_cake/hardwares/index.json',
        reader: {
            type: 'json',
            rootProperty: 'items',
            messageProperty: 'message',
            totalProperty: 'totalCount' //Required for dynamic paging
        },
        simpleSortMode: true //This will only sort on one column (sort) and a direction(dir) value ASC or DESC
    },
    autoLoad: true
});

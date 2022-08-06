Ext.define('Rd.store.sUnknownNodes', {
    extend: 'Ext.data.Store',
    model: 'Rd.model.mUnknownNode',
    //To force server side sorting:
    remoteSort: false,
    proxy: {
            type    : 'ajax',
            format  : 'json',
            batchActions: true, 
            url     : '/cake3/rd_cake/unknown-nodes/index.json',
            reader: {
                type            : 'json',
                rootProperty            : 'items',
                messageProperty : 'message',
                totalProperty   : 'totalCount' //Required for dynamic paging
            },
			api: {
                destroy  : '/cake3/rd_cake/unknown-nodes/delete.json'
            },
            simpleSortMode: true //This will only sort on one column (sort) and a direction(dir) value ASC or DESC
    },
    autoLoad: false
});

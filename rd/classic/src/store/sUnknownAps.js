Ext.define('Rd.store.sUnknownAps', {
    extend      : 'Ext.data.Store',
    model       : 'Rd.model.mUnknownAp',
    //To force server side sorting:
    remoteSort  : false,
    proxy: {
            type    : 'ajax',
            format  : 'json', 
            url     : '/cake3/rd_cake/unknown-aps/index.json',
            reader: {
                type            : 'json',
                rootProperty    : 'items',
                messageProperty : 'message',
                totalProperty   : 'totalCount' //Required for dynamic paging
            },
            api: {
                destroy  : '/cake3/rd_cake/unknown-aps/delete.json'
            },
            simpleSortMode: true //This will only sort on one column (sort) and a direction(dir) value ASC or DESC
    },
    autoLoad: false
});

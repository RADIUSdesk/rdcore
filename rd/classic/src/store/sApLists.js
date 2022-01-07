Ext.define('Rd.store.sApLists', {
    extend      : 'Ext.data.Store',
    model       : 'Rd.model.mApList',
    remoteSort  : true,
    remoteFilter: true,
    proxy: {
            type    : 'ajax',
            format  : 'json',
            url     : '/cake3/rd_cake/aps/index.json',
            reader: {
                type            : 'json',
                rootProperty    : 'items',
                messageProperty : 'message',
                totalProperty   : 'totalCount' //Required for dynamic paging
            },
            api: {
                destroy  : '/cake3/rd_cake/ap-profiles/ap_profile_ap_delete.json'
            },
            simpleSortMode: true //This will only sort on one column (sort) and a direction(dir) value ASC or DESC
    },
    autoLoad: false
});

Ext.define('Rd.store.sAccessPointEntries', {
    extend      : 'Ext.data.Store',
    model       : 'Rd.model.mAccessPointEntry',
    remoteSort  : false,
    proxy: {
            type    : 'ajax',
            format  : 'json',
            batchActions: true, 
            url     : '/cake3/rd_cake/ap-profiles/ap_profile_entries_index.json',
            reader: {
                type            : 'json',
                rootProperty    : 'items',
                messageProperty : 'message',
                totalProperty   : 'totalCount' //Required for dynamic paging
            },
            api: {
                destroy  : '/cake3/rd_cake/ap-profiles/ap-profile-entry-delete.json'
            },
            simpleSortMode: true //This will only sort on one column (sort) and a direction(dir) value ASC or DESC
    },
    autoLoad    : false
});

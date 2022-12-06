Ext.define('Rd.store.sMtHotspotActives', {
    extend      : 'Ext.data.Store',
    model       : 'Rd.model.mMtHotspotActive',
    remoteSort  : false,
    proxy: {
        type    : 'ajax',
        format  : 'json',
        batchActions: true, 
        url     : '/cake4/rd_cake/dynamic-clients/mt-hotspot-active.json',
        reader: {
            type            : 'json',
            rootProperty    : 'items',
            messageProperty : 'message',
            totalProperty   : 'totalCount' //Required for dynamic paging
        },
        simpleSortMode: true //This will only sort on one column (sort) and a direction(dir) value ASC or DESC
    },
    autoLoad: false
});

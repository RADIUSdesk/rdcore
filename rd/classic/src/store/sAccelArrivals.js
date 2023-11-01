Ext.define('Rd.store.sAccelArrivals', {
    extend      : 'Ext.data.Store',
    model       : 'Rd.model.mAccelArrival',
    proxy       : {
        type    : 'ajax',
        format  : 'json',
        batchActions: true, 
        url     : '/cake4/rd_cake/accel-arrivals/index.json',
        reader: {
            type            : 'json',
            rootProperty    : 'items',
            messageProperty : 'message',
            totalProperty   : 'totalCount' //Required for dynamic paging
        },
        simpleSortMode: true //This will only sort on one column (sort) and a direction(dir) value ASC or DESC
    },
    autoLoad    : true
});


Ext.define('Rd.store.sNas', {
    extend: 'Ext.data.Store',
    model: 'Rd.model.mNas',
    pageSize: 100,
    remoteSort: true,
    remoteFilter: true,
    proxy: {
            type    : 'ajax',
            format  : 'json',
            batchActions: true, 
            url     : '/cake3/rd_cake/nas/index.json',
            reader: {
                type: 'json',
                rootProperty: 'items',
                messageProperty: 'message',
                totalProperty: 'totalCount' //Required for dynamic paging
            },
            api: {
                destroy  : '/cake3/rd_cake/nas/delete.json'
            },
            simpleSortMode: true //This will only sort on one column (sort) and a direction(dir) value ASC or DESC
    },
  /*  listeners: {
        load: function(store, records, success, options) {
            var me = options.scope;
            Ext.each(records, function(record) {
               // this.addMarker(record.data);
                console.log(record.data);
            }, me)
        },
        scope: this
    }, */
    autoLoad: false
});

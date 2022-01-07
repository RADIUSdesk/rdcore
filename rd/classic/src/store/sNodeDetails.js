Ext.define('Rd.store.sNodeDetails', {
    extend		: 'Ext.data.Store',
    model		: 'Rd.model.mNodeDetail',
    remoteSort	: false,
    proxy: {
            type    : 'ajax',
            format  : 'json',
            batchActions: true, 
            url     : '/cake3/rd_cake/mesh-reports/view_node_details.json',
            reader: {
                type            : 'json',
                rootProperty    : 'items',
                messageProperty : 'message',
                totalProperty   : 'totalCount' //Required for dynamic paging
            }
    },
    autoLoad: false
});

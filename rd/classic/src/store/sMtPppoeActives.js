Ext.define('Rd.store.sMtPppoeActives', {
    extend      : 'Ext.data.Store',
    model       : 'Rd.model.mMtPppoeActive',
    remoteSort  : false,
    proxy: {
        type    : 'ajax',
        format  : 'json',
        batchActions: true, 
        url     : '/cake4/rd_cake/dynamic-clients/mt-pppoe-active.json',
        reader: {
            type            : 'json',
            rootProperty    : 'items',
            messageProperty : 'message',
            totalProperty   : 'totalCount' //Required for dynamic paging
        },
        listeners: { 
            exception: function(proxy, response, options) {
                var jsonData = response.responseJson;
                Ext.Msg.show({
                    title       : "Error",
                    msg         : response.request.url + '<br>' + response.status + ' ' + response.statusText+"<br>"+jsonData.message,
                    modal       : true,
                    buttons     : Ext.Msg.OK,
                    icon        : Ext.Msg.ERROR,
                    closeAction : 'destroy'
                });
            }
        },
        simpleSortMode: true //This will only sort on one column (sort) and a direction(dir) value ASC or DESC
    },
    autoLoad: false
});

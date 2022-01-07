Ext.define('Rd.store.sAccessProvidersTreeGrid', {
    extend: 'Ext.data.TreeStore',
    model: 'Rd.model.mAccessProviderTreeGrid',
    requires    : [   
        'Rd.model.mAccessProviderTreeGrid'
    ],
    proxy: {
            type    : 'ajax',
            url     : '/cake3/rd_cake/access-providers/index-tree-grid.json',
            reader: {
                type            : 'json',
                rootProperty    : 'items',
                messageProperty : 'message'
            }
    },
    root: {
        username: i18n('sLogged_in_user'),
        leaf: false, 
        id:'0', 
        iconCls: 'x-fa fa-bars txtM1', 
        expanded: false,
        monitor: 'na', 
        active: 'na',
        style : "color:#091D34; font-size:large;",
        level : 0
    },
    listeners: {
        load: function( store, records, a,successful,b) {
            if(!successful){
                Ext.ux.Toaster.msg(
                        i18n('sError_encountered'),
                        store.getProxy().getReader().rawData.message.message,
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
                );
            }  
        },
        exception: function(proxy, response, operation){
            Ext.ux.Toaster.msg(
                        i18n('sError_encountered'),
                        response.responseText,
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
                );
        },
        scope: this
    },
    autoLoad: true
});

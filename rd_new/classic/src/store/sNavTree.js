Ext.define('Rd.store.sNavTree', {
    extend: 'Ext.data.TreeStore',
    model: 'Rd.model.mNavTree',
    requires    : [   
        'Rd.model.mNavTree'
    ],
    proxy: {
            type    : 'ajax',
            url     : '/cake3/rd_cake/dashboard/nav-tree.json',
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
        iconCls: 'admin', 
        expanded: false,
        monitor: 'na', 
        active: 'na'
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

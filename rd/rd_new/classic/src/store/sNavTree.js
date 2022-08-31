Ext.define('Rd.store.sNavTree', {
    extend: 'Ext.data.TreeStore',
    model: 'Rd.model.mNavTree',
    requires    : [   
        'Rd.model.mNavTree'
    ],
    proxy: {
        type: 'memory',
        reader: {
            type        : 'json',
            rootProperty: 'items'
        }
    },
    root: {
        id:'0'
    },
    listeners: {
        load: function( store, records, a,successful,b) {
            console.log("GOOOOOO");
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
    autoLoad: false
});

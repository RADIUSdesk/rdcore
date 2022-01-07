Ext.define('Rd.store.sAcos', {
    extend: 'Ext.data.TreeStore',
    model: 'Rd.model.mAco',
    autoLoad: true,
    proxy: {
            type    : 'ajax',
            format  : 'json',
            batchActions: true, 
            url     : '/cake3/rd_cake/acos-rights/index.json',
            reader: {
                type: 'json',
                rootProperty: 'items',
                messageProperty: 'message'
            },
            api: {
                read    : '/cake3/rd_cake/acos-rights/index.json',
                destroy : '/cake3/rd_cake/acos-rights/delete.json'
            }
    },
    root: {alias: i18n('sAccess_control_objects_br_ACOs_br'),leaf: false, id:'0', iconCls: 'root', expanded: false},
    folderSort: true,
    clearOnLoad: true,
    listeners: {
        load: function( store, records, a,successful,b) {
            if(!successful){
                Ext.ux.Toaster.msg(
                        i18n('sError_encountered'),
                        store.getProxy().getReader().rawData.message.message,
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
                );
            //console.log(store.getProxy().getReader().rawData.message.message);
            }  
        },
        scope: this
    }
});

Ext.define('Rd.store.sClouds', {
    extend      : 'Ext.data.TreeStore',
    rootVisible : false,
    autoLoad    : true,
    proxy   : {
        type    : 'ajax',
        url     : '/cake3/rd_cake/clouds/index.json',
        reader: {
            type        : 'json',
            rootProperty: 'items',
            successProperty: 'success',
            totalProperty: 'total'
        }
    },
    rootProperty: 'items'
});

/*
Ext.define('Rd.store.sTreeTags', {
    extend  : 'Ext.data.TreeStore',
    model   : 'Rd.model.mTreeTag',
    autoLoad: true,
    proxy   : {
        type    : 'ajax',
        format  : 'json',
        batchActions: true, 
        url     : '/cake3/rd_cake/tree-tags/index.json',
        reader  : {
            type            : 'json',
            rootProperty    : 'items',
            messageProperty : 'message'
        },
        api: {
            read    : '/cake3/rd_cake/tree-tags/index.json',
            destroy : '/cake3/rd_cake/tree-tags/delete.json'
        }
    },
    root: {name : 'Grouping',leaf: false, id:'0', iconCls: 'root', expanded: true},
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
*/

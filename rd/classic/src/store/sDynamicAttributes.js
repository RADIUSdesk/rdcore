
Ext.define('Rd.store.sDynamicAttributes', {
    extend: 'Ext.data.Store',
    model: 'Rd.model.mDynamicAttribute',
    proxy: {
            type    : 'ajax',
            format  : 'json',
            batchActions: true, 
            url     : '/cake3/rd_cake/nas/dynamic_attributes.json',
            reader: {
                type: 'json',
                rootProperty: 'items',
                messageProperty: 'message'
            }
    },
    autoLoad: true
});

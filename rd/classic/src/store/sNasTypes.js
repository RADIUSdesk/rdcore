Ext.define('Rd.store.sNasTypes', {
    extend: 'Ext.data.Store',
    model: 'Rd.model.mNasType',
    proxy: {
            type    : 'ajax',
            format  : 'json',
            batchActions: true, 
            url     : '/cake4/rd_cake/nas/nas-types.json',
            reader: {
                type: 'json',
                rootProperty: 'items',
                messageProperty: 'message'
            }
    },
    autoLoad: true
});

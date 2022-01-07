Ext.define('Rd.store.sEncryptionOptions', {
    extend: 'Ext.data.Store',
    model: 'Rd.model.mEncryptionOption',
    proxy: {
            type    : 'ajax',
            format  : 'json',
            batchActions: true, 
            url     : '/cake3/rd_cake/meshes/encryption_options.json',
            reader: {
                type: 'json',
                rootProperty: 'items',
                messageProperty: 'message'
            }
    },
    autoLoad: true
});

Ext.define('Rd.store.sAttributes', {
    extend: 'Ext.data.Store',
    model: 'Rd.model.mAttribute',
    proxy: {
            'type'  :'ajax',
            'url'   : '/cake4/rd_cake/profile-components/attributes.json',
            format  : 'json',
            reader: {
                type: 'json',
                rootProperty: 'items'
            }
    },
    autoLoad: true
});

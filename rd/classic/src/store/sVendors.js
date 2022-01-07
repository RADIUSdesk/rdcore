Ext.define('Rd.store.sVendors', {
    extend: 'Ext.data.Store',
    model: 'Rd.model.mVendor',
    proxy: {
            'type'  :'ajax',
            'url'   : '/cake3/rd_cake/profile-components/vendors.json',
            format  : 'json',
            reader: {
                type: 'json',
                rootProperty: 'items'
            }
    },
    autoLoad: true
});

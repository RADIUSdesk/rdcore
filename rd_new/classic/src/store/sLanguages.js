Ext.define('Rd.store.sLanguages', {
    extend: 'Ext.data.Store',
    fields: ['id', 'country', 'language', 'icon_file', 'text','rtl'],
    proxy: {
        type    : 'ajax',
        format  : 'json',
        url     : '/cake4/rd_cake/dashboard/i18n.json', 
        reader: {
            type            : 'json',
            rootProperty    : 'items'
        }
    },
    autoLoad: true
});

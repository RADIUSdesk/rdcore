Ext.define('Rd.store.sCountries', {
    extend: 'Ext.data.Store',
    model: 'Rd.model.mI18nCountry',
    proxy: {
            'type'  :'rest',
            'url'   : '/cake3/rd_cake/countries',
            format  : 'json', 
            reader: {
                type: 'json',
                rootProperty: 'items'
            }  
    },
    autoLoad: true
});

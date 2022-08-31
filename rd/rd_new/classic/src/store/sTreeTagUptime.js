
Ext.define('Rd.store.sTreeTagUptime', {
    extend      : 'Ext.data.Store',
	fields: [
       {name: 'minutes', type: 'float'},
       {name: 'minutes_readable', type: 'string'}
    ],
	storeId		: 'sTreeTagUptime',	
	data: []
});

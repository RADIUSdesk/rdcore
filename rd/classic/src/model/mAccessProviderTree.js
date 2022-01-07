Ext.define('Rd.model.mAccessProviderTree', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',       type: 'int'     },
         {name: 'username', type: 'string'  }
        ],
    idProperty: 'id'
});

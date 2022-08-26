Ext.define('Rd.model.mAccessProviderGrid', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id',       type: 'int'     },
        {name: 'owner', type: 'string'  },
        {name: 'username', type: 'string'  },
         'name','surname', 'phone', 'email', 'monitor', 'active','language',
        {name: 'created',           type: 'date'},
        {name: 'modified',          type: 'date' },
        {name: 'created_in_words',  type: 'string'  },
        {name: 'modified_in_words', type: 'string'  },
        {name: 'update',           type: 'bool'},
        {name: 'delete',           type: 'bool'}
    ]
});

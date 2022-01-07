Ext.define('Rd.model.mAccessProviderTreeGrid', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id',       type: 'int'     },
        {name: 'username', type: 'string'  },
         'name','surname', 'phone', 'email', 'monitor', 'active','language',
        {name: 'created',           type: 'date',       dateFormat: 'Y-m-d H:i:s'   },
        {name: 'modified',          type: 'date',       dateFormat: 'Y-m-d H:i:s'   },
        {name: 'created_in_words',  type: 'string'  },
        {name: 'modified_in_words', type: 'string'  },
        {name: 'notes',            type: 'bool'},
        {name: 'update',           type: 'bool'},
        {name: 'delete',           type: 'bool'}
    ]
});

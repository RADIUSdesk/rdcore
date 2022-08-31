Ext.define('Rd.model.mRadpostauth', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id',           type: 'int'     },
        {name: 'username',     type: 'string'  },
        {name: 'realm',        type: 'string'  },
        {name: 'pass',         type: 'string'  },
        {name: 'reply',        type: 'string'  },
        {name: 'nasname',      type: 'string'  },
        'authdate'
        ]
});

Ext.define('Rd.model.mProfileComponentEdit', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id',           type: 'string'  },
        {name: 'type',         type: 'string'  },
        {name: 'groupname',    type: 'string'  },
        {name: 'attribute',    type: 'string'  },
        {name: 'op',           type: 'string'  },
        {name: 'value',        type: 'string'  },
        {name: 'comment',      type: 'string'  }
        ]
});

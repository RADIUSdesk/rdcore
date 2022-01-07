Ext.define('Rd.model.mTemplateEdit', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id',           type: 'int'     },
        {name: 'attribute',    type: 'string'  },
        {name: 'type',         type: 'string'  },
        {name: 'tooltip',      type: 'string'  },
        {name: 'unit',         type: 'string'  }
        ]
});

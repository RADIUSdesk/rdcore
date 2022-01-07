Ext.define('Rd.model.mPrivateAttribute', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id',           type: 'string'  },
        {name: 'type',         type: 'string'  },
        {name: 'attribute',    type: 'string'  },
        {name: 'op',           type: 'string'  },
        {name: 'value',        type: 'string'  },
        {name: 'edit',         type: 'bool'    },
        {name: 'delete',       type: 'bool'    }
        ]
});

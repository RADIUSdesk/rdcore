Ext.define('Rd.model.mDynamicPair', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',           type: 'int'     },
         {name: 'name',         type: 'string'  },
         {name: 'value',        type: 'string'  },
         {name: 'priority',     type: 'int'     },
         'dynamic_detail_id'
        ]
});

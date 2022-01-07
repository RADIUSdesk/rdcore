Ext.define('Rd.model.mNote', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',           type: 'int'     },
         {name: 'note',         type: 'string'  },
         {name: 'owner',        type: 'string'  },
         {name: 'available_to_siblings',  type: 'bool'},
         {name: 'delete',       type: 'bool'}
        ]
});

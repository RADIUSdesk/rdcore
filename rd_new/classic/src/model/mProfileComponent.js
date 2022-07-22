Ext.define('Rd.model.mProfileComponent', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',           type: 'int'     },
         {name: 'name',         type: 'string'  },
         {name: 'owner',        type: 'string'  },
         {name: 'check_attribute_count',        type: 'int'  },
         {name: 'reply_attribute_count',        type: 'int'  },
         {name: 'available_to_siblings',  type: 'bool'},
         {name: 'notes',        type: 'bool'},
         {name: 'update',       type: 'bool'},
         {name: 'delete',       type: 'bool'}
        ]
});

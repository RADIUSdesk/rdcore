Ext.define('Rd.model.mPredefinedCommand', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',           type: 'string'  },
         {name: 'name',         type: 'string'  },
         {name: 'command',      type: 'string'  },
         {name: 'owner',        type: 'string'  },
         {name: 'available_to_siblings',  type: 'bool'},
         {name: 'update',       type: 'bool'},
         {name: 'delete',       type: 'bool'},
         {name: 'created',           type: 'date',       dateFormat: 'Y-m-d H:i:s'   },
         {name: 'modified',          type: 'date',       dateFormat: 'Y-m-d H:i:s'   },
         {name: 'created_in_words',  type: 'string'  },
         {name: 'modified_in_words', type: 'string'  }
        ]
});

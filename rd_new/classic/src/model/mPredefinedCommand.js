Ext.define('Rd.model.mPredefinedCommand', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',           type: 'string'  },
         {name: 'name',         type: 'string'  },
         {name: 'command',      type: 'string'  },
         {name: 'owner',        type: 'string'  },
         {name: 'update',       type: 'bool'},
         {name: 'delete',       type: 'bool'},
         {name: 'created',           type: 'date'},
         {name: 'modified',          type: 'date'},
         {name: 'created_in_words',  type: 'string'  },
         {name: 'modified_in_words', type: 'string'  }
        ]
});

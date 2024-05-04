Ext.define('Rd.model.mPrivatePsk', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',           type: 'int'     },
         {name: 'ppsk_name',    type: 'string'  },
         {name: 'name',         type: 'string'  },
         {name: 'comment',      type: 'string'  },
         {name: 'vlan',         type: 'string'  },
         {name: 'system_wide',  type: 'bool'},
         {name: 'update',       type: 'bool'},
         {name: 'delete',       type: 'bool'},
         {name: 'created',           type: 'date',       dateFormat: 'Y-m-d H:i:s'   },
        {name: 'modified',          type: 'date',       dateFormat: 'Y-m-d H:i:s'   },
        {name: 'created_in_words',  type: 'string'  },
        {name: 'modified_in_words', type: 'string'  }
        ]
});

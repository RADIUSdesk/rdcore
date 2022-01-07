Ext.define('Rd.model.mRegistrationRequest', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',           type: 'int'     },
         {name: 'email',        type: 'string'  },
         {name: 'state',        type: 'string'  },
         {name: 'update',       type: 'bool'},
         {name: 'delete',       type: 'bool'},
         {name: 'created',           type: 'date',       dateFormat: 'Y-m-d H:i:s'   },
         {name: 'modified',          type: 'date',       dateFormat: 'Y-m-d H:i:s'   },
         {name: 'created_in_words',  type: 'string'  },
         {name: 'modified_in_words', type: 'string'  }
        ]
});

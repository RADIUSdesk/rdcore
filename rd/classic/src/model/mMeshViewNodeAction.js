Ext.define('Rd.model.mMeshViewNodeAction', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',           type: 'int'  },
         {name: 'action'        },
         {name: 'command',      type: 'string'  },
         {name: 'status',       type: 'string'  },
         {name: 'created'       },
         {name: 'modified'      },
         {name: 'created_in_words',  type: 'string'  },
         {name: 'modified_in_words', type: 'string'  }
        ]
});

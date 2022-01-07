Ext.define('Rd.model.mAction', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',           type: 'int'  },
         {name: 'action'        },
         {name: 'command',      type: 'string'  },
         {name: 'status',       type: 'string'  },
         {name: 'created'       },
         {name: 'modified'      }
        ]
});

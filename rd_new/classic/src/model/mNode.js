Ext.define('Rd.model.mNode', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',               type: 'int'     },
         {name: 'mesh_id',          type: 'int'     },
         {name: 'name',             type: 'string'  },
         {name: 'description',      type: 'string'  },
         {name: 'mac',              type: 'string'  },
         {name: 'hardware',         type: 'string'  },
         {name: 'hw_human',         type: 'string'  },
         {name: 'power',            type: 'int'     },
         {name: 'ip',               type: 'string'  },
          'static_entries',
          'static_exits'
        ]
});

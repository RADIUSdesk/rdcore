Ext.define('Rd.model.mMeshExit', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',               type: 'int'     },
         {name: 'mesh_id',          type: 'int'     },
         {name: 'type',             type: 'string'  },
         'connects_with',
         {name: 'vlan',             type: 'int'  },
         {name: 'auto_detect',      type: 'bool'}
        ]
});

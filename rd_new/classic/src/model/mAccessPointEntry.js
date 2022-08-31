Ext.define('Rd.model.mAccessPointEntry', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',               type: 'int'     },
         {name: 'ap_profile_id',    type: 'int'     },
         {name: 'name',             type: 'string'  },
         {name: 'encryption',       type: 'string'  },
         {name: 'hidden',           type: 'bool'    },
         {name: 'isolate',          type: 'bool'    },
         {name: 'special_key',      type: 'string'  },
         {name: 'auth_server',      type: 'string'  },
         {name: 'auth_secret',      type: 'string'  },
         {name: 'connected_to_exit',type: 'bool'    }
        ]
});

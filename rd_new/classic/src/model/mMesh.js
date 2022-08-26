Ext.define('Rd.model.mMesh', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',               type: 'int'     },
         {name: 'name',             type: 'string'  },
         {name: 'ssid',             type: 'string'  },
         {name: 'bssid',            type: 'string'  },
         {name: 'owner',            type: 'string'  },
         {name: 'node_count',       type: 'int'},
         {name: 'nodes_up',         type: 'int'},
         {name: 'nodes_down',       type: 'int'},
         {name: 'connected_users',  type: 'int'},
         {name: 'created',          type: 'date'},
         {name: 'modified',         type: 'date'},
         {name: 'last_contact',     type: 'date'},
         {name: 'created_in_words', type: 'string'  },
         {name: 'modified_in_words',type: 'string'  },
         {name: 'last_contact_in_words', type: 'string' }, 
         {name: 'update',           type: 'bool'},
         {name: 'delete',           type: 'bool'},
         {name: 'view',             type: 'bool'}
        ]
});

Ext.define('Rd.model.mApProfile', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',               type: 'int'     },
         {name: 'name',             type: 'string'  },
         {name: 'owner',            type: 'string'  },
         {name: 'ap_count',         type: 'int'},
		 {name: 'available_to_siblings',  type: 'bool'},
         {name: 'aps_up',           type: 'int'},
         {name: 'aps_down',         type: 'int'},
         {name: 'connected_users',  type: 'int'},
         {name: 'notes',            type: 'bool'},
         {name: 'update',           type: 'bool'},
         {name: 'delete',           type: 'bool'},
         {name: 'view',             type: 'bool'}
        ]
});

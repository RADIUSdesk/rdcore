Ext.define('Rd.model.mProfile', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',           type: 'int'     },
         {name: 'name',         type: 'string'  },
         {name: 'owner',        type: 'string'  },
         {name: 'available_to_siblings',  type: 'bool'},
         {name: 'data_cap_in_profile',  type: 'bool'},
         {name: 'time_cap_in_profile',  type: 'bool'},
         'profile_components',
         {name: 'notes',        type: 'bool'},
         {name: 'update',       type: 'bool'},
         {name: 'delete',       type: 'bool'}
        ]
});

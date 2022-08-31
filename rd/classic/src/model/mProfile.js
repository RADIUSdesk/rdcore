Ext.define('Rd.model.mProfile', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',           type: 'int'     },
         {name: 'name',         type: 'string'  },
           'profile_components',
         {name: 'update',       type: 'bool'},
         {name: 'delete',       type: 'bool'}
        ]
});

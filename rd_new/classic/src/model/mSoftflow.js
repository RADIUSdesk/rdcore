Ext.define('Rd.model.mSoftflow', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',           type: 'int'     },
		 {name: 'extra_value',  type: 'string' },
         {name: 'available_to_siblings',  type: 'bool'},
         {name: 'update',       type: 'bool'},
         {name: 'delete',       type: 'bool'}
        ]
});

Ext.define('Rd.model.mTrafficClass', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',           type: 'int'     },
         {name: 'name',         type: 'string'  },
         {name: 'owner',        type: 'string'  },    
         {name: 'description',  type: 'string'  },
         {name: 'available_to_siblings',  type: 'bool'},
		 {name: 'extra_name',   type: 'string'},
		 {name: 'extra_value',  type: 'string'},  
         {name: 'update',       type: 'bool'},
         {name: 'delete',       type: 'bool'}
        ]
});

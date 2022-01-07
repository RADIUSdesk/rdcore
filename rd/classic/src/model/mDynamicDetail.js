Ext.define('Rd.model.mDynamicDetail', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',       type: 'int'     },
         {name: 'name',     type: 'string'  },
         {name: 'owner',    type: 'string'  },
            'user_id',
            'phone','fax', 		'cell', 'email','url', 'street_no', 'street','town_suburb','city','country','lat','lon','theme',
			'register_users', 	'lost_password',
         {name: 'available_to_siblings',  type: 'bool'},
         {name: 'notes',   type: 'bool'},
         {name: 'update',  type: 'bool'},
         {name: 'delete',  type: 'bool'}
        ]
});

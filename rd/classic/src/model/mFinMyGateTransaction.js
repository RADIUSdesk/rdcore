Ext.define('Rd.model.mFinMyGateTransaction', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id',           			type: 'int'     },
		{name: 'user',         			type: 'string'  },
		{name: 'user_id',      			type: 'int'     },
		{name: 'fin_my_gate_token',     type: 'string'  },
		{name: 'fin_my_gate_token_id',  type: 'int'     },
		{name: 'permanent_user',        type: 'string'  },
		{name: 'status',   	   			type: 'string'  },
		{name: 'type',   	   			type: 'string'  }, 
		{name: 'my_gate_reference',   	type: 'string'  },
		{name: 'message',   			type: 'string'  },
        {name: 'amount',   	   			type: 'string'  },   
        {name: 'created',      			type: 'date',       dateFormat: 'Y-m-d H:i:s'   },
        {name: 'modified',     			type: 'date',       dateFormat: 'Y-m-d H:i:s'   },
        {name: 'notes',        			type: 'bool'},
        {name: 'update',       			type: 'bool'},
        {name: 'delete',       			type: 'bool'}
        ]
});


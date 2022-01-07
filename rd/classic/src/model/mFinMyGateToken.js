Ext.define('Rd.model.mFinMyGateToken', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id',           			type: 'int'     },
		{name: 'user',         			type: 'string'  },
		{name: 'user_id',      			type: 'int'     },
		{name: 'permanent_user',        type: 'string'  },
		{name: 'permanent_user_id', 	type: 'int'     },
		{name: 'fin_payment_plan',      type: 'string'  },
		{name: 'fin_payment_plan_id', 	type: 'int'     },
		{name: 'client_pin',         	type: 'string'  },
		{name: 'client_uci',         	type: 'string'  },
		{name: 'client_uid',         	type: 'string'  },
		{name: 'override',         		type: 'string'  },
		{name: 'override_completed', 	type: 'bool'    },
		{name: 'active',       			type: 'bool'    },       
        {name: 'created',      			type: 'date',       dateFormat: 'Y-m-d H:i:s'   },
        {name: 'modified',     			type: 'date',       dateFormat: 'Y-m-d H:i:s'   },
        {name: 'notes',        			type: 'bool'},
        {name: 'update',       			type: 'bool'},
        {name: 'delete',       			type: 'bool'}
        ]
});


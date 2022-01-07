Ext.define('Rd.model.mFinPaymentPlan', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id',           type: 'int'     },
		{name: 'user',         type: 'string'  },
		{name: 'user_id',      type: 'int'     },
		{name: 'profile',      type: 'string'  },
		{name: 'profile_id',   type: 'int'     },
        {name: 'name',         type: 'string'  },
        {name: 'description',  type: 'string'  },
        {name: 'type',         type: 'string'  },
        {name: 'currency_code',type: 'string'  },
        {name: 'value',   	   type: 'string'  },
        {name: 'tax',    	   type: 'string'  },
		{name: 'active',       type: 'bool'    },       
        {name: 'created',      type: 'date',       dateFormat: 'Y-m-d H:i:s'   },
        {name: 'modified',     type: 'date',       dateFormat: 'Y-m-d H:i:s'   },
        {name: 'notes',        type: 'bool'},
        {name: 'update',       type: 'bool'},
        {name: 'delete',       type: 'bool'}
        ]
});


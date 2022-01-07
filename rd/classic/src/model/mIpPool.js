Ext.define('Rd.model.mIpPool', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id',                type: 'int'     },
		{name: 'pool_name',         type: 'string'  },
        {name: 'framedipaddress',   type: 'string'  },
		{name: 'nasipaddress',   	type: 'string'  },
		{name: 'calledstationid',   type: 'string'  },
        {name: 'callingstationid', 	type: 'string'  },
        {name: 'expiry_time',    	type: 'date',       dateFormat: 'Y-m-d H:i:s'   },
        {name: 'username',          type: 'string'  },
        {name: 'pool_key',        	type: 'string'  },
		{name: 'nasidentifier',     type: 'string'  },
        {name: 'extra_value',       type: 'string'  },
        {name: 'active',            type: 'bool'    },
		{name: 'permanent_user_id', type: 'int'     },
        {name: 'created',           type: 'date',       dateFormat: 'Y-m-d H:i:s'   },
        {name: 'modified',          type: 'date',       dateFormat: 'Y-m-d H:i:s'   }
    ]
});


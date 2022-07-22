Ext.define('Rd.model.mUnknownDynamicClient', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',               type: 'int'     },
         {name: 'nasidentifier',    type: 'string'  },
         {name: 'calledstationid',  type: 'string'  },
		 {name: 'last_contact_ip',  type: 'string'  },
		 {name: 'last_contact',    	type: 'date',      dateFormat: 'Y-m-d H:i:s'   },
         'last_contact_human',
         'country_code',
         'country_name',
         'city',
         'postal_code'
        ]
});


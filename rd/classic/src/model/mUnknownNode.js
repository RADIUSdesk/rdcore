Ext.define('Rd.model.mUnknownNode', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',               type: 'int'     },
         {name: 'mac',              type: 'string'  },
         {name: 'vendor',         	type: 'string'  },
		 {name: 'from_ip',         	type: 'string'  },
		 {name: 'vendor',         	type: 'string'  },
		 {name: 'gateway',  		type: 'bool'    },
		 {name: 'created_in_words', type: 'string'  },
         {name: 'modified_in_words',type: 'string'  },
         'new_server',
         'new_server_protocol',
         'new_server_status',
         'new_mode',
         'new_mode_status',
         'country_code',
         'country_name',
         'state_name',
         'state_code',
         'city',
         'postal_code',
         'name',
         'token_key'
        ]
});

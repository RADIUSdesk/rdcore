Ext.define('Rd.model.mUnknownAp', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',                   type: 'int'     },
         {name: 'mac',                  type: 'string'  },
         {name: 'vendor',         	    type: 'string'  },
		 {name: 'last_contact',    	    type: 'date',       dateFormat: 'Y-m-d H:i:s'   },
		 {name: 'last_contact_from_ip', type: 'string' },
		 {name: 'created_in_words',     type: 'string'  },
         {name: 'modified_in_words',    type: 'string'  },
         'country_code',
         'country_name',
         'state_name',
         'state_code',
         'city',
         'postal_code',
         'new_server',
         'new_server_protocol',
         'new_server_status',
         'new_mode',
         'new_mode_status',
         'name',
         'token_key'
        ]
});

Ext.define('Rd.model.mAnalytics', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',                   type: 'int'     },
         {name: 'ap_profile_id',        type: 'int'     },
		 {name: 'ap_profile',           type: 'string'  },
         {name: 'name',                 type: 'string'  },
		 {name: 'owner',        	    type: 'string'  },
         {name: 'description',          type: 'string'  },
         {name: 'mac',                  type: 'string'  },
		 {name: 'last_contact',    	    type: 'date',       dateFormat: 'Y-m-d H:i:s'   },
		 {name: 'last_contact_from_ip', type: 'string' },
		 {name: 'available_to_siblings',type: 'bool'},
         {name: 'update',       	    type: 'bool'},
         {name: 'delete',       	    type: 'bool'},      
         'last_contact_human',
         'state',
         'country_code',
         'country_name',
         'city',
         'postal_code',
         'data_past_hour',
         'newest_station',
         'newest_time',
         'newest_vendor',
         'ssids',
         'hardware',
         'hw_human',
         'last_cmd',
	     'last_cmd_status',
	     'openvpn_list'		
        ]
});


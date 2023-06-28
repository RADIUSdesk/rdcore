Ext.define('Rd.model.mSchedule', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',           type: 'string'  },
         {name: 'name',         type: 'string'  },
         {name: 'description',  type: 'string'  },
         {name: 'type',         type: 'string'  },
         {name: 'cloud_id',     type: 'int'  },
         {name: 'created',      type: 'date'},
         {name: 'modified',     type: 'date'},
         {name: 'command_type', type: 'string'  },
         {name: 'time_human',   type: 'string'  },
         {name: 'everyday',     type: 'bool'},
         {name: 'for_system',  	type: 'bool'},
        ]
});


/*
"id": 12,
"firewall_profile_id": 1,
"description": "",
"type": "firewall_profile_entry",
"command": "",
"predefined_command_id": null,
"mo": true,
"tu": true,
"we": true,
"th": true,
"fr": true,
"sa": true,
"su": true,
"event_time": "",
"created": "2023-06-27T13:09:29+00:00",
"modified": "2023-06-27T13:09:29+00:00",
"firewall_profile_entry_firewall_apps": [],
"start_time_human": "0:00",
"end_time_human": "0:00",
"human_span": "0 minutes",
"for_system": true
*/
     

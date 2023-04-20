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
"id": 1,
"schedule_id": 2,
"description": "reboot",
"type": "schedule_entry",
"command": "reboot",
"predefined_command_id": null,
"mo": true,
"tu": true,
"we": true,
"th": true,
"fr": true,
"sa": true,
"su": true,
"event_time": "0",
"created": "2023-04-20T12:50:26+00:00",
"modified": "2023-04-20T12:50:26+00:00",
"predefined_command": null,
"command_type": "command",
"time_human": "0:00",
"everyday": true,
"for_system": true
*/
     

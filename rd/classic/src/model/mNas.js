Ext.define('Rd.model.mNas', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',           type: 'int'     },
         {name: 'nasname',      type: 'string'  },
         {name: 'shortname',    type: 'string'  },
         {name: 'nasidentifier',type: 'string'  },
         {name: 'type',         type: 'string'  },
         {name: 'ports',        type: 'string'  },
         {name: 'secret',       type: 'string'  },
         {name: 'community',    type: 'string'  },
         {name: 'server',       type: 'string'  },
         {name: 'description',  type: 'string'  },
          'connection_type', 'record_auth', 'dynamic_attribute', 'dynamic_value', 'monitor', 'ping_interval',
          'heartbeat_dead_after', 'session_auto_close', 'session_dead_time', 'on_public_maps','lat','lon','photo_file_name',
         {name: 'owner',        type: 'string'  },
          'user_id',
          'realms', 'tags','connection_type',
          'status',
         //{name:'status_time', type: 'date', dateFormat: 'Y-m-d H:i:s'},
         {name:'status_time', type: 'int'},
         {name: 'available_to_siblings',  type: 'bool'},
         {name: 'notes',        type: 'bool'},
         {name: 'update',       type: 'bool'},
         {name: 'delete',       type: 'bool'},
         {name: 'manage_tags',  type: 'bool'}
        ]
});

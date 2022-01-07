Ext.define('Rd.model.mNotificationList', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',               type: 'int'     },
         {name: 'object_id',        type: 'int'     },
		 {name: 'object_name',     	type: 'string'  },
         {name: 'user_id',          type: 'int'  	},
		 {name: 'object_type',      type: 'string'  },
         {name: 'related_type',     type: 'string'  },
         {name: 'parent_id',        type: 'int'  	},
         {name: 'parent_name',      type: 'string'  },
         {name: 'severity',         type: 'int'     },
         {name: 'is_resolved',      type: 'bool'	},
         {name: 'notification_datetime',	type: 'date',       dateFormat: 'Y-m-d H:i:s'   },
		 {name: 'notification_type',    	type: 'string'  },
		 {name: 'notification_code',  		type: 'int'     },
         {name: 'short_description',		type: 'string'  },
         {name: 'description',		type: 'string'  },
         {name: 'created',			type: 'date',       dateFormat: 'Y-m-d H:i:s'   },
         {name: 'modified',			type: 'date',       dateFormat: 'Y-m-d H:i:s'   }		
        ]
});

Ext.define('Rd.model.mHardwareOwner', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',           type: 'int'     },
         {name: 'description',  type: 'string'  },
         {name: 'name',         type: 'string'  }, 
         {name: 'hardware_id',  type: 'int'     },
         {name: 'hardware',     type: 'string'  }, 
         {name: 'status',     type: 'string'  }, 
         {name: 'available_to_siblings',  type: 'bool'},          
         {name: 'update',       type: 'bool'},
         {name: 'delete',       type: 'bool'},
         {name: 'created',           type: 'date',       dateFormat: 'Y-m-d H:i:s'   },
        {name: 'modified',          type: 'date',       dateFormat: 'Y-m-d H:i:s'   },
        {name: 'created_in_words',  type: 'string'  },
        {name: 'modified_in_words', type: 'string'  }
        ]
});

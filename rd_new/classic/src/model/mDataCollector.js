Ext.define('Rd.model.mDataCollector', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',           type: 'int'     },
         {name: 'dynamic_detail_name',  type: 'string'  },
         {name: 'dynamic_detail_id',    type: 'int'  },
         {name: 'mac',          type: 'string'  },
         {name: 'email',        type: 'string'  },
         {name: 'cp_mac',       type: 'string'  },
         {name: 'public_ip',    type: 'string'  },
         {name: 'nasid',       type: 'string'  },
         {name: 'ssid',         type: 'string'  },
         {name: 'is_mobile',    type: 'bool'    },
         {name: 'created',           type: 'date',       dateFormat: 'Y-m-d H:i:s'   },
         {name: 'modified',          type: 'date',       dateFormat: 'Y-m-d H:i:s'   },
         {name: 'created_in_words',  type: 'string'  },
         {name: 'modified_in_words', type: 'string'  },
         {name: 'update',       type: 'bool'},
         {name: 'delete',       type: 'bool'}
        ]
});

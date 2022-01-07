Ext.define('Rd.model.mFinPremiumSmsTransaction', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id',           type: 'int'     },
        {name: 'txn_id',       type: 'string'  },
        {name: 'user',         type: 'string'  },
        {name: 'user_id',      type: 'int'  },
        {name: 'voucher_name', type: 'string'  },
        {name: 'voucher_id',   type: 'int'  },
        {name: 'top_up_id',    type: 'int'  },      
        {name: 'mobile',       type:   'string'    },
        {name: 'description',  type:   'string'    },
        {name: 'created',      type: 'date',       dateFormat: 'Y-m-d H:i:s'   },
        {name: 'modified',     type: 'date',       dateFormat: 'Y-m-d H:i:s'   },
        {name: 'notes',        type: 'bool'},
        {name: 'update',       type: 'bool'},
        {name: 'delete',       type: 'bool'}
        ]
});


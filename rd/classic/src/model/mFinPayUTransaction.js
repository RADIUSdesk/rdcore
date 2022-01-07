Ext.define('Rd.model.mFinPayUTransaction', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id',           type: 'int'     },
        {name: 'txn_id',       type: 'string'  },
        {name: 'user',         type: 'string'  },
        {name: 'user_id',      type: 'int'  },
        {name: 'voucher_name', type: 'string'  },
        {name: 'voucher_id',   type: 'int'  },
        {name: 'top_up_id',    type: 'int'  },
        {name: 'merchantReference', type:   'string'    },   
        {name: 'payUReference',     type:   'string'    },
        {name: 'TransactionType',   type:   'string'    },
        {name: 'TransactionState',  type:   'string'    },
        {name: 'ResultCode',        type:   'string'    },
        {name: 'ResultMessage',     type:   'string'    },
        {name: 'DisplayMessage',    type:   'string'    },
        {name: 'merchUserId',       type:   'string'    },
        {name: 'firstName',         type:   'string'    },
        {name: 'lastName',          type:   'string'    },
        {name: 'email',             type:   'string'    },            
        {name: 'mobile',            type:   'string'    },
        {name: 'regionalId',        type:   'string'    },
        {name: 'amountInCents',     type:   'int'       },
        {name: 'currencyCode',      type:   'string'    },
        {name: 'description',       type:   'string'    },
        {name: 'created',           type: 'date',       dateFormat: 'Y-m-d H:i:s'   },
        {name: 'modified',          type: 'date',       dateFormat: 'Y-m-d H:i:s'   },
        {name: 'notes',        type: 'bool'},
        {name: 'update',       type: 'bool'},
        {name: 'delete',       type: 'bool'}
        ]
});


Ext.define('Rd.model.mFinPaypalTransaction', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',           type: 'int'     },
         {name: 'txn_id',       type: 'string'  },
         {name: 'user',         type: 'string'  },
         {name: 'user_id',      type: 'int'  },
         {name: 'voucher_name', type: 'string'  },
         {name: 'voucher_id',   type: 'int'  },
         {name: 'top_up_id',    type: 'int'  },
         {name: 'business',     type: 'string'  },
         {name: 'option_name1',         type: 'string'  },
         {name: 'option_selection1',    type: 'string'  },
         {name: 'item_name',            type: 'string'  },
         {name: 'item_number',          type: 'string'  },
         {name: 'first_name',           type: 'string'  },
         {name: 'last_name',            type: 'string'  },
         {name: 'payer_email',          type: 'string'  },
         {name: 'payer_id',             type: 'string'  },
         {name: 'payer_status',         type: 'string'  },
         {name: 'payment_gross',        type: 'string'  },
         {name: 'mc_gross',             type: 'string'  },
         {name: 'mc_fee',               type: 'string'  },
         {name: 'mc_currency',          type: 'string'  },
         {name: 'payment_date',         type: 'string'  },
         {name: 'payment_status',       type: 'string'  },
         {name: 'notes',        type: 'bool'},
         {name: 'update',       type: 'bool'},
         {name: 'delete',       type: 'bool'}
        ]
});


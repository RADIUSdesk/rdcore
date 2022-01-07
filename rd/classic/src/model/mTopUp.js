Ext.define('Rd.model.mTopUp', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id',                type: 'int'     },
        {name: 'user_id',           type: 'int'     },
        {name: 'user',              type: 'string'  },
        {name: 'permanent_user_id', type: 'int'     },
        {name: 'permanent_user',    type: 'string'  },
        {name: 'data',              type: 'int'     },
        {name: 'time',              type: 'int'     },
        {name: 'days_to_use',       type: 'int'     },
        {name: 'comment',           type: 'string'  },
        {name: 'created',           type: 'date',       dateFormat: 'Y-m-d H:i:s'   },
        {name: 'modified',          type: 'date',       dateFormat: 'Y-m-d H:i:s'   },
        {name: 'created_in_words',  type: 'string'  },
        {name: 'modified_in_words', type: 'string'  },
        {name: 'type',              type: 'string'  },
        {name: 'update',            type: 'bool'},
        {name: 'delete',            type: 'bool'}
    ]
});



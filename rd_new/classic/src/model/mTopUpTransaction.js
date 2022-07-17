Ext.define('Rd.model.mTopUpTransaction', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id',                type: 'int'     },
        {name: 'user_id',           type: 'int'     },
        {name: 'user',              type: 'string'  },
        {name: 'permanent_user_id', type: 'int'     },
        {name: 'permanent_user',    type: 'string'  },
        {name: 'top_up_id',         type: 'int'     },
        {name: 'created',           type: 'date',       dateFormat: 'Y-m-d H:i:s'   },
        {name: 'modified',          type: 'date',       dateFormat: 'Y-m-d H:i:s'   },
        {name: 'created_in_words',  type: 'string'  },
        {name: 'modified_in_words', type: 'string'  },
        {name: 'type',              type: 'string'  },
        {name: 'radius_attribute',  type: 'string'  },
        {name: 'action',            type: 'string'  },
        {name: 'old_value',         type: 'string'  },
        {name: 'new_value',         type: 'string'  },
        {name: 'update',            type: 'bool'},
        {name: 'delete',            type: 'bool'}
    ]
});



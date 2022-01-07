Ext.define('Rd.model.mDynamicDetailTranslation', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',           type: 'int'     },
         {name: 'dynamic_detail_language_id',   type: 'int'  },
         {name: 'dynamic_detail_language',      type: 'string' },
         {name: 'dynamic_detail_trans_key_id',  type: 'int'  },
         {name: 'dynamic_detail_trans_key',     type: 'string' },
         {name: 'dynamic_detail_id',            type: 'int' },
         {name: 'dynamic_detail',               type: 'string' },
         {name: 'value',        type: 'string'  },
         {name: 'created',      type: 'date',       dateFormat: 'Y-m-d H:i:s'   },
         {name: 'modified',     type: 'date',       dateFormat: 'Y-m-d H:i:s'   },
         {name: 'created_in_words',  type: 'string'  },
         {name: 'modified_in_words', type: 'string'  },
         {name: 'update',       type: 'bool'},
         {name: 'delete',       type: 'bool'}
        ]
});

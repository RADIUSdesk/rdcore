Ext.define('Rd.model.mDynamicPage', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',           type: 'int'     },
         {name: 'dynamic_detail_language_id', type: 'int' },
         {name: 'language',     type: 'string'  },//iso two letter
         {name: 'language_full',     type: 'string'  },
         {name: 'name',         type: 'string'  },
         {name: 'content',      type: 'string'  }
        ]
});

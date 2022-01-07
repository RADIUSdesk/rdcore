Ext.define('Rd.model.mDnsDeskPolicy', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',           type: 'int'     },
         {name: 'name',         type: 'string'  },
         {name: 'description',  type: 'string'  },
         'blockCategoryList'
        ]
});

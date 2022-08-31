Ext.define('Rd.model.mNavTree', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',       type: 'string'  },
         {name: 'text',     type: 'string'  },
         {name: 'name',     type: 'string'  },
         {name: 'iconCls',  type: 'string'  },
         {name: 'controller',  type: 'string'  },
        ],
    idProperty: 'id'
});

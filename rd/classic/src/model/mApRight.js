Ext.define('Rd.model.mApRight', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',       type: 'int'     },
         {name: 'alias',    type: 'string'  },
         {name: 'comment',  type: 'string'  },
         {name: 'parent_id',type: 'int'     },
         {name: 'allowed',  type: 'bool'    }
        ],
    idProperty: 'id',
    //This is a funny - since a model is not traditionally associated with a tree view we have to create a 'dummy proxy'
    //which allows for the fake deleting of a model instance. We then call the store's sync method to do the real thing
    proxy: {
        type        : 'ajax',
        url         : '/cake3/rd_cake/acos-rights/index-ap.json',
        format      : 'json',
        batchActions: true, 
        reader: {
            type            : 'json',
            rootProperty    : 'items',
            messageProperty : 'message'
        }
            
    }
});

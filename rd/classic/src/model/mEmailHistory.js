Ext.define('Rd.model.mEmailHistory', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id',                type: 'int'     },
        {name: 'created',           type: 'date'},
        {name: 'modified',          type: 'date'},
        {name: 'created_in_words',  type: 'string'  },
        {name: 'modified_in_words', type: 'string'  }
    ]
});



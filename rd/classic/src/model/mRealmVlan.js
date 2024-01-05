Ext.define('Rd.model.mRealmVlan', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id',       type: 'int'      },
        {name: 'vlan',     type: 'int'      },
        {name: 'name',     type: 'string'   },
        {name: 'comment',  type: 'string'   }
    ]
});

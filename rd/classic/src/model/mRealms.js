Ext.define('Rd.model.mRealms', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',       type: 'int'     },
         {name: 'name',     type: 'string'  },
         {name: 'creator',  type: 'string'  },
         'phone','fax', 'cell', 'email','url', 'street_no', 'street','town_suburb','city','country','lat','lon',
         {name: 'available_to_siblings',  type: 'bool'},
         {name: 'update',  type: 'bool'},
         {name: 'delete',  type: 'bool'}
        ]
});

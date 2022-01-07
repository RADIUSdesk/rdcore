Ext.define('Rd.model.mRealm', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',       type: 'int'     },
         {name: 'name',     type: 'string'  },
         {name: 'owner',    type: 'string'  },
         'phone','fax', 'cell', 'email','url', 'street_no', 'street','town_suburb','city','country','lat','lon',
		 'twitter','facebook', 'youtube','google_plus','linkedin','t_c_title', 't_c_content',
         {name: 'available_to_siblings',  type: 'bool'},
         {name: 'notes',   type: 'bool'},
         {name: 'update',  type: 'bool'},
         {name: 'delete',  type: 'bool'},
         {name: 'created',           type: 'date',       dateFormat: 'Y-m-d H:i:s'   },
         {name: 'modified',          type: 'date',       dateFormat: 'Y-m-d H:i:s'   },
         {name: 'created_in_words',  type: 'string'  },
         {name: 'modified_in_words', type: 'string'  }
        ]
});

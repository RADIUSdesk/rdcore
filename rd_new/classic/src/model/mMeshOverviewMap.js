Ext.define('Rd.model.mMeshOverviewMap', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id'    },
		 {name: 'name',             type: 'string'  },
		 {name: 'center_lat', 		type: 'number'},
		 {name: 'center_lng', 		type: 'number'},
		 {name: 'clients', 			type: 'int'},
		 {name: 'leaf', 			type: 'boolean'}
    ]
});

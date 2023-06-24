Ext.define('Rd.model.mProfileComponentDataView', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id',           	type: 'string'  },
        {name: 'name',         	type: 'string'  },
        {name: 'type',         	type: 'string'  },
        {name: 'cloud_id',     	type: 'int'  },
        {name: 'created',      	type: 'date'},
        {name: 'modified',     	type: 'date'},
        {name: 'for_system',  	type: 'bool'},
		{name: 'groupname',		type: 'string' },
		{name: 'attribute',		type: 'string' },
		{name: 'op',			type: 'string' },
		{name: 'value',			type: 'string' },
		{name: 'comment',		type: 'string' }         
 	]
});

/*
"id": "chk_847",
"type": "reply",
"groupname": "SimpleAdd_77",
"attribute": "Fall-Through",
"op": ":=",
"value": "Yes",
"comment": "SimpleProfile",
"profile_component_id": 80,
"for_system": false
*/
     

Ext.define('Rd.model.mMeshOverview', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',               type: 'int'     },
         {name: 'name',             type: 'string'  },
         {name: 'node_count',       type: 'int'},
         {name: 'nodes_up',         type: 'int'},
         {name: 'nodes_down',       type: 'int'},
         {name: 'users',            type: 'int'},
         {name: 'data',             type: 'string'},
		/*  uptimhistpct:
			This will contain a simple array of two values returned by the meshOverviewController 
			with the first value being the numerical value of uptime minutes 
			and the second being the numerical value of downtime minutes 
			for all nodes within the given mesh, e.g. jason -  [1201,239]
		*/
		'uptimhistpct'			
    ]
});

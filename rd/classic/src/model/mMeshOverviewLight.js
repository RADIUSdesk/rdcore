Ext.define('Rd.model.mMeshOverviewLight', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',               type: 'int'     },
         {name: 'parent_id',        type: 'int'     },
		 {name: 'name',             type: 'string'  },
		 {name: 'center_lat', 		type: 'number'},
		 {name: 'center_lng', 		type: 'number'},
		 {name: 'kml_file', 		type: 'string'},
		 {name: 'clients', 			type: 'int'},
		 {name: 'leaf', 			type: 'boolean'},
		 {name: 'level', 			type: 'string'}
    ]
	/* 	This uptime rollup addtions to will be added to the metaData in two arrays of objects: uptimhistpct and uptimeperiods.
	
		They should be added as members of the "metaData" object.  E.g. for a 24 hour filter 
			uptimhistpct: [
				{
					minutes: 1200,					// total up time minutes for the filter period divided by the number of nodes
					minutes_readable: '20 Hours'	// total up time minutes for the filter period divided by the number of nodes in readane form
				},
				{
					minutes: 240,					// total down time minutes for the filter period divided by the number of nodes
					minutes_readable: '4 Hours'		// total down time minutes for the filter period divided by the number of nodes
				}
			],
			//(See store sMeshOverviewLight for field definitions)
			uptimeperiods: [
				{
					uptime_id: 1,
					time_period_name: 'Midnight',
					up_minutes: 43.7,				// total up time minutes for part of the filter period divided by the number of nodes
					down_minutes: 16.3				// total down time minutes for part of the filter period divided by the number of nodes
				},
				{
					uptime_id: 2,
					time_period_name: '1 AM',
					up_minutes: 56.0,
					down_minutes: 4.0
				},
				....
			]
	*/
});

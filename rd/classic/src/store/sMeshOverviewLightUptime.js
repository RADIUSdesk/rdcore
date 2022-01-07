Ext.define('Rd.store.sMeshOverviewLightUptime', {
    extend      : 'Ext.data.Store',
    fields: [
         {name: 'uptime_id',       			type: 'int'     }, // just incremented so unique for each record
		 // Name of time period, e.g., if slices are per hour, the hour.  If time slices by day, the day numeric value
         {name: 'time_period_name',  	type: 'string'  },
         {name: 'up_minutes',			type: 'number'   },
		 {name: 'down_minutes', 		type: 'number'	}
    ],
	storeId		: 'sMeshOverviewLightUptime',	
	data: []
});

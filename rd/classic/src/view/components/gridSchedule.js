Ext.define('Rd.view.components.gridSchedule' ,{
    extend		:'Ext.grid.Panel',
    alias 		: 'widget.gridSchedule',
    padding     : Rd.config.gridSlim,
    requires	: [
   		'Rd.view.components.vcSchedule'
    ],
    controller  : 'vcSchedule',
    viewConfig  : {
        loadMask    :true
    },
    selModel: 'cellmodel',
    listeners : {
		cellclick : 'cellClick'
	},
    initComponent: function(){
        var me  = this;       
        var store = Ext.create('Ext.data.Store', {
		   fields: [
			   {name: 'id',   type: 'int'},
			   {name: 'time', type: 'string'},
			   {name: 'mon', type: 'boolean'},
			   {name: 'tue', type: 'boolean'},
			   {name: 'wed', type: 'boolean'},
			   {name: 'thu', type: 'boolean'},
			   {name: 'fri', type: 'boolean'},
			   {name: 'sat', type: 'boolean'},
			   {name: 'sun', type: 'boolean'}
		   ],
		   data: [
			   { id: 0,  time : 'Midnight-1AM', mon: true,tue: true,wed: true,thu:true,fri:true,sat:true,sun:true },
			   { id: 1,  time : '1AM-2AM', mon: true,tue: true,wed: true,thu:true,fri:true,sat:true,sun:true },
			   { id: 2,  time : '2AM-3AM', mon: true,tue: true,wed: true,thu:true,fri:true,sat:true,sun:true },
			   { id: 3,  time : '3AM-4AM', mon: true,tue: true,wed: true,thu:true,fri:true,sat:true,sun:true },
			   { id: 4,  time : '4AM-5AM', mon: true,tue: true,wed: true,thu:true,fri:true,sat:true,sun:true },
			   { id: 5,  time : '5AM-6AM', mon: true,tue: true,wed: true,thu:true,fri:true,sat:true,sun:true },
			   { id: 6,  time : '6AM-7AM', mon: true,tue: true,wed: true,thu:true,fri:true,sat:true,sun:true },
			   { id: 7,  time : '7AM-8AM', mon: true,tue: true,wed: true,thu:true,fri:true,sat:true,sun:true },
			   { id: 8,  time : '8AM-9AM', mon: true,tue: true,wed: true,thu:true,fri:true,sat:true,sun:true },
			   { id: 9,  time : '9AM-10AM', mon: true,tue: true,wed: true,thu:true,fri:true,sat:true,sun:true },
			   { id: 10, time : '10AM-11AM', mon: true,tue: true,wed: true,thu:true,fri:true,sat:true,sun:true },
			   { id: 11, time : '11AM-Midday', mon: true,tue: true,wed: true,thu:true,fri:true,sat:true,sun:true },
			   { id: 12, time : 'Midday-1PM', mon: true,tue: true,wed: true,thu:true,fri:true,sat:true,sun:true },
			   { id: 13, time : '1PM-2PM', mon: true,tue: true,wed: true,thu:true,fri:true,sat:true,sun:true },
			   { id: 14, time : '2PM-3PM', mon: true,tue: true,wed: true,thu:true,fri:true,sat:true,sun:true },
			   { id: 15, time : '3PM-4PM', mon: true,tue: true,wed: true,thu:true,fri:true,sat:true,sun:true },
			   { id: 16, time : '4PM-5PM', mon: true,tue: true,wed: true,thu:true,fri:true,sat:true,sun:true },
			   { id: 17, time : '5PM-6PM', mon: true,tue: true,wed: true,thu:true,fri:true,sat:true,sun:true },
			   { id: 18, time : '6PM-7PM', mon: true,tue: true,wed: true,thu:true,fri:true,sat:true,sun:true },
			   { id: 19, time : '7PM-8PM', mon: true,tue: true,wed: true,thu:true,fri:true,sat:true,sun:true },
			   { id: 20, time : '8PM-9PM', mon: true,tue: true,wed: true,thu:true,fri:true,sat:true,sun:true },
			   { id: 21, time : '9PM-10PM', mon: true,tue: true,wed: true,thu:true,fri:true,sat:true,sun:true },
			   { id: 22, time : '10PM-11PM', mon: true,tue: true,wed: true,thu:true,fri:true,sat:true,sun:true },
			   { id: 23, time : '11PM-Midnight', mon: true,tue: true,wed: true,thu:true,fri:true,sat:true,sun:true }
		   ]
		});
		
		me.store = store;
        
        var s_true 	= "<div style='background:#34eb34; margin: 0px 0px 0px 0px;padding: 0px 0px 8px 0px;'></div>";
        var s_false	= "<div style='background:#730d00; margin: 8px 0px 0px 0px;padding: 0px 0px 8px 0px;'></div>";
                
        me.columns  = [
			{       
				dataIndex	: 'time',
				sortable	: false,
				hideable	: false,
				width       : 120,
				renderer	: function (val, metadata, record) {
					metadata.style = 'cursor: pointer;';
					return val;
				}
			},
            { 
				text		: 'Mon',
				sortable	: false,
				hideable	: false,      
				dataIndex	: 'mon',     
				flex		: 1,
                renderer	: function (val, metadata, record) {
					metadata.style = 'cursor: pointer;';
					var v = record.get('mon');
					if(v){
						return s_true;
					}else{
						return s_false
					} 
				},
				listeners: {
		            headerclick: 'colClick'
		        }
			},
            { 
				text		: 'Tue',
				sortable	: false,
				hideable	: false,      
				dataIndex	: 'tue',     
				flex		: 1,
				renderer	: function (val, metadata, record) {
					metadata.style = 'cursor: pointer;';
					var v = record.get('tue');
					if(v){
						return s_true;
					}else{
						return s_false
					} 
				},
				listeners: {
		            headerclick: 'colClick'
		        }
			},
			{ 
				text		: 'Wed',
				sortable	: false,
				hideable	: false,      
				dataIndex	: 'wed',     
				flex		: 1,
				renderer	: function (val, metadata, record) {
					metadata.style = 'cursor: pointer;';
					var v = record.get('wed');
					if(v){
						return s_true;
					}else{
						return s_false
					} 
				},
				listeners: {
		            headerclick: 'colClick'
		        }
			},
			{ 
				text		: 'Thu',
				sortable	: false,
				hideable	: false,      
				dataIndex	: 'thu',     
				flex		: 1,
				renderer	: function (val, metadata, record) {
					metadata.style = 'cursor: pointer;';
					var v = record.get('thu');
					if(v){
						return s_true;
					}else{
						return s_false
					} 
				},
				listeners: {
		            headerclick: 'colClick'
		        }
			},
			{ 
				text		: 'Fri',
				sortable	: false,
				hideable	: false,      
				dataIndex	: 'fri',     
				flex		: 1,
				renderer	: function (val, metadata, record) {
					metadata.style = 'cursor: pointer;';
					var v = record.get('fri');
					if(v){
						return s_true;
					}else{
						return s_false
					} 
				},
				listeners: {
		            headerclick: 'colClick'
		        }
			},
			{ 
				text		: 'Sat',
				sortable	: false,
				hideable	: false,     
				dataIndex	: 'sat',     
				flex		: 1,
				renderer	: function (val, metadata, record) {
					metadata.style = 'cursor: pointer;';
					var v = record.get('sat');
					if(v){
						return "<div style='background:#34eb34; margin: 0px 0px 0px 0px;padding: 0px 0px 8px 0px;'></div>";
					}else{
						return "<div style='background:#730d00; margin: 8px 0px 0px 0px;padding: 0px 0px 8px 0px;'></div>"
					} 
				},
				listeners: {
		            headerclick: 'colClick'
		        }
			},
			{ 
				text		: 'Sun',
				sortable	: false,
				hideable	: false,      
				dataIndex	: 'sun',     
				flex		: 1,
				renderer	: function (val, metadata, record) {
					metadata.style = 'cursor: pointer;';
					var v = record.get('sun');
					if(v){
						return s_true;
					}else{
						return s_false
					} 
				},
				listeners: {
		            headerclick: 'colClick'
		        }
			}
        ];
        me.callParent(arguments);
    }
});

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
			   {name: 'id',   	type: 'int'},
			   {name: 'begin',	type: 'int'},
			   {name: 'end',  	type: 'int'},
			   {name: 'time', 	type: 'string'},
			   {name: 'mo', 	type: 'boolean'},
			   {name: 'tu', 	type: 'boolean'},
			   {name: 'we', 	type: 'boolean'},
			   {name: 'th', 	type: 'boolean'},
			   {name: 'fr', 	type: 'boolean'},
			   {name: 'sa', 	type: 'boolean'},
			   {name: 'su', 	type: 'boolean'}
		   ],
		   proxy: {
				    type    : 'ajax',
				    format  : 'json',
				    batchActions: true, 
				    url     : '/cake4/rd_cake/schedules/default-schedule.json',
				    reader: {
				        type            : 'json',
				        rootProperty    : 'items',
				        messageProperty : 'message',
				        totalProperty   : 'totalCount' //Required for dynamic paging
				    },
				    simpleSortMode: true //This will only sort on one column (sort) and a direction(dir) value ASC or DESC
			},
			autoLoad: true
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
				dataIndex	: 'mo',     
				flex		: 1,
                renderer	: function (val, metadata, record) {
					metadata.style = 'cursor: pointer;';
					var v = record.get('mo');
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
				dataIndex	: 'tu',     
				flex		: 1,
				renderer	: function (val, metadata, record) {
					metadata.style = 'cursor: pointer;';
					var v = record.get('tu');
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
				dataIndex	: 'we',     
				flex		: 1,
				renderer	: function (val, metadata, record) {
					metadata.style = 'cursor: pointer;';
					var v = record.get('we');
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
				dataIndex	: 'th',     
				flex		: 1,
				renderer	: function (val, metadata, record) {
					metadata.style = 'cursor: pointer;';
					var v = record.get('th');
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
				dataIndex	: 'fr',     
				flex		: 1,
				renderer	: function (val, metadata, record) {
					metadata.style = 'cursor: pointer;';
					var v = record.get('fr');
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
				dataIndex	: 'sa',     
				flex		: 1,
				renderer	: function (val, metadata, record) {
					metadata.style = 'cursor: pointer;';
					var v = record.get('sa');
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
				dataIndex	: 'su',     
				flex		: 1,
				renderer	: function (val, metadata, record) {
					metadata.style = 'cursor: pointer;';
					var v = record.get('su');
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

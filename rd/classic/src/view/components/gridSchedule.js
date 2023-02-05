Ext.define('Rd.view.components.gridSchedule' ,{
    extend		:'Ext.grid.Panel',
    alias 		: 'widget.gridSchedule',
    multiSelect	: true,
    stateEvents	:['groupclick','columnhide'],
    //frame		: true,
    requires	: [
   
    ],
    //controller  : 'vcMtPppoeActive',
    viewConfig  : {
        loadMask    :true
    },
    selModel: 'cellmodel',
    listeners : {
		cellclick : function(gridView,htmlElement,columnIndex,record) {
			console.log("Brannas");
			console.log(columnIndex);
			if(columnIndex == 0){
				var val = !record.get('mon')
				record.set('mon',val);
				record.set('tue',val);
				record.set('wed',val);
				record.set('thu',val);
				record.set('fri',val);
				record.set('sat',val);
				record.set('sun',val);
			}
			if(columnIndex == 1){
				record.set('mon',!record.get('mon'));
			}
			if(columnIndex == 2){
				record.set('tue',!record.get('tue'));
			}
			if(columnIndex == 3){
				record.set('wed',!record.get('wed'));
			}
			if(columnIndex == 4){
				record.set('thu',!record.get('thu'));
			}
			if(columnIndex == 5){
				record.set('fri',!record.get('fri'));
			}
			if(columnIndex == 6){
				record.set('sat',!record.get('sat'));
			}
			if(columnIndex == 7){
				record.set('sun',!record.get('sun'));
			}
			record.commit();
		}
	},
    initComponent: function(){
        var me  = this;       
        var store = Ext.create('Ext.data.Store', {
		   fields: [
			   {name: 'framework', type: 'string'},
			   {name: 'rocks', type: 'boolean'}
		   ],
		   data: [
			   { id: 0,  time : 'Midnight-1AM', mon: true,tue: true,wed: true,thu:false,fri:false,sat:true,sun:true },
			   { id: 1,  time : '1AM-2AM', mon: true,tue: true,wed: true,thu:false,fri:false,sat:true,sun:true },
			   { id: 2,  time : '2AM-3AM', mon: true,tue: true,wed: true,thu:false,fri:false,sat:true,sun:true },
			   { id: 3,  time : '3AM-4AM', mon: true,tue: true,wed: true,thu:false,fri:false,sat:true,sun:true },
			   { id: 4,  time : '4AM-5AM', mon: true,tue: true,wed: true,thu:false,fri:false,sat:true,sun:true },
			   { id: 5,  time : '5AM-6AM', mon: true,tue: true,wed: true,thu:false,fri:false,sat:true,sun:true },
			   { id: 6,  time : '6AM-7AM', mon: true,tue: true,wed: true,thu:false,fri:false,sat:true,sun:true },
			   { id: 7,  time : '7AM-8AM', mon: true,tue: true,wed: true,thu:false,fri:false,sat:true,sun:true },
			   { id: 8,  time : '8AM-9AM', mon: true,tue: true,wed: true,thu:false,fri:false,sat:true,sun:true },
			   { id: 9,  time : '9AM-10AM', mon: true,tue: true,wed: true,thu:false,fri:false,sat:true,sun:true },
			   { id: 10, time : '10AM-11AM', mon: true,tue: true,wed: true,thu:false,fri:false,sat:true,sun:true },
			   { id: 11, time : '11AM-Midday', mon: true,tue: true,wed: true,thu:false,fri:false,sat:true,sun:true },
			   { id: 12, time : 'Midday-1PM', mon: true,tue: true,wed: true,thu:false,fri:false,sat:true,sun:true },
			   { id: 13, time : '1PM-2PM', mon: true,tue: true,wed: true,thu:false,fri:false,sat:true,sun:true },
			   { id: 14, time : '2PM-3PM', mon: true,tue: true,wed: true,thu:false,fri:false,sat:true,sun:true },
			   { id: 15, time : '3PM-4PM', mon: true,tue: true,wed: true,thu:false,fri:false,sat:true,sun:true },
			   { id: 16, time : '4PM-5PM', mon: true,tue: true,wed: true,thu:false,fri:false,sat:true,sun:true },
			   { id: 17, time : '5PM-6PM', mon: true,tue: true,wed: true,thu:false,fri:false,sat:true,sun:true },
			   { id: 18, time : '6PM-7PM', mon: true,tue: true,wed: true,thu:false,fri:false,sat:true,sun:true },
			   { id: 19, time : '7PM-8PM', mon: true,tue: true,wed: true,thu:false,fri:false,sat:true,sun:true },
			   { id: 20, time : '8PM-9PM', mon: true,tue: true,wed: true,thu:false,fri:false,sat:true,sun:true },
			   { id: 21, time : '9PM-10PM', mon: true,tue: true,wed: true,thu:false,fri:false,sat:true,sun:true },
			   { id: 22, time : '10PM-11PM', mon: true,tue: true,wed: true,thu:false,fri:false,sat:true,sun:true },
			   { id: 23, time : '11PM-Midnight', mon: true,tue: true,wed: true,thu:false,fri:false,sat:true,sun:true }
		   ]
		});
		
		me.store = store;
        
        var s_true 	= "<div style='background:#34eb34; margin: 0px 0px 0px 0px;padding: 0px 0px 8px 0px;'></div>";
        var s_false	= "<div style='background:#730d00; margin: 8px 0px 0px 0px;padding: 0px 0px 8px 0px;'></div>";
        
        //"<tpl if='tue == true'><div class=\"fieldGreenWhite\"></div></tpl>",
       //"<tpl if='tue == false'><div class=\"fieldRedWhite\"></div></tpl>"
        
        me.columns  = [
			{       
				dataIndex	: 'time',
				width       : 120,
				renderer	: function (val, metadata, record) {
					metadata.style = 'cursor: pointer;';
					return val;
				}
			},
            { 
				text		: 'Mon',      
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
				}
			},
            { 
				text		: 'Tue',      
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
				}
			},
			{ 
				text		: 'Wed',      
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
				}
			},
			{ 
				text		: 'Thu',      
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
				}
			},
			{ 
				text		: 'Fri',      
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
				}
			},
			{ 
				text		: 'Sat',      
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
				}
			},
			{ 
				text		: 'Sun',      
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
				}
			}
        ];
        me.callParent(arguments);
    }
});

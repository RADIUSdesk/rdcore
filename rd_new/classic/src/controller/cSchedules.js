Ext.define('Rd.controller.cSchedules', {
    extend: 'Ext.app.Controller',
    actionIndex: function(pnl,itemId){
        var me      = this;
        var item    = pnl.down('#'+itemId);
        var added   = false;
        if(!item){
            var tp = Ext.create('Ext.tab.Panel',
            	{          
	            	border  : false,
	                itemId  : itemId,
	                plain	: true,
	                cls     : 'subSubTab', //Make darker -> Maybe grey
	                items   : [
	                    { 
	                         title  : 'Schedules', 
	                         xtype  : 'gridSchedules',
	                         border : false,
	                         plain  : true,
	                         glyph  : Rd.config.icnWatch
	                    }
	                ]
	            });      
            pnl.add(tp);
            pnl.on({activate : me.gridActivate,scope: me});
            added = true;
        }
        return added;      
    },
    actionIndexZ: function(pnl){
        var me  = this; 
        if (me.populated) {
            return; 
        }       
        pnl.add({
            xtype   : 'gridSchedules',
            padding : Rd.config.gridPadding,
            border  : false,
            plain	: true
        });
        pnl.on({activate : me.gridActivate,scope: me});
        me.populated = true;
    },
    views:  [
        'schedules.gridSchedules',		
        'schedules.winScheduleAdd',
        'schedules.pnlScheduleDetail',
        'schedules.gridScheduleEntries',
        'schedules.winScheduleEntryAdd',
        'schedules.winScheduleEntryEdit'
    ],
    stores: ['sSchedules'],
    models: ['mSchedule', 'mScheduleEntry'],
    selectedRecord: null,
    config: {
        urlAdd          : '/cake4/rd_cake/schedules/add.json',
        urlDelete       : '/cake4/rd_cake/schedules/delete.json',
		urlEdit         : '/cake4/rd_cake/schedules/edit.json',
		urlAddEntry     : '/cake4/rd_cake/schedules/add-schedule-entry.json',
		urlEditEntry    : '/cake4/rd_cake/schedules/edit-schedule-entry.json',
		urlDeleteEntry  : '/cake4/rd_cake/schedules/delete-schedule-entry.json'
    },
    refs: [
        {  ref: 'grid',  selector: 'gridSchedules'}       
    ],
    init: function() {
        var me = this;
        if (me.inited) {
            return;
        }
        me.inited = true;         
        me.control({
            'gridSchedules #predef_cmds' : {
                click   : me.predefCmds
            }
        });
    },  
    gridActivate: function(g){
        var me = this;
        var grid = g.down('grid');
        if(grid){
            grid.getStore().reload();
        }else{
            g.getStore().reload();
        }        
    },
    predefCmds: function(b){
        var me  = this;
        tp      = b.up('tabpanel');
        me.application.runAction('cPredefinedCommands','Index',tp);
    }
});

Ext.define('Rd.controller.cSchedules', {
    extend: 'Ext.app.Controller',
    actionIndex: function(pnl,itemId){
        var me      = this;
        var item    = pnl.down('#'+itemId);
        var added   = false;
        if(!item){  
            pnl.add({
                itemId : itemId,
             //   xtype  : 'gridSchedules',
             	xtype  : 'pnlSchedules',
                border : false,
                plain  : true,
                padding: '0 5 0 5'
            });
            //pnl.on({activate : me.gridActivate,scope: me});
            pnl.on({activate : me.dvActivate,scope: me});
            added = true;
        }
        return added;      
    },
    views:  [
    	'schedules.pnlSchedules',
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
        {  ref: 'grid',  selector: 'gridSchedules'} ,
        {  ref: 'dv',    selector: '#dvSchedules'}       
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
            },
            'pnlSchedules #predef_cmds' : {
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
   	dvActivate: function(pnl){
        var me = this;
        me.getDv().getStore().reload();            
    },
    predefCmds: function(b){
        var me  = this;
        tp      = b.up('tabpanel');
        Ext.getApplication().runAction('cPredefinedCommands','Index',tp);
    }
});

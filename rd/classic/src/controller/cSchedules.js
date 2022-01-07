Ext.define('Rd.controller.cSchedules', {
    extend: 'Ext.app.Controller',
    actionIndex: function(pnl){
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
        'schedules.winScheduleAddWizard',
        'schedules.pnlScheduleDetail',
        'schedules.gridScheduleEntries',
        'schedules.winScheduleEntryAdd',
        'schedules.winScheduleEntryEdit'
    ],
    stores: [ 'sAccessProvidersTree',   'sSchedules'                    ],
    models: ['mAccessProviderTree',     'mSchedule', 'mScheduleEntry'   ],
    selectedRecord: null,
    config: {
        urlApChildCheck : '/cake3/rd_cake/access-providers/child-check.json',
        urlAdd          : '/cake3/rd_cake/schedules/add.json',
        urlDelete       : '/cake3/rd_cake/schedules/delete.json',
		urlEdit         : '/cake3/rd_cake/schedules/edit.json',
		urlAddEntry     : '/cake3/rd_cake/schedules/add-schedule-entry.json',
		urlEditEntry    : '/cake3/rd_cake/schedules/edit-schedule-entry.json',
		urlDeleteEntry  : '/cake3/rd_cake/schedules/delete-schedule-entry.json'
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

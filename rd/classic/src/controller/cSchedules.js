Ext.define('Rd.controller.cSchedules', {
    extend: 'Ext.app.Controller',
    actionIndex: function(pnl,itemId){
        var me      = this;
        var item    = pnl.down('#'+itemId);
        var added   = false;
        if(!item){  
            pnl.add({
                itemId : itemId,
             	xtype  : 'pnlSchedules',
                border : false,
                plain  : true,
                padding: '0 5 0 5'
            });
            pnl.on({activate : me.dvActivate,scope: me});
            added = true;
        }
        return added;      
    },
    views:  [
    	'schedules.pnlSchedules'
    ],
    refs: [
        {  ref: 'dv',    selector: '#dvSchedules'}       
    ],
    init: function() { 
        var me = this;
        if (me.inited) {
            return;
        }
        me.inited = true;
        me.control({
            'pnlSchedules #predef_cmds' : {
                click   : me.predefCmds
            }
        });
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

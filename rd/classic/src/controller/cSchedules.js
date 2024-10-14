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
	                tabBar: {
                        items: [
                            { 
                                xtype   : 'btnOtherBack'
                            }              
                       ]
                    },
	                items   : [
	                    { 
	                        title   : 'Schedules', 
	                        xtype   : 'pnlSchedules',
	                        border  : false,
                            plain   : true,
                            padding : '0 5 0 5',
	                        glyph   : 'xf133@FontAwesome',
	                        listeners: {
                                activate: me.dvActivate,
                                scope   : me
                            }
	                    }
	                ]
	            });      
            pnl.add(tp);
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
   	control: {
        'pnlSchedules #predef_cmds' : {
            click   : 'predefCmds'
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

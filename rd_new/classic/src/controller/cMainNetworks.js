Ext.define('Rd.controller.cMainNetworks', {
    extend: 'Ext.app.Controller',
    init: function() {
        var me  = this;
        if (me.inited) {
            return;
        }
        me.inited = true;
    },
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
	                cls     : 'subSubTab'
	            });      
            pnl.add(tp);
            Ext.getApplication().runAction('cMeshes','Index',tp);
            Ext.getApplication().runAction('cAccessPoints','Index',tp);
            Ext.getApplication().runAction('cUnknownNodes','Index',tp);
            added = true;
        }
        return added;      
    }
});

Ext.define('Rd.controller.cClients', {
    extend: 'Ext.app.Controller',
    actionIndex: function(pnl,itemId){
        var me      = this;
        var item    = pnl.down('#'+itemId);
        var added   = false;
        if(!item){
            pnl.add({ 
                itemId  : itemId,
                xtype   : 'pnlClients',
	            border  : false,
	            plain   : true,
                padding : '0 5 0 5',
            });
            added = true;
        }
        return added;      
    },
    views:  [
    	'clients.pnlClients'
    ],
});

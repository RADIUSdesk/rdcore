Ext.define('Rd.controller.cAccel', {
    extend: 'Ext.app.Controller',
    views: [
        'accel.pnlAccel'
    ],
    actionIndex: function(pnl,itemId){
        var me      = this;
        var item    = pnl.down('#'+itemId);
        var added   = false;
        if(!item){
            pnl.add({ 
                itemId  : itemId,
                xtype   : 'pnlAccel',
	            border  : false,
	            plain   : true,
                padding : '0 5 0 5',
            });
            added = true;
        }
        return added;      
    }
});

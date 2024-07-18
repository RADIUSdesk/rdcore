Ext.define('Rd.controller.cSqmProfiles', {
    extend: 'Ext.app.Controller',
    actionIndex: function(pnl,itemId){
        var me      = this;
        var item    = pnl.down('#'+itemId);
        var added   = false;
        if(!item){  
            pnl.add({
                itemId : itemId,
             	xtype  : 'pnlSqmProfiles',
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
    	'sqmProfiles.pnlSqmProfiles'
    ],
    refs: [
        {  ref: 'dv',    selector: '#dvSqmProfiles'}       
    ],
   	dvActivate: function(pnl){
        var me = this;
        //me.getDv().getStore().reload();            
    }
});

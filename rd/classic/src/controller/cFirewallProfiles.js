Ext.define('Rd.controller.cFirewallProfiles', {
    extend: 'Ext.app.Controller',
    actionIndex: function(pnl,itemId){
        var me      = this;
        var item    = pnl.down('#'+itemId);
        var added   = false;
        if(!item){  
            pnl.add({
                itemId : itemId,
             	xtype  : 'pnlFirewallProfiles',
                border : false,
                plain  : true,
                padding: '0 5 0 5'
            });
            pnl.on({activate : me.dvActivate,scope: me});
            added = true;
        }
        return added;      
    },
    refs: [
        {  ref: 'dv',    selector: '#dvFirewallProfiles'}       
    ],
    init: function() { 
        var me = this;
        if (me.inited) {
            return;
        }
        me.inited = true;
    },  
   	dvActivate: function(pnl){
        var me = this;
        me.getDv().getStore().reload();            
    }
});

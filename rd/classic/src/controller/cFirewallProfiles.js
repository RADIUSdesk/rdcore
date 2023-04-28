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
    views:  [
    	'firewallProfiles.pnlFirewallProfiles'
    ],
    refs: [
        {  ref: 'dv',    selector: '#dvFirewallProfiles'}       
    ],
    control: {
        'pnlFirewallProfiles #firewall_apps' : {
            click : 'firewallApps'
        }
    },
   	dvActivate: function(pnl){
        var me = this;
        me.getDv().getStore().reload();            
    },
    firewallApps : function(b){
        var me  = this;
        tp      = b.up('tabpanel');
        Ext.getApplication().runAction('cFirewallApps','Index',tp);
    }
});

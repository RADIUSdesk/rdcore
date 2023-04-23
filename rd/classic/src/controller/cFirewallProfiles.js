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
        'pnlFirewallProfiles #app_tools' : {
            click : 'appTools'
        }
    },
   	dvActivate: function(pnl){
        var me = this;
        me.getDv().getStore().reload();            
    },
    appTools : function(b){
        var me  = this;
        tp      = b.up('tabpanel');
        Ext.getApplication().runAction('cAppTools','Index',tp);
    }
});

Ext.define('Rd.controller.cFirewallApps', {
    extend: 'Ext.app.Controller',
  	actionIndex: function(tp){
        var me      = this;  
        var newTab  = tp.items.findBy(function (tab){
            return tab.getXType() === 'pnlFirewallApps';
        });    
        if (!newTab){
            newTab = tp.add({
                xtype   : 'pnlFirewallApps',
                padding: '0 5 0 5',
                border  : false,
                glyph   : Rd.config.icnSpanner,
                title   : 'Firewall Apps',
                plain	: true,
                closable: true, 
                tabConfig: {
                    ui: Rd.config.tabDevices
                }
            });
            newTab.on({activate : me.dvActivate,scope: me});
        }
        tp.setActiveTab(newTab);
    },
    views:  [
    	'firewallApps.pnlFirewallApps'
    ],
    refs: [
        {  ref: 'dv',    selector: '#dvFirewallApps'}       
    ],
   	dvActivate: function(pnl){
        var me = this;
        me.getDv().getStore().reload();            
    }
});

Ext.define('Rd.controller.cFirewallProfiles', {
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
	                        title   : 'Firewall', 
	                        xtype   : 'pnlFirewallProfiles',
	                        border  : false,
                            plain   : true,
                            padding : '0 5 0 5',
	                        glyph   : 'xf06d@FontAwesome',
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
   	    console.log("Gooi hom");
        var me = this;
        me.getDv().getStore().reload();            
    },
    firewallApps : function(b){
        var me  = this;
        tp      = b.up('tabpanel');
        Ext.getApplication().runAction('cFirewallApps','Index',tp);
    }
});

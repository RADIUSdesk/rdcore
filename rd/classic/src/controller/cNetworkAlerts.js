Ext.define('Rd.controller.cNetworkAlerts', {
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
                                xtype   : 'btnNetworksBack'
                            }              
                       ]
                    },
	                items   : [
	                    { 
                            title   : 'Alerts',
                            itemId  : 'networkAlerts',
                            xtype   : 'gridAlerts',
                            cloud   : true,
                            border  : false,
                            plain   : true,
                            glyph   : Rd.config.icnBell,
                            padding : Rd.config.gridSlim
                        }
	                ]
	            });      
            pnl.add(tp);
            added = true;
        }
        return added;      
    },
    init: function() {
        var me = this;     
        if (me.inited) {
            return;
        }
        me.inited = true;
        me.control({
			'#pnlNetworksAlerts gridAlerts' : {
				activate	: me.gridActivate
			}
	    });        
    },   
    gridActivate: function(g){
        var me = this;
        g.getStore().load();
    },
    views:  [
        'alerts.gridAlerts',
        'components.btnUsersBack'
    ]
});

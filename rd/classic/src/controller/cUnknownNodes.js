Ext.define('Rd.controller.cUnknownNodes', {
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
                            title   : 'New Arrivals - Hardware',
                            itemId  : 'arrivals',
                            xtype   : 'gridUnknownNodes',
                            border  : false,
                            plain   : true,
                            glyph   : Rd.config.icnBus,
                            padding : Rd.config.gridSlim,
                            tabConfig   : {
                                ui : 'tab-brown'
                            }   
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
			'#pnlNetworksUnknownNodes gridUnknownNodes' : {
				activate	: me.gridActivate
			}
	    });        
    },   
    gridActivate: function(g){
        var me = this;
        g.getStore().load();
    },
    views:  [
        'unknownNodes.gridUnknownNodes',
        'components.btnUsersBack'
    ]
});

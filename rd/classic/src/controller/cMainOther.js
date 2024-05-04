Ext.define('Rd.controller.cMainOther', {
    extend  : 'Ext.app.Controller',
    config: {
        urlGetContent : '/cake4/rd_cake/dashboard/items-for.json'
    },
    control : {
        '#tabMainOther #cHardwares' : {
		    afterrender	: function(pnl){
		        Ext.getApplication().runAction('cHardwares','Index',pnl);
		    }
	    },
        '#tabMainOther #cSettings' : {
		    afterrender	: function(pnl){
		        Ext.getApplication().runAction('cSettings','Index',pnl);
		    }
	    },
        '#tabMainOther #cOpenvpnServers' : {
		    afterrender	: function(pnl){
		        Ext.getApplication().runAction('cOpenvpnServers','Index',pnl);
		    }
	    },
        '#tabMainOther #cSchedules' : {
		    afterrender	: function(pnl){
		        Ext.getApplication().runAction('cSchedules','Index',pnl);
		    }
	    },
        '#tabMainOther #cClouds' : {
		    afterrender	: function(pnl){
		        Ext.getApplication().runAction('cClouds','Index',pnl);
		    }
	    },
        '#tabMainOther #cAccessProviders' : {
		    afterrender	: function(pnl){
		        Ext.getApplication().runAction('cAccessProviders','Index',pnl);
		    }
	    },
	    '#tabMainOther #cFirewallProfiles' : {
		    afterrender	: function(pnl){
		        Ext.getApplication().runAction('cFirewallProfiles','Index',pnl);
		    }
	    },
	    '#tabMainOther #cAccel' : {
		    afterrender	: function(pnl){
		        Ext.getApplication().runAction('cAccel','Index',pnl);
		    }
	    },
	    '#tabMainOther #cHomeServerPools' : {
		    afterrender	: function(pnl){
		        Ext.getApplication().runAction('cHomeServerPools','Index',pnl);
		    }
	    },
	    '#tabMainOther #cPrivatePsks' : {
		    afterrender	: function(pnl){
		        Ext.getApplication().runAction('cPrivatePsks','Index',pnl);
		    }
	    }
    },
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
	                cls     : 'subSubTab', //Make darker
	            });      
            pnl.add(tp);
            Ext.Ajax.request({
                url     : me.getUrlGetContent(),
                method  : 'GET',
                params  : { item_id : itemId },
                success : function (response) {
                    var jsonData = Ext.JSON.decode(response.responseText);
                    if (jsonData.success) {
                        var items = jsonData.items;
                        tp.add(items);
                    }
                },
                scope: me
            });
            added = true;
        }
        return added;      
    }
});

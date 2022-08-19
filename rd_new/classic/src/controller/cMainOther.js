Ext.define('Rd.controller.cMainOther', {
    extend  : 'Ext.app.Controller',
    config: {
        urlGetContent : '/cake4/rd_cake/dashboard/items-for.json'
    },
    control : {
        '#tabMainOther #cHardwares' : {
		    afterrender	: function(pnl){
		        me.application.runAction('cHardwares','Index',pnl);
		    }
	    },
        '#tabMainOther #cSettings' : {
		    afterrender	: function(pnl){
		        me.application.runAction('cSettings','Index',pnl);
		    }
	    },
        '#tabMainOther #cOpenvpnServers' : {
		    afterrender	: function(pnl){
		        me.application.runAction('cOpenvpnServers','Index',pnl);
		    }
	    },
        '#tabMainOther #cSchedules' : {
		    afterrender	: function(pnl){
		        me.application.runAction('cSchedules','Index',pnl);
		    }
	    },
        '#tabMainOther #cClouds' : {
		    afterrender	: function(pnl){
		        me.application.runAction('cClouds','Index',pnl);
		    }
	    },
        '#tabMainOther #cAccessProviders' : {
		    afterrender	: function(pnl){
		        me.application.runAction('cAccessProviders','Index',pnl);
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

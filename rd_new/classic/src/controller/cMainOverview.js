Ext.define('Rd.controller.cMainOverview', {
    extend  : 'Ext.app.Controller',
    config: {
        urlGetContent : '/cake4/rd_cake/dashboard/items-for.json'
    },
    control : {
        '#tabMainOverview #cNetworkOverview' : {
		    afterrender	: function(pnl){
		        Ext.getApplication().runAction('cNetworkOverview','Index',pnl);
		    }
	    },
        '#tabMainOverview #cDataUsage' : {
		    afterrender	: function(pnl){
		        Ext.getApplication().runAction('cDataUsage','Index',pnl);
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

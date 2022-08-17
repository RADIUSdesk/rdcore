Ext.define('Rd.controller.cMainRadius', {
    extend  : 'Ext.app.Controller',
    config: {
        urlGetContent : '/cake4/rd_cake/dashboard/items-for.json'
    },
    control : {
        '#tabMainRadius #cDynamicClients' : {
		    afterrender	: function(pnl){
		        me.application.runAction('cDynamicClients','Index',pnl);
		    }
	    },
        '#tabMainRadius #cProfiles' : {
		    afterrender	: function(pnl){
		        me.application.runAction('cProfiles','Index',pnl);
		    }
	    },
        '#tabMainRadius #cRealms' : {
		    afterrender	: function(pnl){
		        me.application.runAction('cRealms','Index',pnl);
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

/*
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
	                items   : [
                         {
                            "title" : "RADIUS Clients",
                            "glyph" : "xf1cb@FontAwesome",
                            "id"    : "cDynamicClients",
                            "layout": "fit",
                            "tabConfig": {
                                "ui": "tab-blue"
                            }
                        },
                        {
                            "title" : "Profiles",
                            "glyph" : "xf1b3@FontAwesome",
                            "id"    : "cProfiles",
                            "layout": "fit",
                            "tabConfig": {
                                "ui": "tab-blue"
                            }
                        },
                        {
                            "title" : "Realms (Groups)",
                            "glyph" : "xf17d@FontAwesome",
                            "id"    : "cRealms",
                            "layout": "fit",
                            "tabConfig": {
                                "ui": "tab-orange"
                            }
                        }                
	                ]
	            });      
            pnl.add(tp);
            added = true;
        }
        return added;      
    }
*/
});

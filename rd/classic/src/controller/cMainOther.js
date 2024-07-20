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
	    },
	    '#tabMainOther #cSqmProfiles' : {
		    afterrender	: function(pnl){
		        Ext.getApplication().runAction('cSqmProfiles','Index',pnl);
		    }
	    }	    
    },
    actionIndexWIP: function(pnl,itemId){
        var me      = this;
        var item    = pnl.down('#'+itemId);
        var added   = false;
        if(!item){
        
        
            var s = Ext.create('Ext.data.Store', {
                storeId: 'myStore',
                fields: ['column1', 'column2'],
                data: [
                    { column1: 'Item 1A', column2: 'Item 1B' },
                    { column1: 'Item 2A', column2: 'Item 2B' },
                    { column1: 'Item 3A', column2: 'Item 3B' }
                ]
            });
            
            var v = Ext.create('Ext.view.View', {
                store: Ext.data.StoreManager.lookup('myStore'),
                tpl: new Ext.XTemplate(
                    '<tpl for=".">',
                        '<div class="dataview-item">',
                            '<div class="dataview-column1">{column1}</div>',
                            '<div class="dataview-column2">{column2}</div>',
                        '</div>',
                    '</tpl>'
                ),
                itemSelector: '.dataview-item',
                listeners: {
                    itemclick: function(view, record, item, index, e) {
                        var clickedColumn = e.getTarget('.dataview-column1') ? 'column1' : 'column2';
                        console.log('Clicked column:', clickedColumn, 'Value:', record.get(clickedColumn));
                        // Add your selection handling logic here
                    }
                }
            });
        
        
            var tp = Ext.create('Ext.panel.Panel',
            	{          
	            	border      : false,
	                itemId      : itemId,
	                items       : v,
	                height      : '100%', 
                    width       :  550,
                    layout: {
                       type: 'vbox',
                       align: 'stretch'
                    },
                    items       : v,
                    autoScroll  : true,
	            });      
            pnl.add(tp);
                              
            added = true;
        }
        return added;      
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

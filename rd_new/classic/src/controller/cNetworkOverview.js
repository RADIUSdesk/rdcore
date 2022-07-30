Ext.define('Rd.controller.cNetworkOverview', {
    extend      : 'Ext.app.Controller',
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
	                         title  : 'Network Overview', 
                             xtype  : 'pnlNetworkOverview',
	                         border : false,
	                         plain  : true,
	                         glyph  : 'xf0c2@FontAwesome'
	                    }
	                ]
	            });      
            pnl.add(tp);
            added = true;
        }
        return added;
    },
    actionIndexZ : function(pnl){
        var me = this;   
        if (me.populated) {
            return; 
        }         
        pnl.add({
            xtype   : 'pnlNetworkOverview',
            border  : false,
            itemId  : 'tabNetworkOverview',
            plain   : true
        });       
        me.populated = true;
	}, 
    views       : [
        'networkOverview.pnlNetworkOverview',
        'networkOverview.pnlNetworkOverviewMap',
        'networkOverview.gridNetworkOverviewMesh'
    ],
    stores: [
        'sNetworkOverviewMaps'
    ]
});

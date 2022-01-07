Ext.define('Rd.controller.cNetworkOverview', {
    extend      : 'Ext.app.Controller',
    actionIndex : function(pnl){
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

Ext.define('Rd.controller.cNetworkOverview', {
    extend      : 'Ext.app.Controller',
    actionIndex : function(pnl,itemId){
        var me      = this;
        var item    = pnl.down('#'+itemId);
        var added   = false;
        if(!item){
            pnl.add({ 
                itemId  : itemId,
                xtype   : 'pnlNetworkOverview',
                border  : false,
                plain   : true
            });
            added = true;
        }
        return added;      
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

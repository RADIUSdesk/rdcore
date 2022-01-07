Ext.define('Rd.view.networkOverview.pnlNetworkOverviewMapLeaflet', {
    extend  : 'Ext.panel.Panel',
    alias   :'widget.pnlNetworkOverviewMapLeaflet',
    requires: [
        'Rd.view.components.cmpLeafletMapView',
        'Rd.view.networkOverview.vcNetworkOverviewMapLeaflet'
    ],
    controller  : 'vcNetworkOverviewMapLeaflet',
    metaData    : null,
    meshId      : null,
    initComponent: function(){
        var me      = this;
        var center  = [39.50, -98.35];
        var zoom    = 16;
        if(me.metaData.zoom){ //We assume the rest will also be there
            center  = [me.metaData.lat,me.metaData.lng];  
            zoom    = me.metaData.zoom
        }
        me.items = [{ 
            xtype           : 'cmpLeafletMapView',
            initialLocation : center,
		    initialZoomLevel: zoom 
        }];   
        me.callParent(arguments);  
    }
});


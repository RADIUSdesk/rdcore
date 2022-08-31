Ext.define('Rd.view.meshOverview.pnlMeshOverviewLeafletMap', {
    extend  : 'Ext.panel.Panel',
    alias   :'widget.pnlMeshOverviewLeafletMap',
    requires: [
        'Rd.view.components.cmpLeafletMapView',
        'Rd.view.meshOverview.vcMeshOverviewLeafletMap'
    ],
    controller  : 'vcMeshOverviewLeafletMap',
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
        
        me.store    = Ext.create(Rd.store.sMeshOverviewMaps,{
            listeners: {
                load: function(store, records, successful) {
                    //console.log("Store Loaded....");
                    //console.log(store.getProxy().getReader().metaData);
					var vc = this.getController();
					vc.onMeshOverviewLightStoreLoad(this);
                },
                scope: this
            },
            autoLoad: true 
        });
             
        me.callParent(arguments);  
    }
});


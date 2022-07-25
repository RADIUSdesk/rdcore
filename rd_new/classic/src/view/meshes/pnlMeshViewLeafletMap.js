Ext.define('Rd.view.meshes.pnlMeshViewLeafletMap', {
    extend  : 'Ext.panel.Panel',
    alias   :'widget.pnlMeshViewLeafletMap',
    requires: [
        'Rd.view.meshes.vcMeshViewLeafletMap',
        'Rd.view.components.cmpLeafletMapView'
    ],
    controller  : 'vcMeshViewLeafletMap',
    metaData    : null,
    meshId      : null,
    listeners   : {
       show        : 'reload', //Trigger a load of the settings (This is only on the initial load)
       afterrender : 'OnPnlAfterrender'
    }, 
    tbar: [
    	{xtype: 'buttongroup', title: null, items : [
		{xtype: 'button', ui : 'button-orange', glyph: Rd.config.icnReload, scale: 'large', itemId: 'reload', tooltip: i18n('sReload')}
        ]}    
    ],
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


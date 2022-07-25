Ext.define('Rd.view.meshes.pnlMeshEditLeafletMap', {
    extend  : 'Ext.panel.Panel',
    alias   :'widget.pnlMeshEditLeafletMap',
    requires: [
        'Rd.view.meshes.vcMeshEditLeafletMap',
        'Rd.view.components.cmpLeafletMapView',
        'Rd.view.meshes.winMeshMapPreferences',
        'Rd.view.meshes.winMeshMapNodeAdd'
    ],
    controller  : 'vcMeshEditLeafletMap',
    metaData    : null,
    meshId      : null,
    listeners   : {
       show        : 'reload' //Trigger a load of the settings (This is only on the initial load)
    }, 
    tbar    : [
    	{xtype: 'buttongroup', title: null, items : [
		{xtype: 'button', glyph: Rd.config.icnReload ,	ui : 'button-orange', scale: 'large', itemId: 'reload',   	tooltip: i18n('sReload')},
		{xtype: 'button', glyph: Rd.config.icnConfigure,ui : 'button-metal',scale: 'large', itemId: 'preferences', 	tooltip: i18n('sPreferences')},
        {xtype: 'button', glyph: Rd.config.icnAdd,      ui : 'button-green', scale: 'large', itemId: 'add',         	tooltip: i18n('sAdd')},
        {xtype: 'button', glyph: Rd.config.icnDelete,   ui : 'button-red',scale: 'large', itemId: 'delete',      	tooltip: i18n('sDelete')},
        {xtype: 'button', glyph: Rd.config.icnEdit,     ui : 'button-blue',scale: 'large', itemId: 'edit',        	tooltip: i18n('sEdit')}
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


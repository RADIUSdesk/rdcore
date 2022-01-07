Ext.define('Rd.view.meshes.winMeshMapPreferences', {
    extend		: 'Ext.window.Window',
    alias 		: 'widget.winMeshMapPreferences',
    title 		: i18n('sPreferences'),
    layout		: 'fit',
    autoShow	: false,
    width		: 450,
    height		: 350,
    glyph		: Rd.config.icnSpanner,
	meshId		: '',
	mapPanel	: '',
	mapType     : 'Google',
    initComponent: function() {
        var me = this;

        var types = Ext.create('Ext.data.Store', {
            fields: ['id', 'text'],
            data : [
                {"id":"HYBRID",     "text": i18n("sHybrid")},
                {"id":"ROADMAP",    "text": i18n("sRoadmap")},
                {"id":"SATELLITE",  "text": i18n("sSatellite")},
                {"id":"TERRAIN",    "text": i18n("sTerrain")}
            ]
        });
        
        var type_hide = false;
        if(me.mapType == 'Leaflet'){ //Leaflet does not need type
            type_hide = true;
        }
        me.items = [
            {
                xtype: 'form',
                border:     false,
                layout:     'anchor',
                autoScroll: true,
                defaults: {
                    anchor: '100%'
                },
                fieldDefaults: {
                    msgTarget: 'under',
                    labelClsExtra: 'lblRd',
                    labelAlign: 'left',
                    labelSeparator: '',
                    margin: 15
                },
                defaultType: 'textfield',
                items: [
                    {
                        xtype       : 'numberfield',
                        name        : 'map_lng',
                        itemId      : 'lng',  
                        fieldLabel  : i18n('sLongitude'),
                        value       : 0,
                        maxValue    : 180,
                        minValue    : -180,
                        decimalPrecision: 14,
                        labelClsExtra: 'lblRdReq'
                    },
                    {
                        xtype       : 'numberfield',
                        name        : 'map_lat',
                        itemId      : 'lat',  
                        fieldLabel  : i18n('sLatitude'),
                        value       : 0,
                        maxValue    : 90,
                        minValue    : -90,
                        decimalPrecision: 14,
                        labelClsExtra: 'lblRdReq'
                    },
                    {
                        xtype       : 'numberfield',
                        name        : 'map_zoom',
                        itemId      : 'zoom',  
                        fieldLabel  : 'Zoom level',
                        value       : 17,
                        maxValue    : 22,
                        minValue    : 0,
                        labelClsExtra: 'lblRdReq'
                    },
                    {
                        xtype       : 'combobox',
                        name        : 'map_type',
                        itemId      : 'type',
                        fieldLabel  : i18n('sType'),
                        store       : types,
                        queryMode   : 'local',
                        displayField  : 'text',
                        valueField    : 'id',
                        allowBlank  : false,
                        forceSelection: true,
                        labelClsExtra: 'lblRdReq',
                        disabled    : type_hide,
                        hidden      : type_hide
                    }
                ],
                buttons: [
                    {
                        itemId: 'snapshot',
                        text: i18n('sSnapshot'),
                        scale: 'large',

                        glyph: Rd.config.icnSnapshot,
                        margin: '0 20 40 0'
                    },
                    {
                        itemId  : 'save',
                        text    : i18n('sOK'),
                        scale   : 'large',
                        glyph   : Rd.config.icnYes,
                        formBind: true,
                        margin: '0 20 40 0'
                    }
                ]
            }
        ];
        this.callParent(arguments);
    }
});

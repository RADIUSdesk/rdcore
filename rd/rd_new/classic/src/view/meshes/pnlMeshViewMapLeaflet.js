Ext.define('Rd.view.meshes.pnlMeshViewMapLeaflet', {
    extend  : 'Ext.panel.Panel',
    alias   :'widget.pnlMeshViewMapLeaflet',
    requires	: [
        'Rd.view.meshes.vcMeshViewMapLeaflet',
        'Rd.view.components.cmbMesh',
        'Rd.view.components.cmpLeafletMapView'
    ],
    controller  : 'vcMeshViewMapLeaflet',
    listeners       : {
        show        : 'loadMapOverview', //Trigger a load of the settings (This is only on the initial load)
        afterrender : 'OnPnlAfterrender'
    }, 
    dockedItems: [
        {
            xtype   : 'toolbar',
            dock    : 'top',
            items   : [
                {
                    ui      : 'button-orange', 
                    glyph   : Rd.config.icnReload, 
                    scale   : 'small', 
                    itemId  : 'reload', 
                    tooltip : i18n('sReload'),
                    listeners       : {
				        click : 'onBtnReload'
		            }
                },
                {
                    xtype       : 'cmbMesh',
                    width       : 430,
                    labelWidth  : 50, 
                    listeners   : {
                        change : 'onCmbMeshChange'           
                    }  
                },
                '|',
                {
                    ui      : 'button-pink',
                    scale   : 'small', 
                    glyph   : Rd.config.icnBack, 
                    text    : 'Back',
                    hidden  : true,
                    reference: 'btnOverview',
                    listeners : {
				        click : 'onBtnOverview'
		            }
                }
            ]
        },
        {
            itemId      : 'cntBanner',
            reference   : 'cntBanner',
            xtype       : 'container',
            dock        : 'top',
            style       : { 
                background  : '#adc2eb',
                textAlign   : 'center'
            },
            height      : 50,
            tpl     : new Ext.XTemplate(
                '<h2 style="color:#ffffff;font-weight:lighter;">',
                    '<i class="fa fa-globe"></i> Maps',
                '</h2>'
            ),
            data    : {
            }
        }
    ],
    initComponent: function(){
        var me = this;
        me.callParent(arguments);
    },
    items: [{ 
        xtype           : 'cmpLeafletMapView',
        initialLocation : [39.50, -98.35],
		initialZoomLevel: 16 
    }]
});


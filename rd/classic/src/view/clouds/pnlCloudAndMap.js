Ext.define('Rd.view.clouds.pnlCloudAndMap' ,{
    extend      : 'Ext.panel.Panel',
    alias       : 'widget.pnlCloudAndMap',
    layout      : {  
        type    : 'hbox',
        align   : 'stretch'
    },
    controller  : 'vcCloudAndMap',
    requires: [
        'Rd.view.clouds.vcCloudAndMap',
        'Rd.view.components.cmpLeafletMapView'
    ],
    items       : [
        {
            xtype    : 'treeClouds',
            flex     : 1,
            border   : false,
            frame    : true,
            padding : Rd.config.gridPadding 
        },
        {
            xtype   : 'panel',
            itemId  : 'pnlMap',
            layout  : 'fit', 
            flex    : 1,
            border  : false,
            frame   : true,
            padding : Rd.config.gridPadding,
            items   : [{ 
                xtype           : 'cmpLeafletMapView'
            }]
        }
    ]
});

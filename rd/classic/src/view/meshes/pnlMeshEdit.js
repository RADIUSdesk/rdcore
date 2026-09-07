Ext.define('Rd.view.meshes.pnlMeshEdit', {
    extend      : 'Ext.panel.Panel',
    alias       : 'widget.pnlMeshEdit',
    layout      : {
        type    : 'vbox',
        align   : 'stretch'
    },
    meshId      : undefined,
    meshName    : undefined,
    requires    : [
        'Rd.view.components.cntNavigation'
    ],
    initComponent: function() {
        var me      = this;
        
        me.items = [ 
            {
                xtype   : 'cntNavigation',
                margin  : 0,
                padding : 5,
                url     : '/cake4/rd_cake/meshes/nav-mesh-edit.json'
            },
            {
                xtype   : 'container',
                layout  : 'card',
                itemId  : 'crdMeshEdit',
                flex    : 1,
                items   : [
                    {
                        itemId  : 'tabMeshGeneral',
                        xtype   : 'pnlMeshGeneral',
                        meshId  : me.meshId
                    },
                    {
                        itemId  : 'tabEntryPoints',
                        xtype   : 'gridMeshEntries',
                        meshId  : me.meshId,
                        padding : Rd.config.gridSlim
                    },
                    {
                        itemId  : 'tabMeshSettings',
                        xtype   : 'pnlMeshSettings',
                        meshId  : me.meshId
                    },
                    {
                        itemId  : 'tabExitPoints',
                        xtype   : 'gridMeshExits',
                        meshId  : me.meshId,
                        padding : Rd.config.gridSlim
                    },
                    {
                        itemId  : 'tabNodeCommonSettings',
                        xtype   : 'pnlNodeCommonSettings',
                        meshId  : me.meshId 
                    },
                    {
                        itemId  : 'tabNodes',
                        xtype   : 'gridNodes',
                        meshId  : me.meshId,
                        padding : Rd.config.gridSlim   
                    }
                ]
            }
        ];
        me.callParent(arguments);
    }
});

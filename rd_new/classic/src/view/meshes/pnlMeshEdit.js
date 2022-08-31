Ext.define('Rd.view.meshes.pnlMeshEdit', {
   extend       : 'Ext.tab.Panel',
    alias       : 'widget.pnlMeshEdit',
    border      : true,
    meshId      : undefined,
    meshName    : undefined,
    plain       : true,
    tabPosition : 'top',
    cls         : 'subTab',
    listeners   : {
        afterrender: function(panel) {
            var bar = panel.tabBar;
            bar.insert(6, [{
                xtype: 'component',
                flex: 1
            }, {
                xtype   : 'button',
                itemId  : 'viewMesh',
                margin  : 2,
                padding : 2,
                text    : 'View MESH',
                scale   : 'medium',
                glyph   : Rd.config.icnView,
                ui      : Rd.config.btnUiDataNext              
            }]);
        }
    },
    initComponent: function() {
        var me      = this;
        
        console.log("Mesh ID is "+me.meshId);   
        me.items    = [
            {
                title   : i18n("sGeneral"),
                itemId  : 'tabMeshGeneral',
                xtype   : 'pnlMeshGeneral',
                meshId  : me.meshId
            },
            {
                title   : i18n("sEntry_points"),
                itemId  : 'tabEntryPoints',
                xtype   : 'gridMeshEntries',
                meshId  : me.meshId
            },
            {
                title   :  i18n("sMesh_settings"),
                itemId  : 'tabMeshSettings',
                xtype   : 'pnlMeshSettings',
                meshId  : me.meshId
            },
            {
                title   :  i18n("sExit_points"),
                itemId  : 'tabExitPoints',
                xtype   : 'gridMeshExits',
                meshId  : me.meshId
            },
            {
                title   : i18n("sNode_settings"),
                itemId  : 'tabNodeCommonSettings',
                xtype   : 'pnlNodeCommonSettings',
                meshId  : me.meshId 
            },
            {
                title   : i18n("sNodes"),
                itemId  : 'tabNodes',
                xtype   : 'gridNodes',
                meshId  : me.meshId    
            }
        ];
        me.callParent(arguments);
    }
});

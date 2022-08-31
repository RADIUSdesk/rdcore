Ext.define('Rd.view.meshes.pnlMeshView', {
    extend      : 'Ext.tab.Panel',
    alias       : 'widget.pnlMeshView',
    meshId      : undefined,
    meshName    : undefined,
    plain       : true,
    tabPosition : 'top',
    cls         : 'subTab',
    showEdit    : true,
    listeners   : {
        afterrender: function(panel) {
            var me = this;
            if(me.showEdit){
                var bar = panel.tabBar;
                bar.insert(5, [{
                    xtype: 'component',
                    flex: 1
                }, {
                    xtype   : 'button',
                    itemId  : 'editMesh',
                    margin  : 2,
                    padding : 2,
                    text    : 'Edit MESH',
                    scale   : 'medium',
                    glyph   : Rd.config.icnEdit,
                    ui      : Rd.config.btnUiDataNext
                }]);
            }
        }
    },
    initComponent: function() {
        var me      = this;     
        me.items    = [
            {
                title   : 'SSID &#8660; Device',
                itemId  : 'tabMeshViewEntries',
                xtype   : 'pnlMeshViewEntries',
                meshId  : me.mesh_id
            },
            {
                title   : 'Node &#8660; Device',
                itemId  : 'tabMeshViewNodes',
                xtype   : 'pnlMeshViewNode',
                meshId  : me.mesh_id
            },
		    {
                title   : 'Node &#8660; Nodes',
                itemId  : 'tabMeshViewNodeNodes',
			    xtype   : 'gridMeshViewNodeNodes',
                meshId  : me.mesh_id
            },
		    {
                title   : i18n("sNodes"),
                itemId  : 'tabMeshViewNodeDetails',
			    xtype   : 'gridMeshViewNodeDetails',
                meshId  : me.mesh_id
            },
            {
                title   : i18n("sOverview"),
                itemId  : 'tabMeshViewOverwiew',
			    xtype	: 'pnlMeshViewNodes',
                meshId  : me.mesh_id
            }
        ];
        me.callParent(arguments);
    }
});

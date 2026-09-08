Ext.define('Rd.view.meshes.pnlMeshView', {
    extend      : 'Ext.panel.Panel',
    alias       : 'widget.pnlMeshView',
    layout      : {
        type    : 'vbox',
        align   : 'stretch'
    },
    meshId      : undefined,
    meshName    : undefined,
    controller  : 'vcMeshView',
    requires    : [
        'Rd.view.components.cntNavigation',
        'Rd.view.meshes.vcMeshView'
    ],
    initComponent: function() {
        var me      = this; 
        me.items = [ 
            {
                xtype   : 'cntNavigation',
                margin  : 0,
                padding : 5,
                url     : '/cake4/rd_cake/meshes/nav-mesh-view.json'
            },
            {
                xtype   : 'container',
                layout  : 'card',
                itemId  : 'crdMeshView',
                flex    : 1,
                items   : [
                    {                    
                        itemId  : 'tabMeshViewOverwiew',
			            xtype	: 'pnlMeshViewNodes',
                        meshId  : me.mesh_id
                    },
                    {
                        itemId  : 'tabMeshViewEntries',
                        xtype   : 'pnlMeshViewEntries',
                        meshId  : me.mesh_id
                    },
                    {
                        itemId  : 'tabMeshViewNodes',
                        xtype   : 'pnlMeshViewNode',
                        meshId  : me.mesh_id
                    },
		            {
                        itemId  : 'tabMeshViewNodeNodes',
			            xtype   : 'gridMeshViewNodeNodes',
                        meshId  : me.mesh_id,
                        padding : Rd.config.gridSlim
                    },
		            {
                        itemId  : 'tabMeshViewNodeDetails',
			            xtype   : 'gridMeshViewNodeDetails',
                        meshId  : me.mesh_id,
                        padding : Rd.config.gridSlim
                    }              
                ]            
            }
        ];   
        
        me.callParent(arguments);
    }
});

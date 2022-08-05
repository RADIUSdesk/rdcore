Ext.define('Rd.controller.cMeshNodeRogue', {
    extend: 'Ext.app.Controller',
    views:  [
        'meshes.pnlMeshNodeRogue',
        'meshes.gridMeshNodeRogue'  
    ],
    models      : [ 
		'mMeshNodeRogue'
    ],
    stores      : [	
		'sMeshNodeRogues'
    ],
    config      : {  
        urlNodeStartRogueScan        : '/cake3/rd_cake/meshes/mesh-node-start-rogue-scan.json'
    },
    refs: [
     //   {  ref: 'winMeshNodeRogue',  selector: 'winMeshNodeRogue' } 
    ],
    init: function() {
        var me = this;
        
        if (me.inited) {
            return;
        }
        me.inited = true;
            
        me.control({
          /*  'winMeshNodeRogue #addsave' : {
               // click:  me.btnAddNodeSave
            },
            'winMeshNodeRogue #editsave': {
              //  click: me.btnEditNodeSave
            } */
        });
    },
    actionIndex: function(node_id,params){
        var me = this;
        if(!Ext.WindowManager.get('sWinMeshNodeRogue')){
            var win = Ext.widget('window',{
                id          : 'sWinMeshNodeRogue',
                title       : 'Rogue Access Point Detection',
                width       : Rd.config.winWidth,
                height      : Rd.config.winHeight,
                glyph       : Rd.config.icnEyeSlash,
                maximizable : true,
                maximized   : true,
                animCollapse:false,
                border      :false,
                constrainHeader:true,
                layout      : 'fit',
                items: [ 
                    {
                        xtype   : 'pnlMeshNodeRogue',
                        ui      : 'light',
                        border  : false,
                        nodeId  : node_id
                    }
                ]
            });
            win.show();
        }
    }
});

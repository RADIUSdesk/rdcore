Ext.define('Rd.controller.cMeshNode', {
    extend: 'Ext.app.Controller',
    views:  [
        'meshes.pnlMeshAddEditNode' 
    ],
    config      : {  
        urlAddNode                  : '/cake3/rd_cake/meshes/mesh_node_add.json',
        urlViewNode                 : '/cake3/rd_cake/meshes/mesh_node_view.json',
        urlEditNode                 : '/cake3/rd_cake/meshes/mesh_node_edit.json',  
        urlAdvancedSettingsForModel : '/cake3/rd_cake/meshes/advanced_settings_for_model.json'
    },
    refs: [
        {  ref: 'tabMeshes',  selector: '#tabMeshes' } 
    ],
    init: function() {
        var me = this;
        
        if (me.inited) {
            return;
        }
        me.inited = true;
            
        me.control({
            'pnlMeshAddEditNode #addsave' : {
                click:  me.btnAddNodeSave
            },
            'pnlMeshAddEditNode #editsave': {
                click: me.btnEditNodeSave
            } 
        });
    },
    actionIndex: function(node_id,params){
		var me      	= this;
        var id			= 'tabNodeAddEdit'+ node_id;
        var tabMeshes  	= me.getTabMeshes();
		var meshId      = params.meshId;
		var mesh 	    = params.mesh;
		var name 		= params.name;
		var store		= params.store;
		var mac         = params.mac;
		
        var newTab  = tabMeshes.items.findBy(
            function (tab){
                return tab.getItemId() === id;
            });
         
        if (!newTab){
            newTab = tabMeshes.add({
                glyph   		: Rd.config.icnEdit, 
                title   		: name,
                closable		: true,
                layout  		: 'auto',
                xtype   		: 'pnlMeshAddEditNode',
                itemId  		: id,
                nodeId          : node_id,
                meshId          : meshId,
                meshName	    : mesh,
				store			: store,
				mac             : mac
            });
        }    
        tabMeshes.setActiveTab(newTab);    
    },
    btnEditNodeSave:  function(button){
        var me      = this;
        var form    = button.up("form");
        var pnl     = button.up('pnlMeshAddEditNode');
        form.submit({
            clientValidation: true,
            url: me.getUrlEditNode(),
            success: function(form, action) {
                pnl.close();
                pnl.store.load();
                Ext.ux.Toaster.msg(
                        i18n("sItem_updated_fine"),
                        i18n("sItem_updated_fine"),
                        Ext.ux.Constants.clsInfo,
                        Ext.ux.Constants.msgInfo
                );
                
            },
            scope       : me,
            failure     : Ext.ux.formFail
        });
        
    },
    btnAddNodeSave: function(button){
    
        var me      = this;
        var form    = button.up("form");
        var pnl     = button.up('pnlMeshAddEditNode');
        var multi   = pnl.down('#chkMultiple')
        form.submit({
            clientValidation: true,
            url: me.getUrlAddNode(),
            success: function(form, action) {
                if(multi.getValue() == false){ //Only if the person did not choose to add multiple
                    pnl.close();
                }
                pnl.store.load();
                Ext.ux.Toaster.msg(
                        i18n("sItem_added_fine"),
                        i18n("sItem_added_fine"),
                        Ext.ux.Constants.clsInfo,
                        Ext.ux.Constants.msgInfo
                );
            },
            scope       : me,
            failure     : Ext.ux.formFail
        });    
    }
});

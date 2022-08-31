Ext.define('Rd.view.unknownNodes.vcUnknownNodes', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcUnknownNodes',
    init    : function() {
    
    },
    config: {
         urlRedirectNode : '/cake4/rd_cake/nodes/redirect_unknown.json'
    },
    control: {
        'gridUnknownNodes #reload': {
            click:      'gridUnknownNodesReload'
        },
        'gridUnknownNodes #reload menuitem[group=refresh]'   : {
            click:      'reloadUnknownNodesOptionClick'
        },
		'gridUnknownNodes #attachMesh': {
            click:  'attachNode'
        },
        'gridUnknownNodes #attachAp': {
            click:  'attachAp'
        },
		'gridUnknownNodes #delete': {
            click: 'delUnknownNode'
        },
        'gridUnknownNodes #redirect' : {
            click: 'redirectNode'
        },
        'gridUnknownNodes actioncolumn' : {
             itemClick  : 'onUnknownActionColumnItemClick'
        },
        'winMeshUnknownRedirect #save' : {
			click: 'btnRedirectNodeSave'
		} 
    },
    onPnlActivate: function(pnl){
        var me = this;
        me.reload();
    },
    reload: function(){
        var me      = this;
        me.getView().getSelectionModel().deselectAll(true);
        me.getView().getStore().load();
    },
    gridUnknownNodesReload: function(button){
        var me  = this;
        var g = button.up('gridUnknownNodes');
        g.getStore().load();
    },
    reloadUnknownNodesOptionClick: function(menu_item){
        var me      = this;
        var n       = menu_item.getItemId();
        var b       = menu_item.up('button'); 
        var interval= 30000; //default
        clearInterval(me.autoReloadUnknownNodes);   //Always clear
        b.setGlyph(Rd.config.icnTime);

        if(n == 'mnuRefreshCancel'){
            b.setGlyph(Rd.config.icnReload);
            return;
        }
        
        if(n == 'mnuRefresh1m'){
           interval = 60000
        }

        if(n == 'mnuRefresh5m'){
           interval = 360000
        }
        me.autoReloadUnknownNodes = setInterval(function(){        
            me.gridUnknownNodesReload(b);
        },  interval);  
    },

	//_______ Unknown Nodes ______
	attachNode: function(){
	    var me      = this;
        var store   = me.getView().getStore();
        if(me.getView().getSelectionModel().getCount() == 0){
            Ext.ux.Toaster.msg(
                i18n('sSelect_an_item'),
                i18n('sFirst_select_an_item'),
                Ext.ux.Constants.clsWarn,
                Ext.ux.Constants.msgWarn
            );  
        }else{
            var sr              = me.getView().getSelectionModel().getLastSelected();
            var id              = 0
			var mac		        = sr.get('mac');				
			Rd.getApplication().runAction('cMeshNode','Index',id,{
			    name        : 'Attach Node',
			    id          : id,
			    mac			: mac,
				store       : store,
				record      : sr
		    });
        }
    },
    attachAp: function(){
	    var me      = this;
        var store   = me.getView().getStore();
        if(me.getView().getSelectionModel().getCount() == 0){
            Ext.ux.Toaster.msg(
                i18n('sSelect_an_item'),
                i18n('sFirst_select_an_item'),
                Ext.ux.Constants.clsWarn,
                Ext.ux.Constants.msgWarn
            );  
        }else{
            var sr              = me.getView().getSelectionModel().getLastSelected();
            var id              = 0
			var mac		        = sr.get('mac');				
			Rd.getApplication().runAction('cAccessPointAp','Index',id,{
			    name        : 'Attach AP',
			    id          : id,
			    mac			: mac,
				store       : store,
				record      : sr
		    });
        }
    },
	delUnknownNode:   function(){
        var me      = this;
        var grid    = me.getView();    
        //Find out if there was something selected
        if(grid.getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item_to_delete'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            Ext.MessageBox.confirm(i18n('sConfirm'), i18n('sAre_you_sure_you_want_to_do_that_qm'), function(val){
                if(val== 'yes'){
                    grid.getStore().remove(grid.getSelectionModel().getSelection());
                    grid.getStore().sync({
                        success: function(batch,options){
                            Ext.ux.Toaster.msg(
                                i18n('sItem_deleted'),
                                i18n('sItem_deleted_fine'),
                                Ext.ux.Constants.clsInfo,
                                Ext.ux.Constants.msgInfo
                            );  
                        },
                        failure: function(batch,options,c,d){
                            Ext.ux.Toaster.msg(
                                i18n('sProblems_deleting_item'),
                                batch.proxy.getReader().rawData.message.message,
                                Ext.ux.Constants.clsWarn,
                                Ext.ux.Constants.msgWarn
                            );
                            grid.getStore().load(); //Reload from server since the sync was not good
                        }
                    });
                }
            });
        }
    },
    redirectNode: function(){
        var me      = this;
        var store   = me.getView().getStore();
        if(me.getView().getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            var sr          = me.getView().getSelectionModel().getLastSelected();
            var id          = sr.getId();
            var new_server  = sr.get('new_server');
            var proto       = sr.get('new_server_protocol');
            if(!Ext.WindowManager.get('winUnknownRedirectId')){
                var w = Ext.widget('winUnknownRedirect',
                {
                    id              :'winUnknownRedirectId',
                    unknownNodeId   : id,
					new_server	    : new_server,
					new_server_protocol : proto,
                    store           : store
                });
                w.show();         
            }
        }
    },
	btnRedirectNodeSave: function(button){
        var me      = this;
        var win     = button.up("winUnknownRedirect");
        var form    = win.down('form');
        form.submit({
            clientValidation: true,
            url: me.getUrlRedirectNode(),
            success: function(form, action) {
                win.close();
                win.store.load();
                Ext.ux.Toaster.msg(
                    i18n('sItem_updated'),
                    i18n('sItem_updated_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },
            failure: Ext.ux.formFail
        });
    },
    onUnknownActionColumnItemClick: function(view, rowIndex, colIndex, item, e, record, row, action){
        //console.log("Action Item "+action+" Clicked");
        var me = this;
        var grid = view.up('grid');
        grid.setSelection(record);
        if(action == 'attachMesh'){
            me.attachNode()
        }
        if(action == 'attachAp'){
            me.attachAp()
        }
        if(action == 'delete'){
            me.delUnknownNode();
        }
        if(action == 'redirect'){
            me.redirectNode();
        }      
    }
});

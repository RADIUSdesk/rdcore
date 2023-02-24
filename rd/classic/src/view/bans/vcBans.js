Ext.define('Rd.view.bans.vcBans', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcBans',
        init    : function() {
    
    },
    config: {
    	UrlDelete	: '/cake4/rd_cake/bans/delete.json',
        UrlAdd		: '/cake4/rd_cake/bans/add.json',
        UrlEdit		: '/cake4/rd_cake/bans/edit.json'
    },
    control: {
        'gridBans #reload': {
            click   : 'reload'
        },
        'gridBans #add': {
            click   : 'add'
        },
        'gridBans #edit': {
            click   : 'edit'
        },      
        'gridBans #delete': {
            click   : 'del'
        },
        'winAddBan #save': {
            click: 'addSave'
        }
    },
    reload: function(){
        var me      = this;
        me.getView().getSelectionModel().deselectAll(true);
        me.getView().getStore().load();
    },
    del:   function(){
        var me      = this;     
        //Find out if there was something selected
        if(me.getView().getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item_to_delete'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            Ext.MessageBox.confirm(i18n('sConfirm'), i18n('sAre_you_sure_you_want_to_do_that_qm'), function(val){
                if(val== 'yes'){
                    var selected    = me.getView().getSelectionModel().getSelection();
                    var list        = [];
                    Ext.Array.forEach(selected,function(item){
                        var id = item.get('id');
                        Ext.Array.push(list,{'id' : id});
                    });
                    Ext.Ajax.request({
                        url: me.getUrlDelete(),
                        method: 'POST',          
                        jsonData: list,
                        success: function(batch,options){console.log('success');
                            Ext.ux.Toaster.msg(
                                i18n('sItem_deleted'),
                                i18n('sItem_deleted_fine'),
                                Ext.ux.Constants.clsInfo,
                                Ext.ux.Constants.msgInfo
                            );
                            me.reload(); //Reload from server
                        },                                    
                        failure: function (response, options) {
                            var jsonData = Ext.JSON.decode(response.responseText);
                            Ext.Msg.show({
                                title       : "Error",
                                msg         : response.request.url + '<br>' + response.status + ' ' + response.statusText+"<br>"+jsonData.message,
                                modal       : true,
                                buttons     : Ext.Msg.OK,
                                icon        : Ext.Msg.ERROR,
                                closeAction : 'destroy'
                            });
                            me.reload(); //Reload from server
                        }
                    });
                }
            });
        }
    },
    onViewActivate: function(pnl){
        var me = this;
        me.reload();   
    },
    add: function(btn){
    	var me = this;
    	if(!Ext.WindowManager.get('winAddBanId')){
            var w = Ext.widget('winAddBan',{id:'winAddBanId'});
            me.getView().add(w); 
            w.show();           
        }  
    },
    edit: function(btn){
    	var me = this;
        if(me.getView().getSelectionModel().getCount() == 0){
            Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );          
        }else{
            var sr      = me.getView().getSelectionModel().getLastSelected();  			
			if(!Ext.WindowManager.get('winEditBanId')){
                var w = Ext.widget('winEditBan',{id:'winEditBanId',record: sr});
                me.getView().add(w); 
                w.show();           
            }
        }
    },
    rgrpScopeChange : function( rgrp,newValue, oldValue, eOpts){

		var form = rgrp.up('form');
		var cmbMesh = form.down('#mesh_id');
		var cmbApProfile = form.down('#ap_profile_id');
		
		if(newValue.scope == 'cloud_wide'){
			cmbMesh.setHidden(true);
			cmbMesh.setDisabled(true);
			cmbApProfile.setHidden(true);
			cmbApProfile.setDisabled(true);			
		}
		
		if(newValue.scope == 'ap_profile_only'){
			cmbMesh.setHidden(true);
			cmbMesh.setDisabled(true);
			cmbApProfile.setHidden(false);
			cmbApProfile.setDisabled(false);				
		}
		
		if(newValue.scope == 'mesh_only'){
			cmbMesh.setHidden(false);
			cmbMesh.setDisabled(false);
			cmbApProfile.setHidden(true);
			cmbApProfile.setDisabled(true);				
		}   
    },
    rgrpActionChange : function( rgrp,newValue, oldValue, eOpts){
    	var form 	= rgrp.up('form');
    	var bw_up 	= form.down('#bw_up');
    	var bw_down = form.down('#bw_down');
    	if(newValue.action == 'block'){
    		bw_up.setHidden(true);
			bw_up.setDisabled(true);
			bw_down.setHidden(true);
			bw_down.setDisabled(true);			 	
    	}
    	
    	if(newValue.action == 'limit'){
    		bw_up.setHidden(false);
			bw_up.setDisabled(false);
			bw_down.setHidden(false);
			bw_down.setDisabled(false); 	
    	}    
    },
    addSave: function(btn){
        var me 		= this;
        var form    = btn.up('form');
        var window  = form.up('window'); 
        form.submit({
            clientValidation: true,
            url             : me.getUrlAdd(),
            success         : function(form, action) {              
                //FIXME reload store....
                Ext.ux.Toaster.msg(
                    'Item Added',
                    'Item Added Fine',
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );               
                me.reload();
                window.close();
            },
            failure: Ext.ux.formFail,
            scope: me
        });
    },
    editSave: function(btn){
        var me 		= this;
        var form    = btn.up('form');
        var window  = form.up('window'); 
        form.submit({
            clientValidation: true,
            url             : me.getUrlEdit(),
            success         : function(form, action) {              
                //FIXME reload store....
                Ext.ux.Toaster.msg(
                    'Item Added',
                    'Item Added Fine',
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );               
                me.reload();
                window.close();
            },
            failure: Ext.ux.formFail,
            scope: me
        });
    }
});

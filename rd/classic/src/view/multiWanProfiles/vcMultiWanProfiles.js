Ext.define('Rd.view.multiWanProfiles.vcMultiWanProfiles', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcMultiWanProfiles',
    init    : function() {
    	var me = this;   
    	var dd = Rd.getApplication().getDashboardData();
    	//Set root to use later in the app in order to set 'for_system' (root)
        me.root    = false;
        if(dd.isRootUser){
            me.root = true;   
        }  
    },
    config: {
        urlAdd          : '/cake4/rd_cake/multi-wan-profiles/add.json',
        urlDelete       : '/cake4/rd_cake/multi-wan-profiles/delete.json',
		urlEdit         : '/cake4/rd_cake/multi-wan-profiles/edit.json'
    },
    control: {
    	'pnlMultiWanProfiles #reload': {
            click   : 'reload'
        },
        'pnlMultiWanProfiles #add': {
             click: 'add'
        },
        'pnlMultiWanProfiles #delete': {
            click   : 'del'
        },
        'pnlMultiWanProfiles #edit': {
            click: 'edit'
        },
        'pnlMultiWanProfiles #dvMultiWanProfiles' : {
        	itemclick	: 'itemSelected'
        }, 
        'winMultiWanProfileAdd #btnAddSave' : {
            click   : 'btnAddSave'
        },
        'winMultiWanProfileEdit #btnSave' : {
            click   : 'btnEditSave'
        },
        'winMultiWanProfileInterfaceAdd #save': {
            click   : 'btnInterfaceAddSave'
        }, 
      //  'winMultiWanProfileInterfaceEdit': {
      //      show   : 'winMultiWanProfileInterfaceEditShow'
     //   },
     //   'winMultiWanProfileInterfaceEdit #save': {
     //       click   : 'btnEntryInterfaceSave'
     //   }           
    },
    itemSelected: function(dv,record){
    	var me = this;
    	//--Add FirewallProfile Component--
    	if(record.get('type') == 'add'){
    		if(!me.rightsCheck(record)){
	    		return;
	    	}
	    	var tp      = me.getView().up('tabpanel');
            var p       = Ext.widget('pnlMultiWanProfileInterfaceAddEdit',{            
                id                      : 'winMultiWanProfileInterfaceAddId',
                multi_wan_profile_id    : record.get('multi_wan_profile_id'),
                multi_wan_profile_name  : record.get('multi_wan_profile_name')               
            });
	    	tp.add(p);
	    	
	    	
		   /* if(!Ext.WindowManager.get('winMultiWanProfileInterfaceAddId')){
                var w = Ext.widget('winMultiWanProfileInterfaceAdd',{id:'winMultiWanProfileInterfaceAddId','multi_wan_profile_id' : record.get('multi_wan_profile_id'),'multi_wan_profile_name' : record.get('multi_wan_profile_name')});
                me.getView().add(w); 
                let appBody = Ext.getBody();
                w.showBy(appBody);             
            } */
    	} 	
    },
    reload: function(){
        var me = this;
        me.getView().down('#dvMultiWanProfiles').getStore().reload();
    },
    add: function(button) {	
        var me      = this;
        var c_name 	= Rd.getApplication().getCloudName();
        var c_id	= Rd.getApplication().getCloudId();    
        if(!Ext.WindowManager.get('winMultiWanProfileAddId')){
            var w = Ext.widget('winMultiWanProfileAdd',{id:'winMultiWanProfileAddId',cloudId: c_id, cloudName: c_name, root: me.root});
            this.getView().add(w);
            let appBody = Ext.getBody();
            w.showBy(appBody);        
        }
    },
    btnAddSave:  function(button){
        var me      = this;
        var win     = button.up('window');
        var form    = win.down('form');
        form.submit({
            clientValidation: true,
            url: me.getUrlAdd(),
            success: function(form, action) {
                win.close();
                me.reload();
                Ext.ux.Toaster.msg(
                    i18n('sNew_item_created'),
                    i18n('sItem_created_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },
            failure: Ext.ux.formFail
        });
        },
    del:   function(){
        var me      = this;     
        //Find out if there was something selected
        if(me.getView().down('#dvMultiWanProfiles').getSelectionModel().getCount() == 0){
            Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item_to_delete'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            Ext.MessageBox.confirm(i18n('sConfirm'), i18n('sAre_you_sure_you_want_to_do_that_qm'), function(val){
                if(val== 'yes'){
                    var selected    = me.getView().down('#dvMultiWanProfiles').getSelectionModel().getSelection();
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
                            me.reload();
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
    edit: function(button) {
        var me      = this;
        //Find out if there was something selected
        if(me.getView().down('#dvMultiWanProfiles').getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item_to_edit'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
		    var sr   =  me.getView().down('#dvMultiWanProfiles').getSelectionModel().getLastSelected();
		    if(!me.rightsCheck(sr)){
	    		return;
	    	}
	    	if(!Ext.WindowManager.get('winMultiWanProfileEditId')){
                var w = Ext.widget('winMultiWanProfileEdit',{id:'winMultiWanProfileEditId',record: sr,root: me.root});
                me.getView().add(w); 
                let appBody = Ext.getBody();
                w.showBy(appBody);      
            }			  		  	  
        }     
    },
    btnEditSave:function(button){
        var me      = this;
        var win     = button.up('window');
        var form    = win.down('form');
        //Checks passed fine...      
        form.submit({
            clientValidation    : true,
            url                 : me.getUrlEdit(),
            success             : function(form, action) {
                me.reload();
                win.close();
                Ext.ux.Toaster.msg(
                    i18n('sItems_modified'),
                    i18n('sItems_modified_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },
            failure             : Ext.ux.formFail
        });
    },
    btnInterfaceAddSave : function(button){
        var me      = this;
        var form    = button.up('form');
        var win     = button.up('winMultiWanProfileInterfaceAdd');
        //Checks passed fine...      
        form.submit({
            clientValidation    : true,
            url                 : me.getUrlAddInterface(),
            success             : function(form, action) {
                Ext.ux.Toaster.msg(
                    'Item added Fine',
                    'Item added Fine',
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
                me.reload();
                win.close();
            },
            failure             : Ext.ux.formFail
        }); 
    },
    rightsCheck: function(record){
    	var me = this;
    	if(record.get('for_system') && (!me.root)){
			Ext.ux.Toaster.msg(
                'No Rights',
                'No Rights For This Action',
                Ext.ux.Constants.clsWarn,
                Ext.ux.Constants.msgWarn
        	);
			return false; //has no rights
		}
    	return true; //has rights    
    }   
    
});

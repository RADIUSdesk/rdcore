Ext.define('Rd.view.realms.vcRealmVlans', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcRealmVlans',
    config  : {
        urlAdd          : '/cake4/rd_cake/realm-vlans/add.json',
        urlDelete       : '/cake4/rd_cake/realm-vlans/delete.json',
		urlEdit         : '/cake4/rd_cake/realm-vlans/edit.json',
		urlView         : '/cake4/rd_cake/realm-vlans/view.json'
    },
    control: {
    	'gridRealmVlans #reload': {
            click   : 'reload'
        },
        'gridRealmVlans #add': {
          	click: 'add'
        },
        'gridRealmVlans #edit': {
         	click: 'edit'
        },       
        'gridRealmVlans #delete': {
            click   : 'del'
        },
        'winRealmVlanAdd #btnDataNext' : {
            click   : 'btnDataNext'
        },
        'winRealmVlanEdit #save': {
            click   : 'btnEditSave'
        }        
    },
    itemSelected: function(dv,record){
    	var me = this;  	
    },
    onViewActivate: function(pnl){
        var me = this;
        me.reload();   
    },
    reload: function(){
        var me = this;
        console.log("Reload");
        me.getView().getSelectionModel().deselectAll(true);
        me.getView().getStore().load();
    },
    add: function(button) {	
        var me      = this;   
        if(!Ext.WindowManager.get('Rd.view.realm.winRealmVlanAdd')){
            var w = Ext.widget('winRealmVlanAdd',{id:'winRealmVlanAddId',realm_id: me.getView().realm_id});
            this.getView().add(w);
            let appBody = Ext.getBody();
            w.showBy(appBody);        
        }
    },
    btnDataNext:  function(button){
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
    edit: function(button) {
        var me      = this;
        //Find out if there was something selected
        if(me.getView().down('#dvFirewallApps').getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item_to_edit'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
			if(!Ext.WindowManager.get('winFirewallAppEditId')){
	            var w = Ext.widget('winFirewallAppEdit',{id:'winFirewallAppEditId',record: sr, firewall_app_id: sr.get('id'),root: me.root});
	            this.getView().add(w);
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
    del: function(button) {
        var me      = this;              
        if(me.getView().down('#dvFirewallApps').getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item_to_delete'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
        
        	var sr   =  me.getView().down('#dvFirewallApps').getSelectionModel().getLastSelected();	
        	if(!me.rightsCheck(sr)){
	    		return;
	    	}
	    	        
        	Ext.MessageBox.confirm(i18n('sConfirm'), 'This will DELETE the Firewall App' , function(val){
		        if(val== 'yes'){
		            var selected    = me.getView().down('#dvFirewallApps').getSelectionModel().getSelection();
		            var list        = [];
		            Ext.Array.forEach(selected,function(item){
		                var id = item.get('id');
		                Ext.Array.push(list,{'id' : id});
		            });
		            Ext.Ajax.request({
		                url: me.getUrlDelete(),
		                method: 'POST',          
		                jsonData: list,
		                success: function(response){
						    var jsonData    = Ext.JSON.decode(response.responseText);
						    if(jsonData.success){
						        Ext.ux.Toaster.msg(
				                    i18n('sItem_deleted'),
				                    i18n('sItem_deleted_fine'),
				                    Ext.ux.Constants.clsInfo,
				                    Ext.ux.Constants.msgInfo
				                );
				                me.reload(); //Reload from server
						    }else{
						    	Ext.ux.Toaster.msg(
				                    i18n('sProblems_deleting_item'),
				                    jsonData.message,
				                    Ext.ux.Constants.clsWarn,
				                    Ext.ux.Constants.msgWarn
				                );			        
						    }                         
		                },                                    
		                failure: function(batch,options){
		                    Ext.ux.Toaster.msg(
		                        i18n('sProblems_deleting_item'),
		                        batch.proxy.getReader().rawData.message.message,
		                        Ext.ux.Constants.clsWarn,
		                        Ext.ux.Constants.msgWarn
		                    );
		                    me.reload(); //Reload from server
		                }
		            });
            	}
        	});        
        }    
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

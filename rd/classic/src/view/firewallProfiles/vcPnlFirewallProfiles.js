Ext.define('Rd.view.firewallProfiles.vcPnlFirewallProfiles', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcPnlFirewallProfiles',
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
        urlAdd          : '/cake4/rd_cake/firewall-profiles/add.json',
        urlDelete       : '/cake4/rd_cake/firewall-profiles/delete.json',
		urlEdit         : '/cake4/rd_cake/firewall-profiles/edit.json',
		urlAddEntry     : '/cake4/rd_cake/firewall-profiles/add-firewall-profile-entry.json',
		urlViewEntry    : '/cake4/rd_cake/firewall-profiles/view-firewall-profile-entry.json',
		urlEditEntry    : '/cake4/rd_cake/firewall-profiles/edit-firewall-profile-entry.json',
		urlDeleteEntry  : '/cake4/rd_cake/firewall-profiles/delete-firewall-profile-entry.json'
    },
    control: {
    	'pnlFirewallProfiles #reload': {
            click   : 'reload'
        },
        'pnlFirewallProfiles #add': {
             click: 'add'
        },
        'pnlFirewallProfiles #edit': {
            click: 'edit'
        },       
        'pnlFirewallProfiles #delete': {
            click   : 'del'
        },
        'pnlFirewallProfiles cmbFirewallProfile': {
           change   : 'cmbFirewallProfileChange'
        },
        'pnlFirewallProfiles #dvFirewallProfiles' : {
        	itemclick	: 'itemSelected'
        },
        'winFirewallProfileAdd #btnDataNext' : {
            click   : 'btnDataNext'
        },
        'winFirewallProfileEdit #save': {
            click   : 'btnEditSave'
        },
        'winFirewallProfileEntryAdd #save': {
            click   : 'btnEntryAddSave'
        }, 
        'winFirewallProfileEntryEdit': {
            show   : 'winFirewallProfileEntryEditShow'
        },
        'winFirewallProfilesEntryEdit #save': {
            click   : 'btnEntryEditSave'
        }                 
    },
    itemSelected: function(dv,record){
    	var me = this;
    	//--Add FirewallProfile Component--
    	if(record.get('type') == 'add'){
    		if(!me.rightsCheck(record)){
	    		return;
	    	}
		    if(!Ext.WindowManager.get('winFirewallProfileAddId')){
                var w = Ext.widget('winFirewallProfileEntryAdd',{id:'winFirewallProfileEntryAddId','firewall_profile_id' : record.get('firewall_profile_id'),'firewall_profile_name' : record.get('firewall_profile_name')});
                me.getView().add(w); 
                let appBody = Ext.getBody();
                w.showBy(appBody);             
            } 
    	} 	
    },
    reload: function(){
        var me = this;
        me.getView().down('#dvFirewallProfiles').getStore().reload();
    },
    add: function(button) {	
        var me      = this;
        var c_name 	= Rd.getApplication().getCloudName();
        var c_id	= Rd.getApplication().getCloudId()    
        if(!Ext.WindowManager.get('winFirewallProfileAddId')){
            var w = Ext.widget('winFirewallProfileAdd',{id:'winFirewallProfileAddId',cloudId: c_id, cloudName: c_name, root: me.root});
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
                me.reloadComboBox();
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
        if(me.getView().down('#dvFirewallProfiles').getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item_to_edit'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
		    var sr   =  me.getView().down('#dvFirewallProfiles').getSelectionModel().getLastSelected();
		    if(!me.rightsCheck(sr)){
	    		return;
	    	}
		    if(sr.get('type') == 'firewall_profile'){
				if(!Ext.WindowManager.get('winFirewallProfileEditId')){
		            var w = Ext.widget('winFirewallProfileEdit',{id:'winFirewallProfileEditId',record: sr, firewall_profile_id: sr.get('firewall_profile_id'),root: me.root});
		            this.getView().add(w);
		            let appBody = Ext.getBody();
		            w.showBy(appBody);            
		        }
		  	}
		  	
		  	 if(sr.get('type') == 'firewall_profile_entry'){
				if(!Ext.WindowManager.get('winFirewallProfileEntryEditId')){
			        let appBody = Ext.getBody();
                    var w = Ext.widget('winFirewallProfileEntryEdit',{id:'winFirewallProfileEntryEditId',record: sr, firewall_profile_entry_id: sr.get('id')});
                    this.getView().add(w);
                    w.showBy(appBody);     
                }  
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
        
        if(me.getView().down('#dvFirewallProfiles').getSelectionModel().getCount() == 0){
            Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item_to_delete'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
        	var sr   =  me.getView().down('#dvFirewallProfiles').getSelectionModel().getLastSelected();
		    if(sr.get('type') == 'firewall_profile'){
		    	 me.delFirewallProfile();
		    }
		    
		    if(sr.get('type') == 'firewall_profile_entry'){
		        me.delFirewallProfileEntry();            
		    }            
        }      
    },           
    delFirewallProfile:   function(){
        var me      = this;     
        Ext.MessageBox.confirm(i18n('sConfirm'), 'This will DELETE the Friewall Profile and ALL its Firewall Profile Entries' , function(val){
            if(val== 'yes'){
                var selected    = me.getView().down('#dvFirewallProfiles').getSelectionModel().getSelection();
                var list        = [];
                Ext.Array.forEach(selected,function(item){
                    var id = item.get('firewall_profile_id');
                    Ext.Array.push(list,{'id' : id});
                });
                Ext.Ajax.request({
                    url: me.getUrlDelete(),
                    method: 'POST',          
                    jsonData: list,
                    success: function(batch,options){
                        Ext.ux.Toaster.msg(
                            i18n('sItem_deleted'),
                            i18n('sItem_deleted_fine'),
                            Ext.ux.Constants.clsInfo,
                            Ext.ux.Constants.msgInfo
                        );
                        me.reload(); //Reload from server
                        me.reloadComboBox();
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
    },
    btnEntryAddSave : function(button){
        var me      = this;
        var form    = button.up('form');
        var win     = button.up('winFirewallProfileEntryAdd');
        //Checks passed fine...      
        form.submit({
            clientValidation    : true,
            url                 : me.getUrlAddEntry(),
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
    winFirewallProfileEntryEditShow : function(win){
        var me      = this; 
        var form    = win.down('form');
        var entryId = win.firewall_profile_entry_id;     
        form.load({
            url         :me.getUrlViewEntry(), 
            method      :'GET',
            params      :{firewall_profile_entry_id:entryId},
            success     : function(a,b,c){
                form.down('#slideTime').setValue(b.result.data.event_time);       
                if(b.result.data.type == 'predefined_command'){
                    var cmb    = form.down("cmbPredefinedCommand");
                    var rec    = Ext.create('Rd.model.mAp', {name: b.result.data.predefined_command_name, id: b.result.data.predefined_command_id});
                    cmb.getStore().loadData([rec],false);
                    cmb.setValue(b.result.data.predefined_command_id);
                    console.log("Brannas");
                }                          
            }
        });        
    },
    btnEntryEditSave : function(button){
        var me      = this;
        var form    = button.up('form');
        var win     = button.up('winFirewallProfileEntryEdit');
        //Checks passed fine...      
        form.submit({
            clientValidation    : true,
            url                 : me.getUrlEditEntry(),
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
    delFirewallProfileEntry:   function(){
        var me      = this;     
        //Find out if there was something selected
        Ext.MessageBox.confirm(i18n('sConfirm'), 'This will DELETE the selected Friewall Profile Entries' , function(val){
            if(val== 'yes'){
                var selected    = me.getView().down('#dvFirewallProfiles').getSelectionModel().getSelection();
                var list        = [];
                Ext.Array.forEach(selected,function(item){
                    var id = item.getId();
                    Ext.Array.push(list,{'id' : id});
                });
                Ext.Ajax.request({
                    url: me.getUrlDeleteEntry(),
                    method: 'POST',          
                    jsonData: list,
                    success: function(batch,options){
                        Ext.ux.Toaster.msg(
                            i18n('sItem_deleted'),
                            i18n('sItem_deleted_fine'),
                            Ext.ux.Constants.clsInfo,
                            Ext.ux.Constants.msgInfo
                        );
                        me.reload(); //Reload from server
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
    },
    cmbFirewallProfileChange: function(cmb,new_value){
    	var me = this;
    	console.log("Filter TO "+new_value);
    	me.getView().down('#dvFirewallProfiles').getStore().getProxy().setExtraParams({id:new_value});
 		me.reload();
    },
    reloadComboBox: function(){  
    	var me = this;
    	me.getView().down('cmbFirewallProfile').getStore().reload();
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

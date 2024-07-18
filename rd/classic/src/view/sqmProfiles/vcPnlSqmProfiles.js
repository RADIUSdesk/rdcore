Ext.define('Rd.view.sqmProfiles.vcPnlSqmProfiles', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcPnlSqmProfiles',
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
        urlAdd          : '/cake4/rd_cake/sqm-profiles/add.json',
        urlDelete       : '/cake4/rd_cake/sqm-profiles/delete.json',
		urlEdit         : '/cake4/rd_cake/sqm-profiles/edit.json'
    },
    control: {
    	'pnlSqmProfiles #reload': {
            click   : 'reload'
        },
        'pnlSqmProfiles #add': {
             click: 'add'
        },
        'pnlSqmProfiles #edit': {
            click: 'edit'
        },       
        'pnlSqmProfiles #delete': {
            click   : 'del'
        },
        'pnlSqmProfiles cmbSqmProfile': {
           change   : 'cmbSqmProfileChange'
        },
        'pnlSqmProfiles #dvSqmProfiles' : {
        	itemclick	: 'itemSelected'
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
        	
        	if(!me.rightsCheck(sr)){
	    		return;
	    	}
        	
		    if(sr.get('type') == 'firewall_profile'){
		    	 me.delFirewallProfile();
		    }
		    
		    if(sr.get('type') == 'firewall_profile_entry'){
		        me.delFirewallProfileEntry();            
		    }            
        }      
    },           
    cmbSqmProfileChange: function(cmb,new_value){
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

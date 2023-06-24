Ext.define('Rd.view.profileComponents.vcProfileComponents', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcProfileComponents',
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
        urlAdd          : '/cake4/rd_cake/profile-components/add.json',
        urlDelete       : '/cake4/rd_cake/profile-components/delete.json',
		urlEdit         : '/cake4/rd_cake/profile-components/edit.json',
		urlAddEntry     : '/cake4/rd_cake/profile-components/add-pc-entry.json',
		urlViewEntry    : '/cake4/rd_cake/profile-components/view-pcentry.json',
		urlEditEntry    : '/cake4/rd_cake/profile-components/edit-pc-entry.json',
		urlDeleteEntry  : '/cake4/rd_cake/profile-components/delete-pc-entry.json'
    },
    control: {
    	'pnlProfileComponents #reload': {
            click   : 'reload'
        },
        'pnlProfileComponents #add': {
             click: 'add'
        },
        'pnlProfileComponents #edit': {
            click: 'edit'
        },       
        'pnlProfileComponents #delete': {
            click   : 'del'
        },
        'pnlProfileComponents cmbProfileComponent': {
        //   change   : 'cmbProfileComponentsChange'
        },
        'pnlProfileComponents #dvProfileComponents' : {
        	itemclick	: 'itemSelected'
        },
        'winProfileComponentAdd #btnDataNext' : {
            click   : 'btnDataNext'
        },
        'winProfileComponentEdit #save': {
            click   : 'btnEditSave'
        },
        'winProfileComponentEntryAdd #save': {
            click   : 'btnEntryAddSave'
        }, 
        'winProfileComponentEntryEdit': {
            show   : 'winProfileComponentEntryEditShow'
        },
        'winProfileComponentsEntryEdit #save': {
            click   : 'btnEntryEditSave'
        }                 
    },
    itemSelected: function(dv,record){
    	var me = this;
    	//--Add Profile Component Entry--
    	if(record.get('type') == 'add'){    	
    		if(!me.rightsCheck(record)){
	    		return;
	    	}  	  	  	
		    if(!Ext.WindowManager.get('winProfileComponentEntryAddId')){	    	    
                var w = Ext.widget('winProfileComponentEntryAdd',{id:'winProfileComponentEntryAddId','profile_component_id' : record.get('profile_component_id'),'profile_component_name' : record.get('profile_component_name')});
                me.getView().add(w); 
                let appBody = Ext.getBody();
                w.showBy(appBody);             
            } 
    	} 	
    },
    reload: function(){
        var me = this;
        me.getView().down('#dvProfileComponents').getStore().reload();
    },
    add: function(button) {	
        var me      = this;
        var c_name 	= Rd.getApplication().getCloudName();
        var c_id	= Rd.getApplication().getCloudId() ;
        var dd      = Rd.getApplication().getDashboardData();
        if(!Ext.WindowManager.get('winProfileComponentAddId')){
            var w = Ext.widget('winProfileComponentAdd',{id:'winProfileComponentAddId',cloudId: c_id, cloudName: c_name, root: me.root});
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
        if(me.getView().down('#dvProfileComponents').getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item_to_edit'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
		    var sr   =  me.getView().down('#dvProfileComponents').getSelectionModel().getLastSelected();
		    if(!me.rightsCheck(sr)){
	    		return;
	    	}
		    
		    if(sr.get('type') == 'profile_component'){
				if(!Ext.WindowManager.get('winProfileComponentEditId')){
		            var w = Ext.widget('winProfileComponentEdit',{id:'winProfileComponentEditId',record: sr, profile_component_id: sr.get('profile_component_id'), root: me.root});
		            this.getView().add(w);
		            let appBody = Ext.getBody();
		            w.showBy(appBody);            
		        }
		  	}
		  	
		  	if(sr.get('type') == 'profile_component_entry'){		  			  	
				if(!Ext.WindowManager.get('winProfileComponenEntryEditId')){
			        let appBody = Ext.getBody();
                    var w = Ext.widget('winProfileComponenEntryEdit',{id:'winProfileComponenEntryEditId',record: sr, profile_component_entry_id: sr.get('id')});
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
        
        if(me.getView().down('#dvProfileComponents').getSelectionModel().getCount() == 0){
            Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item_to_delete'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
        	var sr   =  me.getView().down('#dvProfileComponents').getSelectionModel().getLastSelected();
        	
        	if(!me.rightsCheck(sr)){
	    		return;
	    	}
	    		
		    if(sr.get('type') == 'profile_component'){ 	    		    
		    	me.delProfileComponent();
		    }
		    
		    if(sr.get('type') == 'profile_component_entry'){	    
		        me.delProfileComponentEntry();            
		    }            
        }      
    },           
    delProfileComponent:   function(){
        var me      = this;     
        Ext.MessageBox.confirm(i18n('sConfirm'), 'This will DELETE the Profile Component and ALL its Profile Component Entries' , function(val){
            if(val== 'yes'){
                var selected    = me.getView().down('#dvProfileComponents').getSelectionModel().getSelection();
                var list        = [];
                Ext.Array.forEach(selected,function(item){
                    var id = item.get('profile_component_id');
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
		                    me.reloadComboBox();
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
    },
    btnEntryAddSave : function(button){
        var me      = this;
        var form    = button.up('form');
        var win     = button.up('winProfileComponentEntryAdd');
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
    winProfileComponentEntryEditShow : function(win){
        var me      = this; 
        var form    = win.down('form');
        var entryId = win.profile_component_entry_id;     
        form.load({
            url         :me.getUrlViewEntry(), 
            method      :'GET',
            params      :{profile_component_entry_id:entryId},
            success     : function(a,b,c){
                form.down('#slideTime').setValue(b.result.data.event_time);       
                if(b.result.data.type == 'predefined_command'){
                    var cmb    = form.down("cmbPredefinedCommand");
                    var rec    = Ext.create('Rd.model.mAp', {name: b.result.data.predefined_command_name, id: b.result.data.predefined_command_id});
                    cmb.getStore().loadData([rec],false);
                    cmb.setValue(b.result.data.predefined_command_id);
                }                          
            }
        });        
    },
    btnEntryEditSave : function(button){
        var me      = this;
        var form    = button.up('form');
        var win     = button.up('winProfileComponentEntryEdit');
        //Checks passed fine...      
        form.submit({
            clientValidation    : true,
            url                 : me.getUrlEditEntry(),
            success             : function(form, action) {
                Ext.ux.Toaster.msg(
                    i18n('sItems_modified'),
                    i18n('sItems_modified_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
                me.reload();
                win.close();
            },
            failure             : Ext.ux.formFail
        }); 
    },
    delProfileComponentEntry:   function(){
        var me      = this;     
        //Find out if there was something selected
        Ext.MessageBox.confirm(i18n('sConfirm'), 'This will DELETE the selected Profile Component Entries' , function(val){
            if(val== 'yes'){
                var selected    = me.getView().down('#dvProfileComponents').getSelectionModel().getSelection();
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
    cmbProfileComponentChange: function(cmb,new_value){
    	var me = this;
    	me.getView().down('#dvProfileComponents').getStore().getProxy().setExtraParams({id:new_value});
 		me.reload();
    },
    reloadComboBox: function(){  
    	var me = this;
    	me.getView().down('cmbProfileComponent').getStore().reload();
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

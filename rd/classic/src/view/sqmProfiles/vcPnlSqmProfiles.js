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
        }           
    },
    reload: function(){
        var me = this;
        me.getView().down('#dvSqmProfiles').getStore().reload();
    },
    add: function(button) {	
        var me      = this;
        var c_name 	= Rd.getApplication().getCloudName();
        var c_id	= Rd.getApplication().getCloudId()    
        if(!Ext.WindowManager.get('winSqmProfileAddId')){
            var w = Ext.widget('winSqmProfileAdd',{id:'winSqmProfileAddId',cloudId: c_id, cloudName: c_name, root: me.root});
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
        if(me.getView().down('#dvSqmProfiles').getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item_to_edit'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
		    var sr   =  me.getView().down('#dvSqmlProfiles').getSelectionModel().getLastSelected();
		    if(!me.rightsCheck(sr)){
	    		return;
	    	}
		    console.log("Complete Edit action"); 			  		  	  
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
        
        if(me.getView().down('#dvSqmProfiles').getSelectionModel().getCount() == 0){
            Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item_to_delete'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
        	var sr   =  me.getView().down('#dvSqmProfiles').getSelectionModel().getLastSelected();
        	
        	if(!me.rightsCheck(sr)){
	    		return;
	    	}
        	//Add delete code
        	console.log("Add Delete Action")         
        }      
    },           
    cmbSqmProfileChange: function(cmb,new_value){
    	var me = this;
    	console.log("Filter TO "+new_value);
    	me.getView().down('#dvSqmProfiles').getStore().getProxy().setExtraParams({id:new_value});
 		me.reload();
    },
    reloadComboBox: function(){  
    	var me = this;
    	me.getView().down('cmbSqmProfile').getStore().reload();
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

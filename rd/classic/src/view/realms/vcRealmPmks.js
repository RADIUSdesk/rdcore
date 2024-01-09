Ext.define('Rd.view.realms.vcRealmPmks', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcRealmPmks',
    config  : {
        urlAdd          : '/cake4/rd_cake/realm-ssids/add.json',
        urlDelete       : '/cake4/rd_cake/realm-ssids/delete.json',
		urlEdit         : '/cake4/rd_cake/realm-ssids/edit.json',
		urlView         : '/cake4/rd_cake/realm-ssids/view.json'
    },
    control: {
    	'gridRealmPmks #reload': {
            click   : 'reload'
        },
        'gridRealmPmks #add': {
          	click: 'add'
        },
        'gridRealmPmks #edit': {
         	click: 'edit'
        },       
        'gridRealmPmks #delete': {
            click   : 'del'
        },
        'winRealmSsidAdd #save' : {
            click   : 'save'
        },
        'winRealmSsidEdit #save': {
            click   : 'btnEditSave'
        },
        'gridRealmPmks cmbRealmSsids':{
            afterrender : 'reloadRealmSsids'
        }      
    },
    itemSelected: function(dv,record){
    	var me = this;  	
    },
    reloadRealmSsids : function(){
        var me = this;
        var cmb = me.getView().down('cmbRealmSsids');
        cmb.getStore().getProxy().setExtraParam('realm_id',me.getView().realm_id);
        cmb.getStore().load();
        cmb.setValue("0");
    },
    onViewActivate: function(pnl){
        var me = this;
        me.reload();   
    },
    reload: function(){
        var me = this;
        me.getView().getSelectionModel().deselectAll(true);
        me.getView().getStore().load();
    },
    add: function(button) {	
        var me      = this;   
        if(!Ext.WindowManager.get('winRealmSsidAddId')){
            var w = Ext.widget('winRealmSsidAdd',{id:'winRealmSsidAddId',realm_id: me.getView().realm_id});
            this.getView().add(w);
            let appBody = Ext.getBody();
            w.showBy(appBody);        
        }
    },
    save:  function(button){
        var me      = this;
        var win     = button.up('window');
        var form    = win.down('form');
        form.submit({
            clientValidation: true,
            url: me.getUrlAdd(),
            success: function(form, action) {
                win.close();
                me.reloadRealmSsids();
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
        if(me.getView().down('cmbRealmSsids').getValue() == 0){
             Ext.ux.Toaster.msg(
                        'Select A Specific SSID',
                        'Select a specific SSID to edit from dropdown',
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            var realm_ssid_id   = me.getView().down('cmbRealmSsids').getValue();
            var sr              = me.getView().down('cmbRealmSsids').getStore().getById(realm_ssid_id);
			if(!Ext.WindowManager.get('winRealmSsidEditd')){
	            var w = Ext.widget('winRealmSsidEdit',{id:'winRealmSsidEditId',sr:sr,realm_ssid_id: realm_ssid_id});
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
                me.reloadRealmSsids();
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
        if(me.getView().down('cmbRealmSsids').getValue() == 0){
             Ext.ux.Toaster.msg(
                        'Select A Specific SSID',
                        'Select a specific SSID to delete from dropdown',
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{         	        
        	Ext.MessageBox.confirm(i18n('sConfirm'), i18n('sAre_you_sure_you_want_to_do_that_qm'), function(val){
                if(val== 'yes'){
                    var ssid_id    = me.getView().down('cmbRealmSsids').getValue();
                    var list        = [];
                    Ext.Array.push(list,{'id' : ssid_id});
                    
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
                            me.reloadRealmSsids();
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
    }
});

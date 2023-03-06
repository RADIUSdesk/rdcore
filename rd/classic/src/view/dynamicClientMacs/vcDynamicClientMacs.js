Ext.define('Rd.view.dynamicClientMacs.vcDynamicClientMacs', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcDynamicClientMacs',
        init    : function() {
    
    },
    config: {
    	UrlDelete	: '/cake4/rd_cake/dynamic-client-macs/delete.json',
        UrlAttach	: '/cake4/rd_cake/devices/add.json',
        UrlEdit		: '/cake4/rd_cake/wifi-charts/edit-mac-alias.json'
    },
    control: {
        'gridDynamicClientMacs #reload': {
            click   : 'reload'
        },
        'gridDynamicClientMacs #attach': {
            click   : 'attach'
        },
        'gridDynamicClientMacs #edit': {
            click   : 'edit'
        },      
        'gridDynamicClientMacs #delete': {
            click   : 'del'
        },
        'winDynamicClientMacAttach #btnDataNext': {
            click: 'attachSave'
        },
        'winDynamicClientMacAlias #save': {
            click: 'editSave'
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
    attach: function(btn){
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
            if(!Ext.WindowManager.get('winDynamicClientMacAttachId')){
		        var w = Ext.widget('winDynamicClientMacAttach',{id:'winDynamicClientMacAttachId',record: sr});
		        me.getView().add(w); 
		        let appBody = Ext.getBody();
		        w.showBy(appBody);           
		    }
        }
    },
    attachSave: function(btn){
        var me 		= this;
        var form    = btn.up('form');
        var window  = form.up('window'); 
        form.submit({
            clientValidation: true,
            url             : me.getUrlAttach(),
            success         : function(form, action) {              
                //FIXME reload store....
                Ext.ux.Toaster.msg(
                    'Item Attached',
                    'Item Attached Fine',
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
			if(!Ext.WindowManager.get('winDynamicClientMacAliasId')){
                var w = Ext.widget('winDynamicClientMacAlias',{id:'winDynamicClientMacAliasId',record: sr});
                me.getView().add(w); 
                let appBody = Ext.getBody();
                w.showBy(appBody);      
            }
        }
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
                    'Item Updated',
                    'Item Updated Fine',
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

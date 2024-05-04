Ext.define('Rd.view.privatePsks.vcPrivatePsks', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcPrivatePsks',
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
    	UrlDelete	: '/cake4/rd_cake/private-psks/delete.json',
        UrlGroupAdd : '/cake4/rd_cake/private-psks/add.json',
        UrlPskAdd   : '/cake4/rd_cake/private-psks/psk-add.json',
        UrlPskEdit  : '/cake4/rd_cake/private-psks/psk-edit.json',
    },
    control: {
        'gridPrivatePsks #reload': {
            click   : 'reload'
        },
        'gridPrivatePsks #addGroup': {
            click   : 'addGroup'
        },
        'gridPrivatePsks #add': {
            click   : 'add'
        }, 
        'gridPrivatePsks #edit': {
            click   : 'edit'
        },      
        'gridPrivatePsks #delete': {
            click   : 'del'
        },
        'winPrivatePskGroupAdd #btnSave': {
            click: 'addGroupSave'
        },
        'winPrivatePskAdd #btnSave': {
            click: 'addPskSave'
        },
        'winPrivatePskEdit #btnSave': {
            click: 'editPskSave'
        },
        'gridPrivatePsks actioncolumn': { 
            itemClick  : 'onActionColumnItemClick'
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
                            me.getView().down('cmbPpskGroups').getStore().load();
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
    addGroup : function(button) {	
        var me      = this;
        var c_name 	= Rd.getApplication().getCloudName();
        var c_id	= Rd.getApplication().getCloudId()    
        if(!Ext.WindowManager.get('winPrivatePskGroupAddId')){
            var w = Ext.widget('winPrivatePskGroupAdd',{id:'winPrivatePskGroupAddId',cloudId: c_id, cloudName: c_name, root: me.root});
            this.getView().add(w);
            let appBody = Ext.getBody();
            w.showBy(appBody);        
        }
    },
    add : function(button) {	
        var me      = this;
        if(me.getView().getSelectionModel().getCount() == 0){
            Ext.ux.Toaster.msg(
                        'Select PPSK Group',
                        'First Select PPSK Group To Add New PSK',
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );          
        }else{
            var sr  = me.getView().getSelectionModel().getLastSelected(); 		
			if(!Ext.WindowManager.get('winPrivatePskAddId')){
                var w = Ext.widget('winPrivatePskAdd', {id:'winPrivatePskAdd', private_psk_id: sr.get('private_psk_id'), ppsk_name:sr.get('ppsk_name') });
                me.getView().add(w); 
                let appBody = Ext.getBody();
                w.showBy(appBody);      
            }
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
            console.log(sr.get('vlan')); 			
			if(!Ext.WindowManager.get('winPrivatePskEditId')){
                var w = Ext.widget('winPrivatePskEdit',{id:'winPrivatePskEditd',record: sr,root: me.root});
                me.getView().add(w); 
                let appBody = Ext.getBody();
                w.showBy(appBody);      
            }
        }
    },
    addGroupSave: function(btn){
        var me 		= this;
        var form    = btn.up('form');
        var window  = form.up('window'); 
        form.submit({
            clientValidation: true,
            url             : me.getUrlGroupAdd(),
            success         : function(form, action) {              
                //FIXME reload store....
                Ext.ux.Toaster.msg(
                    'Item Added',
                    'Item Added Fine',
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );               
                me.reload();
                me.getView().down('cmbPpskGroups').getStore().load();
                window.close();
            },
            failure: Ext.ux.formFail,
            scope: me
        });
    },
    addPskSave: function(btn){
        var me 		= this;
        var form    = btn.up('form');
        var window  = form.up('window'); 
        form.submit({
            clientValidation: true,
            url             : me.getUrlPskAdd(),
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
    },
    editPskSave: function(btn){
        var me 		= this;
        var form    = btn.up('form');
        var window  = form.up('window'); 
        form.submit({
            clientValidation: true,
            url             : me.getUrlPskEdit(),
            success         : function(form, action) {              
                //FIXME reload store....
                Ext.ux.Toaster.msg(
                    'Item Updated',
                    'Item Updated Fine',
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );               
                me.reload();
                me.getView().down('cmbPpskGroups').getStore().load();
                window.close();
            },
            failure: Ext.ux.formFail,
            scope: me
        });
    },
    onActionColumnItemClick: function(view, rowIndex, colIndex, item, e, record, row, action){
        var me = this;
        var grid = view.up('grid');
        grid.setSelection(record);
        if(action == 'update'){
            me.edit(); 
        }
        if(action == 'delete'){
            me.del(); 
        }
    }
});

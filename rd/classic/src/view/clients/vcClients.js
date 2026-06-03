Ext.define('Rd.view.clients.vcClients', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcClients',
    init    : function() {
    
    },
    config: {
        attachItem  : 'ap', // 'node' or 'permanent_user' 
        urlAdd      : '/cake4/rd_cake/clients/add.json',
        urlEdit     : '/cake4/rd_cake/clients/edit.json',
        urlDelete   : '/cake4/rd_cake/clients/delete.json',
        urlChangePassword:'/cake4/rd_cake/clients/change-password.json',
        urlClientApsView :'/cake4/rd_cake/clients/client-aps-view.json',
        urlClientApsEdit :'/cake4/rd_cake/clients/client-aps-edit.json',
        urlClientNodesView :'/cake4/rd_cake/clients/client-nodes-view.json',
        urlClientNodesEdit :'/cake4/rd_cake/clients/client-nodes-edit.json',
        urlClientPuView :'/cake4/rd_cake/clients/client-permanent-users-view.json',
        urlClientPuEdit :'/cake4/rd_cake/clients/client-permanent-users-edit.json'

    },
    control: {
        'gridClients #reload': {
            click   : 'reload'
        },
        'gridClients #reload menuitem[group=refresh]'   : {
            click   : 'reloadOptionClick'
        }, 
        'gridClients #add': {
            click   : 'add'
        },     
        'gridClients #delete': {
            click   : 'del'
        },
        'gridClients #edit': {
            click   : 'edit'
        },
        'gridClients #password'  : {
            click:      'changePassword'
        },
        'gridClients #attach': {
            click   : 'attach'
        },
        'gridClients #attach menuitem[group=attach]'   : {
            click   : 'attachOptionClick'
        },
        'gridClients'   : {
            menuItemClick   : 'onActionColumnMenuItemClick' 
        },
        'winClientAdd #save' : {
            click   : 'addSave'
        },
        'winClientEdit #save' : {
            click   : 'editSave'
        },
        'winClientAttachAp': {
            beforeshow  :  'loadClientAttachAp'
        },
        'winClientAttachAp #save': {
            click   : 'attachApSave'
        },
        
        'winClientAttachNode': {
            beforeshow  :  'loadClientAttachNode'
        },
        'winClientAttachNode #save': {
            click   : 'attachNodeSave'
        },
        
        'winClientAttachPermanentUser': {
            beforeshow  :  'loadClientAttachPu'
        },
        'winClientAttachPermanentUser #save': {
            click   : 'attachPuSave'
        },
        
        'winClientPassword #save': {
            click: 'changePasswordSubmit'
        },
        'gridClients actioncolumn': { 
             itemClick  : 'onActionColumnItemClick'
        }
    },
    reload: function(){
        var me      = this;
        me.getView().getStore().load();
    },
    reloadOptionClick: function(menu_item){
        var me      = this;
        var n       = menu_item.getItemId();
        var b       = menu_item.up('button'); 
        var interval= 30000; //default
        clearInterval(me.autoReload);   //Always clear
        b.setGlyph(Rd.config.icnTime);

        if(n == 'mnuRefreshCancel'){
            b.setGlyph(Rd.config.icnReload);
            return;
        }
        
        if(n == 'mnuRefresh1m'){
           interval = 60000
        }

        if(n == 'mnuRefresh5m'){
           interval = 360000
        }
        me.autoReload = setInterval(function(){        
            me.reload();
        },  interval);  
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
                        var id = item.getId();
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
    edit: function(button){
        var me      = this;   
        //Find out if there was something selected
        var selCount = me.getView().getSelectionModel().getCount();
        if(selCount == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            if(selCount > 1){
                Ext.ux.Toaster.msg(
                        i18n('sLimit_the_selection'),
                        i18n('sSelection_limited_to_one'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
                );
            }else{
                var sr          = me.getView().getSelectionModel().getLastSelected();
                if(!Ext.WindowManager.get('winClientEditId')){
                    var w = Ext.widget('winClientEdit',{id:'winClientEditId',sr:sr});
                    me.getView().add(w); 
                    let appBody = Ext.getBody();
                    w.showBy(appBody);           
                }  
            }
        }
    },
    add: function(btn){
    	var me = this;
    	if(!Ext.WindowManager.get('winClientAddId')){
            var w = Ext.widget('winClientAdd',{id:'winClientAddId'});
            me.getView().add(w); 
            let appBody = Ext.getBody();
            w.showBy(appBody);           
        }  
    },
    addSave :  function(button){
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
    editSave :  function(button){
        var me      = this;
        var win     = button.up('window');
        var form    = win.down('form');
        form.submit({
            clientValidation: true,
            url: me.getUrlEdit(),
            success: function(form, action) {
                win.close();
                me.reload();
                Ext.ux.Toaster.msg(
                    'Item Updated',
                    'Item Updated Fine',
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },
            failure: Ext.ux.formFail
        });
    },
    onViewActivate: function(pnl){
        var me = this;
        me.reload();   
    },
    onActionColumnItemClick: function(view, rowIndex, colIndex, item, e, record, row, action){
        //console.log("Action Item "+action+" Clicked");
        var me = this;
        var grid = view.up('grid');
        grid.setSelection(record);
        if(action == 'delete'){
            me.del();
        }
        if(action == 'edit'){
            me.edit();
        }   
    },
    onActionColumnMenuItemClick: function(grid,action){
        var me = this;
        me.getView().setSelection(grid.selRecord);
        if(action == 'password'){
            me.changePassword();
        }       
        if(action == 'ap'){
            me.setAttachItem('ap')
            me.attach();
        }
        if(action == 'node'){
            me.setAttachItem('node')
            me.attach();
        }
        if(action == 'permanent_user'){
            me.setAttachItem('permanent_user')
            me.attach();
        }
    },    
    attachOptionClick : function(menu_item){
        var me      = this;
        var n       = menu_item.getItemId();
        var b       = menu_item.up('button');
        if(n == 'ap'){
            me.setAttachItem('ap');
        }        
        if(n == 'node'){
           me.setAttachItem('node');
        }
        if(n == 'permanent_user'){
           me.setAttachItem('permanent_user');
        }  
    },
    attach : function(button){  
        var me      = this;   
        //Find out if there was something selected
        var selCount = me.getView().getSelectionModel().getCount();
        if(selCount == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            if(selCount > 1){
                Ext.ux.Toaster.msg(
                        i18n('sLimit_the_selection'),
                        i18n('sSelection_limited_to_one'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
                );
            }else{
                var sr      = me.getView().getSelectionModel().getLastSelected();  
                var c_name 	= Ext.getApplication().getCloudName();
                var c_id	= Ext.getApplication().getCloudId();             
                if(me.getAttachItem() === 'ap'){
                   
                    if(!Ext.WindowManager.get('winClientAttachApId')){
                        var w = Ext.widget('winClientAttachAp',{
                            id          :'winClientAttachApId',
                            sr          :sr,
                            clientId    :sr.getId(),
                            cloudName   : c_name
                        });
                        me.getView().add(w); 
                        let appBody = Ext.getBody();
                        w.showBy(appBody);           
                    }
                }
                if(me.getAttachItem() === 'node'){                   
                    if(!Ext.WindowManager.get('winClientAttachNodeId')){
                        var w = Ext.widget('winClientAttachNode',{
                            id          :'winClientAttachNodeId',
                            sr          :sr,
                            clientId    :sr.getId(),
                            cloudName   : c_name
                        });
                        me.getView().add(w); 
                        let appBody = Ext.getBody();
                        w.showBy(appBody);           
                    }
                }                
                if(me.getAttachItem() === 'permanent_user'){                   
                    if(!Ext.WindowManager.get('winClientAttachPermanentUserId')){
                        var w = Ext.widget('winClientAttachPermanentUser',{
                            id          :'winClientAttachPermanentUserId',
                            sr          :sr,
                            clientId    :sr.getId(),
                            cloudName   : c_name
                        });
                        me.getView().add(w); 
                        let appBody = Ext.getBody();
                        w.showBy(appBody);           
                    }
                } 
            }
        }
    },
    changePassword: function(){
        var me = this;
         //Find out if there was something selected
        var sel_count = me.getView().getSelectionModel().getCount();
        if(sel_count == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            if(sel_count > 1){
                Ext.ux.Toaster.msg(
                        i18n('sLimit_the_selection'),
                        i18n('sSelection_limited_to_one'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
                );
            }else{

                //Determine the selected record:
                var sr = me.getView().getSelectionModel().getLastSelected(); 
                if(!Ext.WindowManager.get('winClientPassword'+sr.getId())){
                    var w = Ext.widget('winClientPassword',
                        {
                            id          : 'winClientPassword'+sr.getId(),
                            clientId    : sr.getId(),
                            username    : sr.get('username'),
                            title       : i18n('sChange_password_for')+' '+sr.get('username')
                        });
                    me.getView().add(w); 
                    let appBody = Ext.getBody();
                    w.showBy(appBody);    
                }
            }    
        }
    },
    changePasswordSubmit: function(button){
        var me      = this;
        var win     = button.up('window');
        var form    = win.down('form');
                
        //Checks passed fine...      
        form.submit({
            clientValidation    : true,
            url                 : me.getUrlChangePassword(),
            success             : function(form, action) {
                win.close();
                me.reload();
                Ext.ux.Toaster.msg(
                    i18n('sPassword_changed'),
                    i18n('sPassword_changed_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },
            failure             : Ext.ux.formFail
        });
    },
    loadClientAttachAp : function(win){
        var me      = this;       
        var form    = win.down('form');
        var clientId= win.clientId;
        form.setLoading(true);
        form.load({
            url         :me.getUrlClientApsView(), 
            method      :'GET',
            params      :{id:clientId},
            success     : function(a,b,c){
                form.setLoading(false);
            }
        })
    },
    attachApSave : function(button){
        var me      = this;
        var win     = button.up('window');
        var form    = win.down('form');     
        form.submit({
            clientValidation    : true,
            url                 : me.getUrlClientApsEdit(),
            success             : function(form, action) {
                win.close();
                me.reload();
                Ext.ux.Toaster.msg(
                    'APs Attached Fine',
                    'APs Attached Fine',
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },
            failure             : Ext.ux.formFail
        });   
    },
    loadClientAttachNode : function(win){
        var me      = this;       
        var form    = win.down('form');
        var clientId= win.clientId;
        form.setLoading(true);
        form.load({
            url         :me.getUrlClientNodesView(), 
            method      :'GET',
            params      :{id:clientId},
            success     : function(a,b,c){
                form.setLoading(false);
            }
        })
    },
    attachNodeSave : function(button){
        var me      = this;
        var win     = button.up('window');
        var form    = win.down('form');     
        form.submit({
            clientValidation    : true,
            url                 : me.getUrlClientNodesEdit(),
            success             : function(form, action) {
                win.close();
                me.reload();
                Ext.ux.Toaster.msg(
                    'Nodes Attached Fine',
                    'Nodes Attached Fine',
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },
            failure             : Ext.ux.formFail
        });   
    },
    loadClientAttachPu : function(win){
        var me      = this;       
        var form    = win.down('form');
        var clientId= win.clientId;
        form.setLoading(true);
        form.load({
            url         :me.getUrlClientPuView(), 
            method      :'GET',
            params      :{id:clientId},
            success     : function(a,b,c){
                form.setLoading(false);
            }
        })
    },
    attachPuSave : function(button){
        var me      = this;
        var win     = button.up('window');
        var form    = win.down('form');     
        form.submit({
            clientValidation    : true,
            url                 : me.getUrlClientPuEdit(),
            success             : function(form, action) {
                win.close();
                me.reload();
                Ext.ux.Toaster.msg(
                    'Permanent Users Attached Fine',
                    'Permanent Users Attached Fine',
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },
            failure             : Ext.ux.formFail
        });   
    }
    
});

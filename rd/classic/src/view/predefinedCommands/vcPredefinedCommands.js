Ext.define('Rd.view.predefinedCommands.vcPredefinedCommands', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcPredefinedCommands',
    init    : function() {
    
    },
    config: {
        urlApChildCheck : '/cake3/rd_cake/access-providers/child-check.json',
        urlAdd          : '/cake3/rd_cake/predefined-commands/add.json',
        urlDelete       : '/cake3/rd_cake/predefined-commands/delete.json',
		urlEdit         : '/cake3/rd_cake/predefined-commands/edit.json',
    },
    control: {
        'gridPredefinedCommands #reload': {
            click   : 'reload'
        },
        'gridPredefinedCommands #add': {
             click: 'add'
        },
        'gridPredefinedCommands #edit': {
            click: 'edit'
        },       
        'gridPredefinedCommands #delete': {
            click   : 'del'
        },
        'gridPredefinedCommands actioncolumn' : {
             itemClick  : 'onColumnItemClick'
        },
        'winPredefinedCommandsAddWizard #btnTreeNext' : {
            click   : 'btnTreeNext'
        },
        'winPredefinedCommandsAddWizard #btnDataPrev' : {
            click   : 'btnDataPrev'
        },
        'winPredefinedCommandsAddWizard #btnDataNext' : {
            click   : 'btnDataNext'
        },
        'winPredefinedCommandEdit #save': {
            click   : 'btnEditSave'
        }
    },
    reload: function(){
        var me      = this;
        me.getView().getSelectionModel().deselectAll(true);
        me.getView().getStore().load();
    },
    add: function(button){      
        var me = this;
        Ext.Ajax.request({
            url: me.getUrlApChildCheck(),
            method: 'GET',
            success: function(response){
                var jsonData    = Ext.JSON.decode(response.responseText);
                if(jsonData.success){
                        
                    if(jsonData.items.tree == true){
                        if(!Ext.WindowManager.get('winPredefinedCommandsAddWizardId')){
                            var w = Ext.widget('winPredefinedCommandsAddWizard',{id:'winPredefinedCommandsAddWizardId'});
                            me.getView().add(w);
                            let appBody = Ext.getBody();
                            w.showBy(appBody);       
                        }
                    }else{
                        if(!Ext.WindowManager.get('winPredefinedCommandsAddWizardId')){
                            var w = Ext.widget('winPredefinedCommandsAddWizard',
                                {id:'winPredefinedCommandsAddWizardId',startScreen: 'scrnData',user_id:'0',owner: i18n('sLogged_in_user'), no_tree: true}
                            );
                            me.getView().add(w);
                            let appBody = Ext.getBody();
                            w.showBy(appBody);         
                        }
                    }
                }   
            },
            scope: me
        });
    },
    btnTreeNext: function(button){
        var me = this;
        var tree = button.up('treepanel');
        //Get selection:
        var sr = tree.getSelectionModel().getLastSelected();
        if(sr){    
            var win = button.up('window');
            win.down('#owner').setValue(sr.get('username'));
            win.down('#user_id').setValue(sr.getId());
            win.getLayout().setActiveItem('scrnData');
        }else{
            Ext.ux.Toaster.msg(
                        i18n('sSelect_an_owner'),
                        i18n('sFirst_select_an_Access_Provider_who_will_be_the_owner'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }
    },
    btnDataPrev:  function(button){
        var me      = this;
        var win     = button.up('window');
        win.getLayout().setActiveItem('scrnApTree');
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
                me.getView().getStore().load();
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
    edit: function() {
        var me      = this;
        //Find out if there was something selected
        if(me.getView().getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item_to_edit'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
		    var sr   =  me.getView().getSelectionModel().getLastSelected();
		    if(!Ext.WindowManager.get('winPredefinedCommandEditId')){
                var w = Ext.widget('winPredefinedCommandEdit',{id:'winPredefinedCommandEditId',record: sr, predefined_command_id: sr.getId()});
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
                        failure: function(batch,options){
                            console.log("Could not delete!");
                            me.reload(); //Reload from server
                        }
                    });
                }
            });
        }
    },
    onColumnItemClick: function(view, rowIndex, colIndex, item, e, record, row, action){
        //console.log("Action Item "+action+" Clicked");
        var me = this;
        me.getView().setSelection(record);
        if(action == 'edit'){
            me.edit()
        }
        if(action == 'delete'){
            me.del();
        }     
    }
});

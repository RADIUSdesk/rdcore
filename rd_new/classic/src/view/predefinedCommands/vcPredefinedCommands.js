Ext.define('Rd.view.predefinedCommands.vcPredefinedCommands', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcPredefinedCommands',
    init    : function() {
    
    },
    config: {
        urlAdd          : '/cake4/rd_cake/predefined-commands/add.json',
        urlDelete       : '/cake4/rd_cake/predefined-commands/delete.json',
		urlEdit         : '/cake4/rd_cake/predefined-commands/edit.json',
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
        'winPredefinedCommandsAdd #btnDataNext' : {
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
        var c_name 	= Rd.getApplication().getCloudName();
        var c_id	= Rd.getApplication().getCloudId()
             
        if(!Ext.WindowManager.get('winPredefinedCommandsAddId')){
            var w = Ext.widget('winPredefinedCommandsAdd',{id:'winPredefinedCommandsAddId',cloudId: c_id, cloudName: c_name});
            me.getView().add(w);
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

Ext.define('Rd.view.hardwareOwners.vcGridHardwareOwners', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcGridHardwareOwners',
    config : {
        urlApChildCheck     : '/cake3/rd_cake/access-providers/child-check.json',
        urlAdd              : '/cake3/rd_cake/hardware-owners/add.json',
        urlDelete           : '/cake3/rd_cake/hardware-owners/delete.json'
    },
    control: {
        'gridHardwareOwners' :{
            activate : 'gridActivate'
        },
        '#reload'   : {
            click:  'reload'
        },
        '#add'   : {
            click:  'add'
        },
        '#delete'   : {
            click:  'del'
        },
        'winHardwareOwnerAddWizard #btnTreeNext' : {
            click:  'btnTreeNext'
        },
        'winHardwareOwnerAddWizard #btnDataPrev' : {
            click:  'btnDataPrev'
        },
        'winHardwareOwnerAddWizard #btnDataNext' : {
            click:  'btnDataNext'
        },
        'winHardwareOwnerDelete #hwDelete' : {
            click: 'btnHardwareDelete'
        }
    },
    init: function() {
        var me = this;
    },
    reload: function(b){
        var me = this;
        me.getView().getStore().load();
    },
	gridActivate: function(g){
        var me = this;
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
                    var store = me.getView().getStore();    
                    if(jsonData.items.tree == true){
                        if(!Ext.WindowManager.get('winHardwareOwnerAddWizardId')){
                            var w = Ext.widget('winHardwareOwnerAddWizard',{id:'winHardwareOwnerAddWizardId', store: store});
                            w.show();         
                        }
                    }else{
                        if(!Ext.WindowManager.get('winHardwareOwnerAddWizardId')){
                        
                            var w = Ext.widget('winHardwareOwnerAddWizard',
                                {
                                    id          :'winHardwareOwnerAddWizardId',
                                    startScreen : 'scrnData',
                                    user_id     :'0',
                                    owner       : i18n('sLogged_in_user'),
                                    no_tree     : true,
                                    store       : store 
                                }
                            );
                            w.show();         
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
        var chkMultiple = win.down('#chkMultiple');
        //win.setLoading("Please Wait...."); //Mask it
        form.submit({
            clientValidation: true,
            url: me.getUrlAdd(),
            success: function(form, action) {
                win.store.load();
                win.setLoading(false); //Mask it
                if(!chkMultiple.getValue()){
                    win.close();
                }
                Ext.ux.Toaster.msg(
                    i18n('sNew_item_created'),
                    i18n('sItem_created_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },
            failure: function(form,action){
                win.setLoading(false); //Mask it
                Ext.ux.formFail(form,action)
            }
        });
    },
    del: function(button){
        var me      = this;
        var grid    = button.up('grid')
        //Find out if there was something selected
        if(grid.getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item_to_delete'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            var selected    = grid.getSelectionModel().getSelection();
            var list        = [];
            Ext.Array.forEach(selected,function(item){
                var id = item.getId();
                Ext.Array.push(list,{'id' : id});
            });
            if(!Ext.WindowManager.get('winHardwareOwnerDeleteId')){
                var w = Ext.widget('winHardwareOwnerDelete',
                    {
                        id          :'winHardwareOwnerDeleteId',
                        list        : list,
                        store       : grid.getStore()
                    }
                );
                w.show();         
            }
        }
    },
    btnHardwareDelete: function(button){
        var me = this;
        var win = button.up('window');
        Ext.Ajax.request({
            url: me.getUrlDelete(),
            method: 'POST',          
            jsonData: win.list,
            success: function(batch,options){
                Ext.ux.Toaster.msg(
                    'Delete Action',
                    'Completed Fine....',
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
                win.store.reload(); //Reload from server
                win.close();
            },                                    
            failure: function(batch,options){
                Ext.ux.Toaster.msg(
                    i18n('sProblems_deleting_item'),
                    batch.proxy.getReader().rawData.message.message,
                    Ext.ux.Constants.clsWarn,
                    Ext.ux.Constants.msgWarn
                );
                win.store.reload(); //Reload from server
                win.close();
            }
        });   
    }
});

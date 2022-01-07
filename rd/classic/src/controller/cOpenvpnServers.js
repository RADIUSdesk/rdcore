Ext.define('Rd.controller.cOpenvpnServers', {
    extend: 'Ext.app.Controller',
    actionIndex: function(pnl){

        var me = this;
        
        if (me.populated) {
            return; 
        }     
        pnl.add({
            xtype   : 'gridOpenvpnServers',
            border  : false,
            itemId  : 'tabOpenvpnServers',
            plain   : true,
            padding : Rd.config.gridPadding 
        });
        me.populated = true;
    },

    views:  [
        'openvpnServers.gridOpenvpnServers',           
        'openvpnServers.winOpenvpnServerEdit', 		'openvpnServers.winOpenvpnServerAddWizard'
    ],
    stores: ['sAccessProvidersTree','sOpenvpnServers'],
    models: ['mAccessProviderTree',  'mOpenvpnServer'],
    selectedRecord: null,
    config: {
        urlApChildCheck : '/cake3/rd_cake/access-providers/child-check.json',
        urlExportCsv    : '/cake3/rd_cake/openvpn-servers/export_csv',
        urlAdd          : '/cake3/rd_cake/openvpn-servers/add.json',
        urlDelete       : '/cake3/rd_cake/openvpn-servers/delete.json',
		urlEdit         : '/cake3/rd_cake/openvpn-servers/edit.json'
    },
    refs: [
        {  ref: 'grid',  selector: 'gridOpenvpnServers'}       
    ],
    init: function() {
        var me = this;
        if (me.inited) {
            return;
        }
        me.inited = true;
        me.control({
            '#tabOpenvpnServers' : {
                destroy   :      me.appClose   
            },
            'gridOpenvpnServers #reload': {
                click:      me.reload
            }, 
            'gridOpenvpnServers #add'   : {
                click:      me.add
            },
            'gridOpenvpnServers #delete'	: {
                click:      me.del
            },
            'gridOpenvpnServers #edit'   : {
                click:      me.edit
            },
            'gridOpenvpnServers'   		: {
                select:      me.select
            },
			'winOpenvpnServerAddWizard #btnTreeNext' : {
                click:  me.btnTreeNext
            },
            'winOpenvpnServerAddWizard #btnDataPrev' : {
                click:  me.btnDataPrev
            },
            'winOpenvpnServerAddWizard #btnDataNext' : {
                click:  me.btnDataNext
            },
			'winOpenvpnServerEdit #save': {
                click: me.btnEditSave
            }
        });
    },
    appClose:   function(){
        var me          = this;
        me.populated    = false;
    },
	reload: function(){
        var me =this;
        me.getGrid().getSelectionModel().deselectAll(true);
        me.getGrid().getStore().load();
    },
    add: function(button){
        
        var me = this;
        //We need to do a check to determine if this user (be it admin or acess provider has the ability to add to children)
        //admin/root will always have, an AP must be checked if it is the parent to some sub-providers. If not we will 
        //simply show the nas connection typer selection 
        //if it does have, we will show the tree to select an access provider.
        Ext.Ajax.request({
            url: me.getUrlApChildCheck(),
            method: 'GET',
            success: function(response){
                var jsonData    = Ext.JSON.decode(response.responseText);
                if(jsonData.success){
                        
                    if(jsonData.items.tree == true){
                        if(!Ext.WindowManager.get('winOpenvpnServerAddWizardId')){
                            var w = Ext.widget('winOpenvpnServerAddWizard',{id:'winOpenvpnServerAddWizardId'});
                            w.show();        
                        }
                    }else{
                        if(!Ext.WindowManager.get('winOpenvpnServerAddWizardId')){
                            var w = Ext.widget('winOpenvpnServerAddWizard',
                                {id:'winOpenvpnServerAddWizardId',startScreen: 'scrnData',user_id:'0',owner: i18n('sLogged_in_user'), no_tree: true}
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
            var win = button.up('winOpenvpnServerAddWizard');
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
        var win     = button.up('winOpenvpnServerAddWizard');
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
                me.getStore('sOpenvpnServers').load();
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
    select: function(grid,record){
        var me = this;
        //Adjust the Edit and Delete buttons accordingly...

        //Dynamically update the top toolbar
        tb = me.getGrid().down('toolbar[dock=top]');

        var edit = record.get('update');
        if(edit == true){
            if(tb.down('#edit') != null){
                tb.down('#edit').setDisabled(false);
            }
        }else{
            if(tb.down('#edit') != null){
                tb.down('#edit').setDisabled(true);
            }
        }

        var del = record.get('delete');
        if(del == true){
            if(tb.down('#delete') != null){
                tb.down('#delete').setDisabled(false);
            }
        }else{
            if(tb.down('#delete') != null){
                tb.down('#delete').setDisabled(true);
            }
        }
    },
    del:   function(){
        var me      = this;     
        //Find out if there was something selected
        if(me.getGrid().getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item_to_delete'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            Ext.MessageBox.confirm(i18n('sConfirm'), i18n('sAre_you_sure_you_want_to_do_that_qm'), function(val){
                if(val== 'yes'){
                    var selected    = me.getGrid().getSelectionModel().getSelection();
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
        }
    },
    edit: function(button){
        var me      = this;
        var grid    = button.up('grid');
        //Find out if there was something selected
        if(grid.getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item_to_edit'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
			var sr      =  me.getGrid().getSelectionModel().getLastSelected();
			if(!Ext.WindowManager.get('winOpenvpnServerEditId')){
                var w = Ext.widget('winOpenvpnServerEdit',{id:'winOpenvpnServerEditId',record: sr});
                w.show();      
            }    
        }
    },
	btnEditSave:  function(button){
        var me      = this;
        var win     = button.up("winOpenvpnServerEdit");
        var form    = win.down('form');
        form.submit({
            clientValidation: true,
            url: me.getUrlEdit(),
            success: function(form, action) {
                win.close();
                me.reload(); //Reload from server
                Ext.ux.Toaster.msg(
                    i18n('sItem_updated'),
                    i18n('sItem_updated_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },
            failure: Ext.ux.formFail
        });
    },
    onStoreOpenvpnServersLoaded: function() {
        var me      = this;
        var count   = me.getStore('sOpenvpnServers').getTotalCount();
        me.getGrid().down('#count').update({count: count});
    }
});

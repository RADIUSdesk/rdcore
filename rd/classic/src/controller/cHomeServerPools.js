Ext.define('Rd.controller.cHomeServerPools', {
    extend: 'Ext.app.Controller',
    actionIndex: function(pnl){

        var me = this;
        
        if (me.populated) {
            return; 
        }
        
        pnl.add({
            xtype   : 'gridHomeServerPools',
            padding : Rd.config.gridPadding,
            border  : false,
            plain	: true
        });      
        pnl.on({activate : me.gridActivate,scope: me});      
        me.populated = true;     
       
        me.populated = true;
    },

    views:  [
        'homeServerPools.gridHomeServerPools',           
        'homeServerPools.winHomeServerPoolAddWizard',
        'homeServerPools.pnlHomeServerPoolAddEdit',        
        'homeServerPools.pnlHomeServer'
    ],
    stores: ['sAccessProvidersTree','sHomeServerPools'],
    models: ['mAccessProviderTree',  'mHomeServerPool'],
    selectedRecord: null,
    config: {
        urlApChildCheck : '/cake3/rd_cake/access-providers/child-check.json',
        urlAdd          : '/cake3/rd_cake/home-server-pools/add.json',
        urlDelete       : '/cake3/rd_cake/home-server-pools/delete.json',
		urlEdit         : '/cake3/rd_cake/home-server-pools/edit.json',
		urlView         : '/cake3/rd_cake/home-server-pools/view.json'
    },
    refs: [
        {  ref: 'grid',  selector: 'gridHomeServerPools'}       
    ],
    init: function() {
        var me = this;
        if (me.inited) {
            return;
        }
        me.inited = true;
        me.control({
            'gridHomeServerPools #reload': {
                click:      me.reload
            }, 
            'gridHomeServerPools #add'   : {
                click:      me.add
            },
            'gridHomeServerPools #delete'	: {
                click:      me.del
            },
            'gridHomeServerPools #edit'   : {
                click:      me.edit
            },
            'gridHomeServerPools'   : {
                select:      me.select
            },
			'winHomeServerPoolAddWizard #btnTreeNext' : {
                click:  me.btnTreeNext
            },
            'winHomeServerPoolAddWizard #btnDataPrev' : {
                click:  me.btnDataPrev
            },
            'winHomeServerPoolAddWizard #btnDataNext' : {
                click:  me.btnDataNext
            },
			'pnlHomeServerPoolAddEdit #save': {
                click: me.btnEditSave
            }
        });
    },
    
    gridActivate: function(p){     
        var g = p.down('grid');
        g.getStore().load();
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
                        if(!Ext.WindowManager.get('winHomeServerPoolAddWizardId')){
                            var w = Ext.widget('winHomeServerPoolAddWizard',{id:'winHomeServerPoolAddWizardId'});
                            w.show();        
                        }
                    }else{
                        if(!Ext.WindowManager.get('winHomeServerPoolAddWizardId')){
                            var w = Ext.widget('winHomeServerPoolAddWizard',
                                {id:'winHomeServerPoolAddWizardId',startScreen: 'scrnData',user_id:'0',owner: i18n('sLogged_in_user'), no_tree: true}
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
            var win = button.up('winHomeServerPoolAddWizard');
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
        var win     = button.up('winHomeServerPoolAddWizard');
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
                me.getStore('sHomeServerPools').load();
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
            if(tb.down('#photo') != null){
                tb.down('#photo').setDisabled(false);
            }                     
        }else{
            if(tb.down('#edit') != null){
                tb.down('#edit').setDisabled(true);
            }
            if(tb.down('#photo') != null){
                tb.down('#photo').setDisabled(true);
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
                            console.log("Could not delete!");
                            me.reload(); //Reload from server
                        }
                    });
                }
            });
        }
    },
    edit:   function(){
        var me = this;
        //See if there are anything selected... if not, inform the user
        var sel_count = me.getGrid().getSelectionModel().getCount();
        if(sel_count == 0){
            Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            var selected    =  me.getGrid().getSelectionModel().getSelection();
            var count       = selected.length;         
            Ext.each(me.getGrid().getSelectionModel().getSelection(), function(sr,index){
                //Check if the node is not already open; else open the node:
                var tp          = me.getGrid().up('tabpanel');
                var hsp_id      = sr.getId();
                var hsp_tab_id  = 'hspTab_'+hsp_id;
                var nt          = tp.down('#'+hsp_tab_id);
                if(nt){
                    tp.setActiveTab(hsp_tab_id); //Set focus on  Tab
                    return;
                }

                var hsp_tab_name = sr.get('name');
                //Tab not there - add one
                tp.add({ 
                    title       : hsp_tab_name,
                    itemId      : hsp_tab_id,
                    closable    : true,
                    glyph       : Rd.config.icnEdit,
                    layout      : 'fit', 
                    items       : {'xtype' : 'pnlHomeServerPoolAddEdit',hsp_id: hsp_id, hsp_name: hsp_tab_name, record: sr}
                });
                tp.setActiveTab(hsp_tab_id); //Set focus on Add Tab*/
            });
        }
    },
	btnEditSave:  function(button){
        var me      = this;
        var form    = button.up("pnlHomeServerPoolAddEdit");
        var tab     = form.up('panel');
        
        form.submit({
            clientValidation: true,
            url: me.getUrlEdit(),
            success: function(form, action) {
                tab.close();
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
    }
});

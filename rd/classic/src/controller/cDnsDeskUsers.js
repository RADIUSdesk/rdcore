Ext.define('Rd.controller.cDnsDeskUsers', {
    extend: 'Ext.app.Controller',   
    actionIndex: function(operator_id,name){
        var me      = this;   
        var id		= 'dnsTabUsers_'+ operator_id;
        var tabDnsDeskOperators = me.getTabDnsDeskOperators();
        var newTab  = tabDnsDeskOperators.items.findBy(
            function (tab){
                return tab.getItemId() === id;
            });
         
        if (!newTab){
            newTab = tabDnsDeskOperators.add({
                glyph   : Rd.config.icnUser,
                title   : 'Users For '+name,
                closable: true,
                layout  : 'fit',
                xtype   : 'gridUsers',
                itemId  : id,
                border  : false,
                operatorId : operator_id,
                operatorName : name
            });
        }    
        tabDnsDeskOperators.setActiveTab(newTab);
    },
    
    views:  [
        'dnsDeskUsers.gridUsers',
        'dnsDeskUsers.winUserEdit', 		
        'dnsDeskUsers.winUserAdd'
    ],
    stores: ['sDnsDeskUsers' ],
    models: ['mDnsDeskUser'],
    selectedRecord: null,
    config: {
        urlAdd          : '/cake3/rd_cake/dns-desk-users/add.json',
        urlDelete       : '/cake3/rd_cake/dns-desk-users/delete.json',
		urlEdit         : '/cake3/rd_cake/dns-desk-users/edit.json'
    },
    refs: [
        {  ref: 'grid',  selector: 'gridUsers'},
        {  ref: 'tabDnsDeskOperators',        selector: '#tabDnsDeskOperators'}       
    ],
    init: function() {
        var me = this;
        
        if (me.inited) {
            return;
        }
        me.inited = true;
        
        me.control({
            '#tabDnsDeskUsers'    : {
                destroy : me.appClose
            },
            'gridUsers #reload' : {
                click   : me.reload
            }, 
            'gridUsers #add'    : {
                click   : me.add
            },
            'gridUsers #delete' : {
                click   : me.del
            },
            'gridUsers #edit'   : {
                click   : me.edit
            },
            'winUserAdd #btnDataNext' : {
                click   : me.btnDataNext
            },
			'winUserEdit #save': {
                click   : me.btnEditSave
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
        if(!Ext.WindowManager.get('winUserAddId')){
            var w = Ext.widget('winUserAdd',
                {id:'winUserAddId',startScreen: 'scrnData'}
            );
            w.show();         
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
                me.getStore('sDnsDeskUsers').load();
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
			if(!Ext.WindowManager.get('winUserEditId')){
                var w = Ext.widget('winUserEdit',{id:'winUserEditId',record: sr});
                w.show();       
            }    
        }
    },
	btnEditSave:  function(button){
        var me      = this;
        var win     = button.up("winUserEdit");
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
    }
});

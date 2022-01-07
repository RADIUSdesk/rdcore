Ext.define('Rd.controller.cDnsDeskOperators', {
    extend: 'Ext.app.Controller',
    actionIndex: function(pnl){
        var me      = this; 
        if (me.populated) {
            return; 
        }
        pnl.add({
            xtype   : 'tabpanel',
            border  : false,
            plain   : true,
            itemId  : 'tabDnsDeskOperators',
            cls     : 'subSubTab', //Make darker -> Maybe grey
            items   : [{ 'title' : i18n('sHome'), xtype :'gridOperators','glyph': Rd.config.icnHome}]
        });   
        me.populated = true;
    },

    views:  [
        'dnsDeskOperators.gridOperators',
        'dnsDeskOperators.winOperatorEdit', 		
        'dnsDeskOperators.winOperatorAdd'
    ],
    stores: ['sDnsDeskOperators' ],
    models: ['mDnsDeskOperator'],
    selectedRecord: null,
    config: {
        urlAdd          : '/cake3/rd_cake/dns-desk-operators/add.json',
        urlDelete       : '/cake3/rd_cake/dns-desk-operators/delete.json',
		urlEdit         : '/cake3/rd_cake/dns-desk-operators/edit.json'
    },
    refs: [
        {  ref: 'grid',  selector: 'gridOperators'}       
    ],
    init: function() {
        var me = this;
        
        if (me.inited) {
            return;
        }
        me.inited = true;
        
        me.control({
            '#tabDnsDeskOperators'    : {
                destroy : me.appClose
            },
            'gridOperators #reload' : {
                click   : me.reload
            }, 
            'gridOperators #add'    : {
                click   : me.add
            },
            'gridOperators #delete' : {
                click   : me.del
            },
            'gridOperators #edit'   : {
                click   : me.edit
            },
            'winOperatorAdd #btnDataNext' : {
                click   : me.btnDataNext
            },
			'winOperatorEdit #save': {
                click   : me.btnEditSave
            },
            'gridOperators #btnPolicies'  : {
                click   : me.editPolicies
            },
            'gridOperators #btnUsers'  : {
                click   : me.editUsers
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
        if(!Ext.WindowManager.get('winOperatorAddId')){
            var w = Ext.widget('winOperatorAdd',
                {id:'winOperatorAddId',startScreen: 'scrnData'}
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
                me.getStore('sDnsDeskOperators').load();
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
			if(!Ext.WindowManager.get('winOperatorEditId')){
                var w = Ext.widget('winOperatorEdit',{id:'winOperatorEditId',record: sr});
                w.show();       
            }    
        }
    },
	btnEditSave:  function(button){
        var me      = this;
        var win     = button.up("winOperatorEdit");
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
    editPolicies:   function(){
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
             if(sel_count > 1){
                Ext.ux.Toaster.msg(
                        i18n('sLimit_the_selection'),
                        i18n('sSelection_limited_to_one'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
                );
            }else{
                var sr      = me.getGrid().getSelectionModel().getLastSelected();
                var id      = sr.getId();
                var name    = sr.get('name');  
				me.application.runAction('cDnsDeskPolicies','Index',id,name); 
            }
        }
    },
    editUsers:   function(){
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
            if(sel_count > 1){
                Ext.ux.Toaster.msg(
                        i18n('sLimit_the_selection'),
                        i18n('sSelection_limited_to_one'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
                );
            }else{
                var sr      = me.getGrid().getSelectionModel().getLastSelected();
                var id      = sr.getId();
                var name    = sr.get('name');  
				me.application.runAction('cDnsDeskUsers','Index',id,name); 
            }
        }
    }
});

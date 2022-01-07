Ext.define('Rd.controller.cAcos', {
    extend: 'Ext.app.Controller',
    actionIndex: function(pnl){

        var me = this;
        if (me.populated) {
            return; 
        }     
        pnl.add({
            xtype   : 'tabpanel',
            border  : false,
            itemId  : 'tabAcos',
            plain   : true,
            cls     : 'subSubTab', //Make darker -> Maybe grey
            items   : [
                  { 'title' : i18n('sAccess_Controll_Objects'),'xtype':'treeAco'},
                  { 'title' : i18n('sAccess_Provider_Rights'),'xtype':'treeApRights'} 
            ]
        });
        me.populated = true;   
    },
    views:  ['acos.treeAco','acos.winAcoAdd','acos.winAcoEdit','acos.treeApRights'],
    stores: ['sAcos','sApRights'],
    models: ['mAco','mApRight'],
    acoSelectedRecord: undefined,
    apRightsSelectedRecord: undefined,
    config: {
        urlAcosRightsAdd:   '/cake3/rd_cake/acos-rights/add.json',
        urlAcosRightEdit:   '/cake3/rd_cake/acos-rights/edit.json'
    },
    refs: [
         {  ref:    'treeAco',      selector:   'treeAco'},
         {  ref:    'treeApRights', selector:   'treeApRights'} 
    ],
    init: function() {
        me = this;
        if (me.inited) {
            return;
        }
        me.inited = true;
        me.control({
            '#tabAcos' : {
                destroy   :      me.appClose   
            },
            'treeAco #reload': {
                click:      me.acoReload
            },
            'treeAco #add': {
                click:      me.acoAdd
            },
            'treeAco #edit': {
                click:      me.acoEdit
            },
            'treeAco #delete': {
                click:      me.acoDelete
            },
            'treeAco #expand': {
                click:      me.acoExpand
            },
            'winAcoAdd #save':{
                click:      me.acoAddSubmit
            },
            'winAcoEdit #save':{
                click:      me.acoEditSubmit
            },
            '#tabAcos treeAco'   : {
                itemclick:  me.acoGridClick
            },
            'treeApRights advCheckColumn': {
                checkchange: me.apRightChange
            },
            '#tabAcos treeApRights'   : {
                itemclick:  me.apRightsGridClick
            },
            'treeApRights #reload': {
                click:      me.apRightsReload
            },
            'treeApRights #expand': {
                click:      me.apRightsExpand
            }
        });;
    },
    appClose:   function(){
        var me          = this;
        me.populated    = false;
    },
    acoReload: function(){
        var me =this;
        me.getStore('sAcos').load();
    },
    acoAdd:    function(){
        var me = this;
        //See if there are anything selected... if not, inform the user
        var sel_count = me.getTreeAco().getSelectionModel().getCount();
        if(sel_count == 0){
            Ext.ux.Toaster.msg(
                        i18n('sSelect_a_node'),
                        i18n('sFirst_select_a_node_of_the_tree_under_which_to_add_an_ACO_entry'),
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
                console.log(me.acoSelectedRecord.getId());
                var parent_id = me.acoSelectedRecord.getId();
                var alias     = me.acoSelectedRecord.get('alias');
                
               if(!Ext.WindowManager.get('winAcoAddId')){
                    var parent_id = me.acoSelectedRecord.getId();
                    var alias     = me.acoSelectedRecord.get('alias');
                    var w = Ext.widget('winAcoAdd',{id:'winAcoAddId','parentId': parent_id,'parentDisplay': alias});
                    w.show();         
                }
            }
        }
        
    },
    acoAddSubmit: function(button){
        var me       = this;
        var win     = button.up('window');
        var form    = win.down('form');
        form.submit({
            clientValidation: true,
            url: me.getUrlAcosRightsAdd(),
            success: function(form, action) {
                win.close();
                me.getTreeAco().getStore().load();
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
    acoEdit:   function(){
        var me = this;
        //See if there are anything selected... if not, inform the user
        var sel_count = me.getTreeAco().getSelectionModel().getCount();
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

                //We are not suppose to edit the root node
                if(me.acoSelectedRecord.getId() == 0){
                    Ext.ux.Toaster.msg(
                        i18n('sRoot_node_selected'),
                        i18n('sYou_can_not_edit_the_root_node'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
                    );

                }else{
                    if(!Ext.WindowManager.get('winAcoEditId')){
                        var w = Ext.widget('winAcoEdit',{id:'winAcoAddId'});
                        w.show();  
                        w.down('form').loadRecord(me.acoSelectedRecord);
                        //Set the parent ID
                        w.down('hiddenfield[name="parent_id"]').setValue(me.acoSelectedRecord.parentNode.getId());
                    }  
                }  
            }
        }
    },
    acoEditSubmit: function(button){
        var me       = this;
        var win     = button.up('window');
        var form    = win.down('form');
        form.submit({
            clientValidation: true,
            url: me.getUrlAcosRightEdit(),
            success: function(form, action) {
                win.close();
                me.getTreeAco().getStore().load();
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


    acoDelete:   function(){
        var me      = this;     
        //Find out if there was something selected
        if(me.getTreeAco().getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            Ext.MessageBox.confirm(i18n('sConfirm'), i18n('sAre_you_sure_you_want_to_do_that_qm'), function(val){
                if(val== 'yes'){

                    Ext.each(me.getTreeAco().getSelectionModel().getSelection(), function(item){
                            //console.log(item.getId());
                            item.remove(true);
                    });
                    me.getTreeAco().getStore().sync({
                        success: function(batch,options){
                            Ext.ux.Toaster.msg(
                                i18n('sItem_deleted'),
                                i18n('sItem_deleted_fine'),
                                Ext.ux.Constants.clsInfo,
                                Ext.ux.Constants.msgInfo
                            ); 
                        },
                        failure: function(batch,options){
                             Ext.ux.Toaster.msg(
                                i18n('sProblems_deleting_item'),
                                batch.proxy.getReader().rawData.message.message,
                                Ext.ux.Constants.clsWarn,
                                Ext.ux.Constants.msgWarn
                            );
                        }
                    });

                }
            });
        }
    },
    acoGridClick:  function(grid, record, item, index, event){
        var me = this;
        me.acoSelectedRecord = record;
    },
    acoExpand: function(){
        var me = this;
        //See if there are anything selected... if not, inform the user
        var sel_count = me.getTreeAco().getSelectionModel().getCount();
        if(sel_count == 0){
            Ext.ux.Toaster.msg(
                        i18n('sSelect_a_node'),
                        i18n('sFirst_select_a_node_to_expand'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            me.getTreeAco().expandNode(me.acoSelectedRecord,true); 
        }
    },

    apRightChange: function(){
        var me = this;
        me.getTreeApRights().getStore().sync({
            success: function(batch,options){
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
    apRightsGridClick:  function(grid, record, item, index, event){
        var me = this;
        me.apRightsSelectedRecord = record;
    },
    apRightsReload: function(){
        var me =this;
        me.getStore('sApRights').load();
    },
    apRightsExpand: function(){
        var me = this;
        //See if there are anything selected... if not, inform the user
        var sel_count = me.getTreeApRights().getSelectionModel().getCount();
        if(sel_count == 0){
            Ext.ux.Toaster.msg(
                        i18n('sSelect_a_node'),
                        i18n('sFirst_select_a_node_to_expand'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            me.getTreeApRights().expandNode(me.apRightsSelectedRecord,true); 
        }
    }

});

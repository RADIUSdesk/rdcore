Ext.define('Rd.controller.cClouds', {
    extend: 'Ext.app.Controller',
    actionIndex: function(pnl,itemId){
        var me      = this;
        var item    = pnl.down('#'+itemId);
        var added   = false;
        if(!item){         
            pnl.add({
                itemId  : itemId,
                xtype   : 'treeClouds',
                border  : false,
                plain   : true,
                padding : Rd.config.gridSlim
            });
            pnl.on({activate : me.reload,scope: me});
            added = true;
        }
        return added;
    }, 
    views:  [
        'clouds.treeClouds',         
        'clouds.winCloudEdit',
        'clouds.winCloudAdd'
    ],
    stores: [],
    models: [],
    selectedRecord: null,
    config: {
        urlAdd          : '/cake4/rd_cake/clouds/add.json',
        urlDelete       : '/cake4/rd_cake/clouds/delete.json',
		urlEdit         : '/cake4/rd_cake/clouds/edit.json',
		urlMapPrefView  : '/cake4/rd_cake/meshes/map_pref_view.json'
    },
    refs: [
         {  ref:    'treeClouds',selector:   'treeClouds'}
    ],
    init: function() {
        var me = this;
        if (me.inited) {
            return;
        }
        me.inited = true;

        me.control({
            '#tabClouds' : {
                destroy   :      me.appClose   
            },
            'treeClouds #reload': {
                click:      me.reload
            },
            'treeClouds #add': {
                click:      me.add
            },
            'treeClouds #edit': {
                click:      me.edit
            },
            'treeClouds #delete': {
                click:      me.del
            },
            'treeClouds #expand': {
                click:      me.expand
            },
            'treeClouds #map': {
                click:      me.mapAddTag
            },
            'treeClouds #map_clear': {
                click:      me.mapClear
            },         
            'winCloudAdd #save':{
                click:      me.addSubmit
            },
            'winCloudEdit #save':{
                click:      me.editSubmit
            },
            'treeClouds'   : {
                select:  me.treeItemSelect
            }
        });
    },
    appClose:   function(){
        var me          = this;
        me.populated    = false;
    },
    reload: function(){
        var me =this;
        console.log("Reload Clouds");
        me.getTreeClouds().getStore().reload();
    }, 
    add:    function(){
        var me = this;
        //See if there are anything selected... if not, inform the user
        var sel_count = me.getTreeClouds().getSelectionModel().getCount();
        if(sel_count == 0){
            Ext.ux.Toaster.msg(
                        i18n('sSelect_a_node'),
                        'First select a node of the tree under which to add an entry',
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
                var id = me.selectedRecord.getId();
                if(!Ext.WindowManager.get('winCloudAddId')){
                    var parent_id = me.selectedRecord.getId();
                    var name      = me.selectedRecord.get('name'); 
                    console.log(parent_id);
                    console.log(name);                                      
                    var w = Ext.widget('winCloudAdd',{id:'winCloudAddId','parentId': parent_id,'parentDisplay': name});
                    w.show();         
                }
            }
        }       
    },
    addSubmit: function(button){
        var me       = this;
        var win     = button.up('window');
        var form    = win.down('form');
        form.submit({
            clientValidation: true,
            url: me.getUrlAdd(),
            success: function(form, action) {
                win.close();
                me.getTreeClouds().getStore().load();
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
        
    edit:   function(){
        var me = this;
        //See if there are anything selected... if not, inform the user
        var sel_count = me.getTreeClouds().getSelectionModel().getCount();
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
                if(me.selectedRecord.getId() == 0){
                    Ext.ux.Toaster.msg(
                        i18n('sRoot_node_selected'),
                        i18n('sYou_can_not_edit_the_root_node'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
                    );

                }else{
                    if(!Ext.WindowManager.get('winCloudEditId')){
                        var hide_a_to_s = true;
                        var parent_id = me.selectedRecord.get('parent_id');
                        if(parent_id == 'root'){
                            hide_a_to_s = false;
                        }
                        var w = Ext.widget('winCloudEdit',{id:'winCloudEditId',hide_a_to_s:hide_a_to_s});
                        w.show();  
                        w.down('form').loadRecord(me.selectedRecord);
                        //Set the parent ID
                        w.down('hiddenfield[name="parent_id"]').setValue(me.selectedRecord.parentNode.getId());
                    }  
                }  
            }
        }
    },
    editSubmit: function(button){
        var me      = this;
        var win     = button.up('window');
        var form    = win.down('form');
        form.submit({
            clientValidation: true,
            url: me.getUrlEdit(),
            success: function(form, action) {
                win.close();
                me.getTreeClouds().getStore().load();
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

    del:   function(){
        var me      = this;     
        //Find out if there was something selected
        if(me.getTreeClouds().getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            Ext.MessageBox.confirm(i18n('sConfirm'), i18n('sAre_you_sure_you_want_to_do_that_qm'), function(val){
                if(val== 'yes'){

                    Ext.each(me.getTreeClouds().getSelectionModel().getSelection(), function(item){
                            //console.log(item.getId());
                            item.remove(true);
                    });
                    me.getTreeClouds().getStore().sync({
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
    treeItemSelect:  function(grid,record){
        var me = this;
        me.selectedRecord = record;
        var tb =  me.getTreeClouds().down('toolbar[dock=top]');

        var edit = record.get('update');
        if(edit == true){
            if(tb.down('#edit') != null){
                tb.down('#edit').setDisabled(false);
            }
            if(tb.down('#map') != null){
                tb.down('#map').setDisabled(false);
            }
        }else{
            if(tb.down('#edit') != null){
                tb.down('#edit').setDisabled(true);
            }
            if(tb.down('#map') != null){
                tb.down('#map').setDisabled(true);
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
    expand: function(){
        var me = this;
        //See if there are anything selected... if not, inform the user
        var sel_count = me.getTreeClouds().getSelectionModel().getCount();
        if(sel_count == 0){
            Ext.ux.Toaster.msg(
                        i18n('sSelect_a_node'),
                        i18n('sFirst_select_a_node_to_expand'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            me.getTreeClouds().expandNode(me.selectedRecord,true); 
        }
    }
});

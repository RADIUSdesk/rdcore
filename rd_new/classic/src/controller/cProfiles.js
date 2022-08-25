Ext.define('Rd.controller.cProfiles', {
    extend: 'Ext.app.Controller',
    actionIndex: function(pnl,itemId){
        var me      = this;
        var item    = pnl.down('#'+itemId);
        var added   = false;
        if(!item){
            pnl.add({ 
                itemId  : itemId,
                xtype   : 'gridProfiles',
                border  : false,
                plain   : true,
                padding : Rd.config.gridSlim
            });
            pnl.on({activate : me.gridActivate,scope: me});
            added = true;
        }
        return added;      
    },
    
    views:  [
        'profiles.gridProfiles',  
        'profiles.winComponentManage'
    ],
    stores: ['sProfiles','sProfileComponents'],
    models: ['mProfile'],
    selectedRecord: null,
    config: {
        urlDelete:          '/cake4/rd_cake/profiles/delete.json',
        urlExportCsv:       '/cake4/rd_cake/profiles/export-csv',
        urlManageComponents:'/cake4/rd_cake/profiles/manage-components.json'
    },
    refs: [
        {  ref: 'grid',  selector:   'gridProfiles'}       
    ],
    init: function() {
        var me = this;
        if (me.inited) {
            return;
        }
        me.inited = true;    
        me.control({
            '#tabProfiles'    : {
                destroy   :      me.appClose
            },
            'gridProfiles #reload': {
                click:      me.reload
            }, 
            'gridProfiles #add'   : {
                click:      me.add
            },
            'gridProfiles #delete'   : {
                click:      me.del
            },
            'gridProfiles #edit'   : {
                click:      me.edit
            },
            'gridProfiles #csv'  : {
                click:      me.csvExport
            },
            'gridProfiles #profile_components'  : {
                click:      me.profileComponents
            },
            'gridProfiles #advanced_edit'  : {
                click:      me.advanced_edit
            },
            'gridProfiles'   : {
                select          : me.select
            },
            'gridProfiles actioncolumn': { 
                 itemClick  : me.onActionColumnItemClick
            },
            '#winCsvColumnSelectProfiles #save': {
                click:  me.csvExportSubmit
            },
            'winComponentManage #save' : {
                click:  me.btnComponentManageSave
            },
            'winComponentManage radiogroup' : {
                change: me.radioComponentManage
            }
        });
    },
    gridActivate: function(g){
        var me = this;
        var grid = g.down('grid');
        if(grid){
            grid.getStore().load();
        }else{
            g.getStore().load();
        }        
    },
    reload: function(){
        var me =this;
        me.getGrid().getSelectionModel().deselectAll(true);
        me.getGrid().getStore().load();
    },
    add: function(button){       
        var me = this;
        var store   = me.getGrid().getStore();
        var tp      = me.getGrid().up('tabpanel');
        var id      = 0; // New Profile
        var name    = "New Profile"; 
        me.application.runAction('cProfileSimple','Index',id,{
            name        :name,
            store       :store,
            tp          :tp,
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
    edit: function(){
      
        var me      = this;    
        var store   = me.getGrid().getStore();
        var tp      = me.getGrid().up('tabpanel'); 
        if(me.getGrid().getSelectionModel().getCount() == 0){
            Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );   
            
        }else{
            var tp      = me.getGrid().up('tabpanel');
            var sr      = me.getGrid().getSelectionModel().getLastSelected();
            var id      = sr.getId();
            var name    = sr.get('name');
            me.application.runAction('cProfileSimple','Index',id,{
                name        :name,
                tp          :tp
            });                  
        }
    },
    radioComponentManage: function(rbg){
        var me      = this;
        var form    = rbg.up('form');
        var cmb     = form.down('combo');
        var prior   = form.down('numberfield');

        if((rbg.getValue().rb == 'add')||(rbg.getValue().rb == 'remove')){
            cmb.setVisible(true);
            cmb.setDisabled(false);
        }else{
            cmb.setVisible(false);
            cmb.setDisabled(true);
        }

        if(rbg.getValue().rb == 'add'){
            prior.setVisible(true);
            prior.setDisabled(false);
        }else{
            prior.setVisible(false);
            prior.setDisabled(true);
        }
    },
    btnComponentManageSave: function(button){
        var me      = this;
        var win     = button.up('window');
        var form    = win.down('form');
        var cmb     = form.down('combo');
        var rbg     = form.down('radiogroup');

        //For these two we need to have a value selected
        if((rbg.getValue().rb == 'add')||(rbg.getValue().rb == 'remove')){
            if(cmb.getValue() == null){
                Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sSelect_a_component_to_add_or_remove'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
                );
                 return;
            } 
        }

        var extra_params    = {};
        var s               = me.getGrid().getSelectionModel().getSelection();
        Ext.Array.each(s,function(record){
            var r_id = record.getId();
            extra_params[r_id] = r_id;
        });

        //Checks passed fine...      
        form.submit({
            clientValidation: true,
            url: me.getUrlManageComponents(),
            params: extra_params,
            success: function(form, action) {
                win.close();
                me.getGrid().getStore().load();
                Ext.ux.Toaster.msg(
                    i18n('sProfiles_modified'),
                    i18n('sProfiles_modified_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },
            failure: Ext.ux.formFail
        });
    },
    profileComponents: function(b){
        var me = this;
        tp = b.up('tabpanel');
        me.application.runAction('cProfileComponents','Index',tp);
    },
    advanced_edit: function(){
        var me      = this;
        var grid    = me.getGrid()
        //Find out if there was something selected
        if(grid.getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item_to_edit'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            if(!Ext.WindowManager.get('winComponentManageId')){
                var w = Ext.widget('winComponentManage',{id:'winComponentManageId'});
                w.show();       
            }    
        }
    },
    onActionColumnItemClick: function(view, rowIndex, colIndex, item, e, record, row, action){
        //console.log("Action Item "+action+" Clicked");
        var me = this;
        var grid = view.up('grid');
        grid.setSelection(record);
        if(action == 'update'){
            me.edit()
        }
        if(action == 'delete'){
            me.del();
        }     
        if(action == 'advanced_edit'){
            me.advanced_edit();
        }
    }
});

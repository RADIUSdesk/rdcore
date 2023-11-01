Ext.define('Rd.view.accel.vcAccelProfiles', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcAccelProfiles',
    init    : function() {
    
    },
    config: {
        urlAdd      : '/cake4/rd_cake/accel-profiles/add.json',
        urlEdit     : '/cake4/rd_cake/accel-profiles/edit.json',
        urlDelete   : '/cake4/rd_cake/accel-profiles/delete.json'
    },
    control: {
        'gridAccelProfiles #reload': {
            click   : 'reload'
        }, 
        'gridAccelProfiles #add': {
            click   : 'add'
        },     
        'gridAccelProfiles #delete': {
            click   : 'del'
        },
        'gridAccelProfiles #edit': {
            click   : 'edit'
        },    
        'gridAccelProfiles actioncolumn': { 
             itemClick  : 'onActionColumnItemClick'
        }
    },
    reload: function(){
        var me      = this;
        me.getView().getSelectionModel().deselectAll(true);
        me.getView().getStore().load();
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
                        failure: function (response, options) {
                            var jsonData = Ext.JSON.decode(response.responseText);
                            Ext.Msg.show({
                                title       : "Error",
                                msg         : response.request.url + '<br>' + response.status + ' ' + response.statusText+"<br>"+jsonData.message,
                                modal       : true,
                                buttons     : Ext.Msg.OK,
                                icon        : Ext.Msg.ERROR,
                                closeAction : 'destroy'
                            });
                            me.reload(); //Reload from server
                        }
                    });
                }
            });
        }
    },
    add: function(btn){
    	var me         = this;
        var tp         = me.getView().up('tabpanel');
        var t_id       = 0;
        var accel_profile_id = 0;
        var t_tab_id   = 'profileTab_'+t_id;
        var nt         = tp.down('#'+t_tab_id);
        if(nt){
            tp.setActiveTab(t_tab_id); //Set focus on  Tab
            return;
        }

        var t_tab_name = 'Add Profile';
        //Tab not there - add one
        tp.add({ 
            title   : t_tab_name,
            itemId  : t_tab_id,
            accel_profile_id : accel_profile_id,
            mode    : 'add', //Add or Dedit Mode
            closable: true,
            glyph   : Rd.config.icnAdd,
            xtype   : 'pnlAccelProfileAddEdit'
        });
        tp.setActiveTab(t_tab_id); //Set focus on Add Tab
    },
    edit: function(button){
        var me      = this;   
        //Find out if there was something selected
        var selCount = me.getView().getSelectionModel().getCount();
        if(selCount == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            if(selCount > 1){
                Ext.ux.Toaster.msg(
                        i18n('sLimit_the_selection'),
                        i18n('sSelection_limited_to_one'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
                );
            }else{
                var sr          = me.getView().getSelectionModel().getLastSelected();
                var tp          = me.getView().up('tabpanel');               
                var t_tab_name  = 'Edit Profile';
                var t_id        = sr.get('id');
                var t_tab_id    = 'profileTab_'+t_id;
                //Tab not there - add one
                tp.add({ 
                    title   : t_tab_name,
                    itemId  : t_tab_id,
                    accel_profile_id : t_id,
                    mode    : 'edit', //Add or edit Mode
                    closable: true,
                    glyph   : Rd.config.icnEdit,
                    xtype   : 'pnlAccelProfileAddEdit',
                    sr      : sr
                });
                tp.setActiveTab(t_tab_id); //Set focus on Add Tab
            }
        }
    },
    onViewActivate: function(pnl){
        var me = this;
        me.reload();   
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
    }
});

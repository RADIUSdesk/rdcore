Ext.define('Rd.view.alerts.vcAlerts', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcAlerts',
    config  : {
        timespan        : 'now',
        urlDelete       : '/cake4/rd_cake/alerts/delete.json',
        urlAcknowledged : '/cake4/rd_cake/alerts/acknowledged.json'
    },
    control: {
        'gridAlerts': {
            activate: 'reload'
        },
        'gridAlerts #reload': {
            click   : 'reload'
        },
        'gridAlerts #delete': {
            click   : 'del'
        },
        'gridAlerts #acknowledged': {
            click   : 'acknowledged'
        },
        'gridAlerts actioncolumn': { 
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
    acknowledged: function(){    
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
            var selected    = me.getView().getSelectionModel().getSelection();
            var list        = [];
            Ext.Array.forEach(selected,function(item){
                var id = item.getId();
                Ext.Array.push(list,{'id' : id});
            });
            Ext.Ajax.request({
                url: me.getUrlAcknowledged(),
                method: 'POST',          
                jsonData: list,
                success: function(batch,options){console.log('success');
                    Ext.ux.Toaster.msg(
                        'Alert(s) Acknowledged',
                        'Alert(s) Acknowledged Fine',
                        Ext.ux.Constants.clsInfo,
                        Ext.ux.Constants.msgInfo
                    );
                    me.reload(); //Reload from server
                },                                    
                failure: function(batch,options){
                    Ext.ux.Toaster.msg(
                        'Problems Acknowledging Alerts',
                        batch.proxy.getReader().rawData.message.message,
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
                    );
                    me.reload(); //Reload from server
                }
            });
        }
    },
    onActionColumnItemClick: function(view, rowIndex, colIndex, item, e, record, row, action){
        //console.log("Action Item "+action+" Clicked");
        var me = this;
        me.getView().setSelection(record);
        if(action == 'delete'){
            me.del();
        }     
        if(action == 'acknowledge'){
            me.acknowledged();
        }
    } 
});

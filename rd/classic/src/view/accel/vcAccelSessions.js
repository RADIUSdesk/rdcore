Ext.define('Rd.view.accel.vcAccelSessions', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcAccelSessions',
    init    : function() {
    
    },
    config: {
        urlDelete       : '/cake4/rd_cake/accel-sessions/delete.json',
        urlDisconnect   : '/cake4/rd_cake/accel-sessions/disconnect.json'
    },
    control: {
        'gridAccelSessions #reload': {
            click   : 'reload'
        },
        'gridAccelSessions #reload menuitem[group=refresh]'   : {
            click   : 'reloadOptionClick'
        },  
        'gridAccelSessions #connected': {
            click   : 'reload'
        }, 
        'gridAccelSessions #delete': {
            click   : 'del'
        },
        'gridAccelSessions #disconnect': {
            click   : 'disconnect'
        },
        'gridAccelSessions actioncolumn': { 
             itemClick  : 'onActionColumnItemClick'
        }
    },
    reloadZ: function(){
        var me      = this;
        me.getView().getSelectionModel().deselectAll(true);
        me.getView().getStore().load();
    },   
    reload: function(){
        var me      = this;
        var btn     = me.getView().down('#connected');
        var only_connected  = false;
        if(btn){
            only_connected = btn.pressed; //Default only active
            if(btn.pressed){
               btn.setGlyph(Rd.config.icnLightbulb);
               btn.setTooltip('Include past connections');
            }else{
               btn.setGlyph(Rd.config.icnTime);
               btn.setTooltip('Show only currently connected');
            }
        }      
        me.getView().getStore().getProxy().setExtraParam('only_connected', only_connected);
        me.getView().getSelectionModel().deselectAll(true);
        me.getView().getStore().load();
    },    
    reloadOptionClick: function(menu_item){
        var me      = this;
        var n       = menu_item.getItemId();
        var b       = menu_item.up('button'); 
        var interval= 30000; //default
        clearInterval(me.autoReload);   //Always clear
        b.setGlyph(Rd.config.icnTime);

        if(n == 'mnuRefreshCancel'){
            b.setGlyph(Rd.config.icnReload);
            return;
        }
        
        if(n == 'mnuRefresh1m'){
           interval = 60000
        }

        if(n == 'mnuRefresh5m'){
           interval = 360000
        }
        me.autoReload = setInterval(function(){        
            me.reload();
        },  interval);  
    },
    connected : function(btn){
        var me = this;
    
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
    disconnect : function(){
         // console.log("Edit node");  
        var me = this;
        //See if there are anything selected... if not, inform the user
        var sel_count = me.getView().getSelectionModel().getCount();
        if(sel_count == 0){
            Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
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
                        url     : me.getUrlDisconnect(),
                        method  : 'POST',          
                        jsonData: list,
                        success : function(batch,options){console.log('success');
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
    onViewActivate: function(pnl){
        var me = this;
        me.reload();   
    },
    onActionColumnItemClick: function(view, rowIndex, colIndex, item, e, record, row, action){
        //console.log("Action Item "+action+" Clicked");
        var me = this;
        var grid = view.up('grid');
        grid.setSelection(record);
        if(action == 'delete'){
            me.del();
        }
        if(action == 'disconnect'){
            me.disconnect();
        }      
    }
});

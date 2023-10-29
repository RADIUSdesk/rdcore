Ext.define('Rd.view.accel.vcAccelServers', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcAccelServers',
    init    : function() {
    
    },
    config: {
        urlAdd      : '/cake4/rd_cake/accel-servers/add.json',
        urlDelete   : '/cake4/rd_cake/accel-servers/delete.json',
        urlRestart  : '/cake4/rd_cake/accel-servers/restart.json'
    },
    control: {
        'gridAccelServers #reload': {
            click   : 'reload'
        },
        'gridAccelServers #reload menuitem[group=refresh]'   : {
            click   : 'reloadOptionClick'
        },
        'gridAccelServers #online': {
            click   : 'reload'
        },  
        'gridAccelServers #add': {
            click   : 'add'
        },     
        'gridAccelServers #delete': {
            click   : 'del'
        },
        'gridAccelServers #restart': {
            click   : 'restart'
        },
        'gridAccelServers #sessions': {
            click   : 'sessions'
        },
        'winAddAccelServer #save' : {
            click   : 'addSave'
        },
        'gridAccelServers actioncolumn': { 
             itemClick  : 'onActionColumnItemClick'
        }
    },
    reload: function(){
        var me      = this;
        var btn     = me.getView().down('#online');
        var only_online  = false;
        if(btn){
            only_online = btn.pressed; //Default only active
            if(btn.pressed){
               btn.setGlyph(Rd.config.icnLightbulb);
               btn.setTooltip('Show ALL servers');
            }else{
               btn.setGlyph(Rd.config.icnTime);
               btn.setTooltip('Show only online servers');
            }
        }      
        me.getView().getStore().getProxy().setExtraParam('only_online', only_online);
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
    	var me = this;
    	if(!Ext.WindowManager.get('winAddAccelServerId')){
            var w = Ext.widget('winAddAccelServer',{id:'winAddAccelServerId'});
            me.getView().add(w); 
            let appBody = Ext.getBody();
            w.showBy(appBody);           
        }  
    },
    addSave :  function(button){
        var me      = this;
        var win     = button.up('window');
        var form    = win.down('form');
        form.submit({
            clientValidation: true,
            url: me.getUrlAdd(),
            success: function(form, action) {
                win.close();
                me.reload();
                me.reloadComboBox();
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
    restart : function(){
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
                        url     : me.getUrlRestart(),
                        method  : 'POST',          
                        jsonData: list,
                        success : function(batch,options){console.log('success');
                            Ext.ux.Toaster.msg(
                                'Restart Initiated',
                                'Restart Initiated',
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
    sessions : function(){
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

            var selected    =  me.getView().getSelectionModel().getSelection();
            var count       = selected.length;         
            Ext.each(me.getView().getSelectionModel().getSelection(), function(sr,index){

                //Check if the node is not already open; else open the node:
                var tp          = me.getView().up('tabpanel');
                var t_id       = sr.getId();
                var t_tab_id   = 'puTab_'+t_id;
                var nt          = tp.down('#'+t_tab_id);
                if(nt){
                    tp.setActiveTab(t_tab_id); //Set focus on  Tab
                    return;
                }

                var t_tab_name = sr.get('name');
                //Tab not there - add one
                tp.add({ 
                    title   : t_tab_name,
                    itemId  : t_tab_id,
                    closable: true,
                    glyph   : Rd.config.icnChain,
                    layout  : 'fit',
                    srv_id  : t_id,
                    xtype   : 'gridAccelSessions'
                });
                tp.setActiveTab(t_tab_id); //Set focus on Add Tab
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
        if(action == 'update'){
            me.edit()
        }
        if(action == 'delete'){
            me.del();
        }
        if(action == 'view'){
            me.view();
        } 
        
        if(action == 'restart'){
            me.restart();
        } 
        
        if(action == 'sessions'){
            me.sessions();
        }     
    }
});

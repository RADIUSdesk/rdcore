Ext.define('Rd.controller.cAccessPoints', {
    extend: 'Ext.app.Controller',
    actionIndex: function(pnl){
        var me      = this;

        pnl.add({ 
            xtype   : 'gridApProfiles',
	        title   : 'AP Profiles',
            border  : false,
            plain   : true,
            glyph   : Rd.config.icnProfile,
            padding : Rd.config.gridSlim,
            tabConfig   : {
                ui : 'tab-blue'
            }   
        });

        pnl.add({  
            xtype   : 'gridApLists',  
            title   : 'APs',
            glyph   : Rd.config.icnCube,
            padding : Rd.config.gridSlim,
            tabConfig : {
                ui : 'tab-orange'
            }    
        });
        return;     
    },

    views:  [
        'aps.gridApProfiles', 
        'aps.gridApLists',
        'aps.cmbApHardwareModels',
        'aps.winApProfileAdd',
        'components.cmbDynamicDetail',
        'components.winHardwareAddAction'
    ],
    stores: [ 'sApProfiles', 'sApLists'  ],
    models: [ 'mApProfile',  'mApList', 'mDynamicDetail' ],
    selectedRecord: null,
    config: {
        urlAdd          : '/cake4/rd_cake/ap-profiles/add.json',
        urlDelete       : '/cake4/rd_cake/ap-profiles/delete.json',      
        urlAddAp        : '/cake4/rd_cake/ap-profiles/ap_profile_ap_add.json',
        urlViewAp       : '/cake4/rd_cake/ap-profiles/ap_profile_ap_view.json',
        urlEditAp       : '/cake4/rd_cake/ap-profiles/ap_profile_ap_edit.json',
        urlAdvancedSettingsForModel : '/cake4/rd_cake/ap-profiles/advanced_settings_for_model.json',
        urlApProfileAddApAction :  '/cake4/rd_cake/ap-actions/add.json',
        urlRestartAps   : '/cake4/rd_cake/ap-actions/restart_aps.json'
    },
    refs: [
        {  ref: 'grid',             selector: 'gridApProfiles'},
        {  ref: 'gridApLists',      selector: 'gridApLists'},
        {  ref: 'tabAccessPoints',  selector: '#tabMainNetworks' }      
    ],
    init: function() {
        var me = this;
        
        if (me.inited) {
            return;
        }
        me.inited = true;
        
        me.control({
            '#tabMainNetworks'    : {
                destroy   :      me.appClose
            },
			'#tabMainNetworks gridApProfiles' : {
				activate	: me.gridActivate
			},
			'#tabMainNetworks gridApLists' : {
				activate	: me.gridActivate
			},
            'gridApProfiles #reload': {
                click:      me.reload
            },
            'gridApProfiles #reload menuitem[group=refresh]'   : {
                click:      me.reloadOptionClick
            },
            'gridApProfiles #add'   : {
                click:      me.add
            },
            'gridApProfiles #delete'   : {
                click:      me.del
            },
            'gridApProfiles #edit'   : {
                click:      me.edit
            },
            'gridApProfiles #ban': {
                click: me.ban
            },
            'gridApProfiles'  : {
                select:      me.select
            },
            'gridApProfiles actioncolumn': { 
                 itemClick  : me.onActionColumnItemClick
            },
            'winApProfileAdd #btnDataNext' : {
                click:  me.btnDataNext
            },
            			      
            //Known aps
			'gridApLists #reload': {
                click:      me.gridApListsReload
            },
            'gridApLists #reload menuitem[group=refresh]'   : {
                click:      me.reloadApListsOptionClick
            }, 
			'gridApLists #add': {
                click:  me.addAp
            },        
            'gridApLists #delete': {
                click: me.delAp
            },
            'gridApLists #edit': {
                click:  me.editAp
            },
            'gridApLists #view' : {
				click	: me.viewAp
			},
            'gridApLists #execute' : {
				click	: me.execute
			},
            '#winHardwareAddActionMain #save' : {
				click	: me.commitExecute
			},
			'gridApLists #restart' : {
				click	: me.restart
			},
            'gridApLists actioncolumn' : {
                 itemClick  : me.onApListsActionColumnItemClick
            }  
        });
    },
    appClose:   function(){
        var me          = this;
        me.populated    = false;
        
        if(me.autoReload != undefined){
            clearInterval(me.autoReload);   //Always clear
        }
        
        if(me.autoReloadApLists != undefined){
            clearInterval(me.autoReloadApLists);
        }    
    },
	reload: function(){
        var me =this;
        me.getGrid().getSelectionModel().deselectAll(true);
        me.getGrid().getStore().load();
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
    gridActivate: function(g){
        var me = this;
        g.getStore().load();
    },
    gridApListsReload: function(button){
        var me  = this;
        var g = button.up('gridApLists');
        g.getStore().load();
    },
    reloadApListsOptionClick: function(menu_item){
        var me      = this;
        var n       = menu_item.getItemId();
        var b       = menu_item.up('button'); 
        var interval= 30000; //default
        clearInterval(me.autoReloadApLists);   //Always clear
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
        me.autoReloadApLists = setInterval(function(){        
            me.gridApListsReload(b);
        },  interval);  
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

        var view = record.get('view');
        if(view == true){
            if(tb.down('#view') != null){
                tb.down('#view').setDisabled(false);
            }
        }else{
            if(tb.down('#view') != null){
                tb.down('#view').setDisabled(true);
            }
        }
    },
    
    //_______ Known APs ________
    addAp: function(button){
        var me      = this;     
        var tab     = me.getTabAccessPoints(); 
        var store   = tab.down("gridApLists").getStore();
        var id      = 0; // New Ap
        var name    = "New Ap"; 
		var apProfileId = '';
		var apProfile   = '';
       Ext.getApplication().runAction('cAccessPointAp','Index',id,{name:name,apProfileId:apProfileId,apProfile:apProfile,store:store});
    },
    delAp:   function(btn){
        var me      = this;
       // var win     = btn.up("window");
        var grid    = btn.up("gridApLists");
    
        //Find out if there was something selected
        if(grid.getSelectionModel().getCount() == 0){
            Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
            
        }else{
        
            Ext.MessageBox.confirm(i18n('sConfirm'), i18n('sAre_you_sure_you_want_to_do_that_qm'), function(val){
                if(val== 'yes'){
                
                    grid.getStore().remove(grid.getSelectionModel().getSelection());
                    grid.getStore().sync({
                        success: function(batch,options){
                            Ext.ux.Toaster.msg(
                                i18n('sItem_deleted'),
                                i18n('sItem_deleted_fine'),
                                Ext.ux.Constants.clsInfo,
                                Ext.ux.Constants.msgInfo
                            );
                            
                        },
                        failure: function(batch,options,c,d){
                            Ext.ux.Toaster.msg(
                                i18n('sProblems_deleting_item'),
                                batch.proxy.getReader().rawData.message.message,
                                Ext.ux.Constants.clsWarn,
                                Ext.ux.Constants.msgWarn
                            );
                            grid.getStore().load(); //Reload from server since the sync was not good
                        }
                    });    
                }
            });
        }
    },
    editAp: function(button){
        var me      = this;     
        var tab     = me.getTabAccessPoints(); 
        var store   = me.getGridApLists().getStore();
		var selCount = me.getGridApLists().getSelectionModel().getCount();
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
                    i18n('sSelect_one_only'),
                    i18n('sSelection_limited_to_one'),
                    Ext.ux.Constants.clsWarn,
                    Ext.ux.Constants.msgWarn
                );
            }else{
                var sr      = me.getGridApLists().getSelectionModel().getLastSelected();
                var id      = sr.getId();
                var name    = sr.get('name'); 
				var apProfileId = sr.get('ap_profile_id');
				var apProfile   = sr.get('ap_profile');
                Ext.getApplication().runAction('cAccessPointAp','Index',id,{
                    name        : name,
                    apProfileId : apProfileId,
                    apProfile   : apProfile,
                    store       : store
                });
            }
        }
    },
    execute:   function(button){
        var me      = this;
        var tab     = me.getTabAccessPoints(); 
        var grid    = tab.down("gridApLists");
         
        //Find out if there was something selected
        if(grid.getSelectionModel().getCount() == 0){
            Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n("sSelect_an_item_on_which_to_execute_the_command"),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
        	//console.log("Show window for command content")
        	if(!Ext.WindowManager.get('winHardwareAddActionMain')){
                var w = Ext.widget('winHardwareAddAction',{id:'winHardwareAddActionMain',grid : grid});
                w.show();       
            }
        }
    },
	commitExecute:  function(button){
        var me      = this;
        var win     = button.up('#winHardwareAddActionMain');
        var form    = win.down('form');

		var selected    = win.grid.getSelectionModel().getSelection();
		var list        = [];
        Ext.Array.forEach(selected,function(item){
            var id = item.getId();
            Ext.Array.push(list,{'id' : id});
        });

        form.submit({
            clientValidation	: true,
            url					: me.getUrlApProfileAddApAction(),
			params				: list,
            success: function(form, action) {       
                win.grid.getStore().reload();
				win.close();
				Ext.ux.Toaster.msg(
                    i18n("sItem_created"),
                    i18n("sItem_created_fine"),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },
            scope       : me,
            failure     : Ext.ux.formFail
        });
    },
    
    restart:   function(button){
        var me      = this; 
        var tab     = me.getTabAccessPoints();
        var grid    = tab.down("gridApLists");
		
        //Find out if there was something selected
        if(grid.getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item_to_restart'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
        
            //This is
            Ext.Msg.show({
                 title      : i18n("sConfirm"),
                 msg        : i18n("sAre_you_sure_you_want_to_do_that_qm"),
                 buttons    : Ext.Msg.YESNO,
                 icon       : Ext.Msg.QUESTION,
                 callback   :function(btn) {
                    if('yes' === btn) {
                        var selected    = grid.getSelectionModel().getSelection();
                        var list        = [];
                        Ext.Array.forEach(selected,function(item){
                            var id = item.getId();
                            Ext.Array.push(list,{'id' : id});
                        });

                        Ext.Ajax.request({
                            url: me.getUrlRestartAps(),
                            method: 'POST',          
                            jsonData: {aps: list},
                            success: function(batch,options){
                                Ext.ux.Toaster.msg(
                                            i18n('sCommand_queued'),
                                            i18n('sCommand_queued_for_execution'),
                                            Ext.ux.Constants.clsInfo,
                                            Ext.ux.Constants.msgInfo
                                );
                                grid.getStore().reload();
                            },                                    
                            failure: function(batch,options){
                                Ext.ux.Toaster.msg(
                                            i18n('sError_encountered'),
                                            batch.proxy.getReader().rawData.message.message,
                                            Ext.ux.Constants.clsWarn,
                                            Ext.ux.Constants.msgWarn
                                );
                                grid.getStore().reload();
                            }
                        });
                    }
                }
            });
        }
    },
    
    viewAp: function(button){
        var me      = this;
        //Find out if there was something selected
        var selCount = me.getGridApLists().getSelectionModel().getCount();
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
                    i18n('sSelect_one_only'),
                    i18n('sSelection_limited_to_one'),
                    Ext.ux.Constants.clsWarn,
                    Ext.ux.Constants.msgWarn
                );
            }else{
                var sr      = me.getGridApLists().getSelectionModel().getLastSelected();
                var id      = sr.getId();
                var name    = sr.get('name'); 
                //var cont    = Rd.app.createController('cAccessPointViews');
                //cont.actionIndex(id,name);
                Ext.getApplication().runAction('cAccessPointViews','Index',id,name);
            }
        }
    },
    add: function(button){
        var me      = this;
        var c_name 	= Ext.getApplication().getCloudName();
        var c_id	= Ext.getApplication().getCloudId();
        if(!Ext.WindowManager.get('winApProfileAddId')){
            var w = Ext.widget('winApProfileAdd',{id:'winApProfileAddId',cloudId: c_id, cloudName: c_name});
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
                me.getStore('sApProfiles').load();
                Ext.ux.Toaster.msg(
                    i18n('sNew_item_created'),
                    i18n('sItem_created_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },
            scope       : me,
            failure     : Ext.ux.formFail
        });
    },
    del:   function(){
        var me      = this;     
        //Find out if there was something selected
        if(me.getGrid().getSelectionModel().getCount() == 0){
            Ext.ux.Toaster.msg(
                i18n('sSelect_an_item'),
                i18n('sFirst_select_an_item'),
                Ext.ux.Constants.clsWarn,
                Ext.ux.Constants.msgWarn
            );
        }else{
        
            Ext.Msg.show({
                 title      : i18n("sConfirm"),
                 msg        : i18n("sAre_you_sure_you_want_to_do_that_qm"),
                 buttons    : Ext.Msg.YESNO,
                 icon       : Ext.Msg.QUESTION,
                 callback   :function(btn) {
                    if('yes' === btn) {

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
                            success: function(batch,options){
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
                }
            });
        }
    }, 
    edit: function(){
        var me      = this;   
        //Find out if there was something selected
        var selCount = me.getGrid().getSelectionModel().getCount();
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
                    i18n('sSelect_one_only'),
                    i18n('sSelection_limited_to_one'),
                    Ext.ux.Constants.clsWarn,
                    Ext.ux.Constants.msgWarn
                );
            }else{
                var sr      = me.getGrid().getSelectionModel().getLastSelected();
                var id      = sr.getId();
                var name    = sr.get('name');
                Ext.getApplication().runAction('cAccessPointEdits','Index',id,name); 
            }
        }
    },
    
    ban	: function(b){
    	var me 			= this;
    	var tabPanel 	= me.getGrid().up('tabpanel')
		Ext.getApplication().runAction('cBans','Index',tabPanel,{});
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
    },
    onApListsActionColumnItemClick: function(view, rowIndex, colIndex, item, e, record, row, action){
        //console.log("Action Item "+action+" Clicked");
        var me = this;
        var grid = view.up('grid');
        grid.setSelection(record);
        if(action == 'view'){
            me.viewAp()
        }
        if(action == 'execute'){
            me.execute();
        }
        if(action == 'restart'){
            me.restart();
        }      
    }
});

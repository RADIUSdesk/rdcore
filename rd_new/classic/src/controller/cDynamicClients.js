Ext.define('Rd.controller.cDynamicClients', {
    extend: 'Ext.app.Controller',
    actionIndex: function(pnl,itemId){
        var me      = this;
        var item    = pnl.down('#'+itemId);
        var added   = false;
        if(!item){
            var tp = Ext.create('Ext.tab.Panel',
            	{          
	            	border  : false,
	                itemId  : itemId,
	                plain	: true,
	                cls     : 'subSubTab', //Make darker -> Maybe grey
	                items   : [
	                    { 
	                         title  : 'RADIUS Clients', 
	                         xtype  : 'gridDynamicClients',
	                         border : false,
	                         plain  : true,
	                         glyph  : 'xf192@FontAwesome'
	                    }
	                ]
	            });      
            pnl.add(tp);
            pnl.on({activate : me.gridActivate,scope: me});
            added = true;
        }
        return added;      
    },
    views:  [
        'dynamicClients.gridDynamicClients',/*
        'dynamicClients.winDynamicClientAddWizard',
        'dynamicClients.gridUnknownDynamicClients',
        'dynamicClients.winAttachUnknownDynamicClient',
        'components.cmbTimezones',
        'components.winNote', 
        'components.winNoteAdd',
        'dynamicClients.pnlDynamicClient',
        'dynamicClients.pnlDynamicClientDynamicClient',
        'dynamicClients.pnlRealmsForDynamicClientOwner',
        'dynamicClients.gridRealmsForDynamicClientOwner',
        'dynamicClients.pnlDynamicClientPhoto',
        'dynamicClients.gridDynamicClientsAvailability',
        'components.pnlUsageGraph',
        'dynamicClients.pnlDynamicClientGraphs',
        'components.pnlGMap',
        'dynamicClients.winMapDynamicClientAdd',
        'nas.winMapPreferences',
        'dynamicClients.cmbDynamicClientsAddMap',
        'components.winSelectOwner',
        'dynamicClients.pnlDynamicClientAvailable',
        'dynamicClients.gridDynamicClientsAvailableRaw'*/
    ],
    stores: ['sDynamicClients', 'sUnknownDynamicClients'],
    models: [ 'mDynamicClient'],
    selectedRecord: null,
    config: {
        urlApChildCheck : '/cake3/rd_cake/access-providers/child-check.json',
        urlExportCsv    : '/cake3/rd_cake/dynamic-clients/export_csv',
        urlAdd          : '/cake3/rd_cake/dynamic-clients/add.json',
        urlDelete       : '/cake3/rd_cake/dynamic-clients/delete.json',
		urlEdit         : '/cake3/rd_cake/dynamic-clients/edit.json',
		urlNoteAdd      : '/cake3/rd_cake/dynamic-clients/note-add.json',
		urlView         : '/cake3/rd_cake/dynamic-clients/view.json',
		urlViewPhoto    : '/cake3/rd_cake/dynamic-clients/view_photo.json',
        urlPhotoBase    : '/cake3/rd_cake/webroot/img/nas/',
        urlUploadPhoto  : '/cake3/rd_cake/dynamic-clients/upload_photo/',
        
        urlMapDelete    : '/cake3/rd_cake/dynamic-clients/delete_map.json',
        urlMapSave      : '/cake3/rd_cake/dynamic-clients/edit_map.json',
        urlGreenMark    : 'resources/images/map_markers/green-dot.png',
        urlRedMark      : 'resources/images/map_markers/red-dot.png', 
        urlBlueMark     : 'resources/images/map_markers/blue-dot.png', 
        urlYellowMark   : 'resources/images/map_markers/yellow-dot.png',
        urlViewMapPref  : '/cake3/rd_cake/dynamic-clients/view_map_pref.json',
        urlEditMapPref  : '/cake3/rd_cake/dynamic-clients/edit_map_pref.json'
    },
    refs: [
        {  ref: 'grid',     selector: 'gridDynamicClients'  },
        {  ref: 'pnlGMap',  selector: 'pnlGMap'             }      
    ],
    autoReloadUnknownDynamicClients: undefined,
    autoReload: undefined,
    init: function() {
        var me = this;
        if (me.inited) {
            return;
        }
        me.inited = true;
        me.control({
            'gridDynamicClients #reload': {
                click:      me.reload
            },
            'gridDynamicClients #reload menuitem[group=refresh]'   : {
                click:      me.reloadOptionClick
            },   
            'gridDynamicClients #add'   : {
                click:      me.add
            },
            'gridDynamicClients #delete'	: {
                click:      me.del
            },
            'gridDynamicClients #edit'   : {
                click:      me.edit
            },
            'pnlDynamicClient #tabDynamicClient' : {
                activate: me.onTabDynamicClientActive
            },
            'pnlDynamicClient #tabDynamicClient #monitorType': {
                change: me.monitorTypeChange
            },
            'pnlDynamicClient #tabDynamicClient #chkSessionAutoClose': {
                change:     me.chkSessionAutoCloseChange
            },
            'pnlDynamicClient #tabDynamicClient #btnPickOwner': {
                click:  me.btnPickOwner
            },      
            'pnlDynamicClient #tabDynamicClient #save' : {
                click: me.saveDynamicClient
            },
            
            'pnlRealmsForDynamicClientOwner #chkAvailForAll' :{
                change:     me.chkAvailForAllChangeTab
            },
            'pnlRealmsForDynamicClientOwner gridRealmsForDynamicClientOwner #reload' :{
                click:      me.gridRealmsForDynamicClientOwnerReload
            },
            'pnlRealmsForDynamicClientOwner #chkAvailSub':{
                change:     me.gridRealmsForDynamicClientOwnerChkAvailSub
            }, 
            'pnlDynamicClient #tabRealms': {
                activate:   me.tabRealmsActivate
            },
            'pnlDynamicClient #tabPhoto': {
                activate:       me.tabPhotoActivate
            },
            'pnlDynamicClient #tabPhoto #save': {
                click:       me.photoSave
            },
            'pnlDynamicClient #tabPhoto #cancel': {
                click:       me.photoCancel
            },
            
            //Availability
            'gridDynamicClientsAvailability' :{
                activate:       me.tabAvailabilityActivate
            },
            'gridDynamicClientsAvailability #reload' :{
                click:          me.gridDynamicClientsAvailabilityReload
            },
            'gridDynamicClientsAvailability #delete' :{
                click:          me.gridDynamicClientsAvailabilityDelete
            },
            'gridDynamicClientsAvailability cmbTimezones' :{
                afterrender : me.gridDynamicClientsAvailabilityReload,
                change      : me.gridDynamicClientsAvailabilityReload
            },
            //END Availability
            
            //RAW GRID
            'gridDynamicClientsAvailableRaw' :{
                activate:       me.tabRawActivate
            },
            'gridDynamicClientsAvailableRaw #reload' :{
                click:          me.gridRawReload
            },
            'gridDynamicClientsAvailableRaw #delete' :{
                click:          me.gridRawDelete
            },
            'gridDynamicClientsAvailableRaw cmbTimezones' :{
                afterrender : me.gridRawReload,
                change      : me.gridRawReload
            },
            //END RAW GRID
            
            'gridDynamicClients #note' : {
                click:      me.note
            },
            'gridDynamicClients #graph'   : {
                click:      me.graph
            },
            'gridDynamicClients #map'   : {
                click:      me.mapLoadApi
            },
            'gridDynamicClients #available'   : {
                click:      me.available
            },
            'gridDynamicClients #unknown_clients'   : {
                click:      me.unknown_clients
            },
            
            'gridDynamicClients'   		: {
                select:      me.select
            },
            'gridDynamicClients actioncolumn': { 
                 itemClick  : me.onActionColumnItemClick
            },
			'winDynamicClientAddWizard #btnTreeNext' : {
                click:  me.btnTreeNext
            },
            'winDynamicClientAddWizard #btnDataPrev' : {
                click:  me.btnDataPrev
            },
            'winDynamicClientAddWizard #btnDataNext' : {
                click:  me.btnDataNext
            },
            'winDynamicClientAddWizard #monitorType': {
                change: me.monitorTypeChange
            },
            'winDynamicClientAddWizard #chkSessionAutoClose': {
                change:     me.chkSessionAutoCloseChange
            },
            'winDynamicClientAddWizard gridRealmsForDynamicClientOwner #reload': {
                click:      me.gridRealmsForDynamicClientOwnerReload
            },
            'winDynamicClientAddWizard #tabRealms': {
                activate:      me.gridRealmsForDynamicClientOwnerActivate
            }, 
            'winDynamicClientAddWizard #tabRealms #chkAvailForAll': {
                change:     me.chkAvailForAllChange
            },
            'winDynamicClientAddWizard gridRealmsForDynamicClientOwner #chkAvailSub':     {
                change:     me.gridRealmsForDynamicClientOwnerChkAvailSub
            },
            'gridUnknownDynamicClients #reload': {
                click:      me.gridUnknownDynamicClientsReload
            },
            'gridUnknownDynamicClients #reload menuitem[group=refresh]'   : {
                click:      me.reloadUnknownDynamicClientsOptionClick
            },
			'gridUnknownDynamicClients #attach': {
                click:  me.attachAttachUnknownDynamicClient
            },
            'winAttachUnknownDynamicClient #btnTreeNext' : {
                click:  me.btnTreeNext
            },
            'winAttachUnknownDynamicClient #btnDataPrev' : {
                click:  me.btnDataPrev
            },
            'winAttachUnknownDynamicClient #btnDataNext' : {
                click:  me.btnDataNext
            },
            'winAttachUnknownDynamicClient #monitorType': {
                change: me.monitorTypeChange
            },
            'winAttachUnknownDynamicClient #chkSessionAutoClose': {
                change:     me.chkSessionAutoCloseChange
            },
            'winAttachUnknownDynamicClient gridRealmsForDynamicClientOwner #reload': {
                click:      me.gridRealmsForDynamicClientOwnerReload
            },
            'winAttachUnknownDynamicClient #tabRealms': {
                activate:      me.gridRealmsForDynamicClientOwnerActivate
            }, 
            'winAttachUnknownDynamicClient #tabRealms #chkAvailForAll': {
                change:     me.chkAvailForAllChange
            },
            'winAttachUnknownDynamicClient gridRealmsForDynamicClientOwner #chkAvailSub':     {
                change:     me.gridRealmsForDynamicClientOwnerChkAvailSub
            },
			'gridUnknownDynamicClients #delete': {
                click: me.delUnknownDynamicClient
            } ,
            'gridNote[noteForGrid=dynamicClients] #reload' : {
                click:  me.noteReload
            },
            'gridNote[noteForGrid=dynamicClients] #add' : {
                click:  me.noteAdd
            },
            'gridNote[noteForGrid=dynamicClients] #delete' : {
                click:  me.noteDelete
            },
            'gridNote[noteForGrid=dynamicClients]' : {
                itemclick: me.gridNoteClick
            },
            'winNoteAdd[noteForGrid=dynamicClients] #btnTreeNext' : {
                click:  me.btnNoteTreeNext
            },
            'winNoteAdd[noteForGrid=dynamicClients] #btnNoteAddPrev'  : {   
                click: me.btnNoteAddPrev
            },
            'winNoteAdd[noteForGrid=dynamicClients] #btnNoteAddNext'  : {   
                click: me.btnNoteAddNext
            },
            //---- MAPS ----
            'pnlGMap #preferences': {
                click: me.mapPreferences
            },
            'winMapPreferences #snapshot': {
                click:      me.mapPreferencesSnapshot
            },
            'winMapPreferences #save': {
                click:      me.mapPreferencesSave
            },//Availability
            'pnlGMap #add': {
                click: me.mapDynamicClientAdd
            },
            'winMapDynamicClientAdd #save': {
                click: me.mapDynamicClientAddSubmit
            },
            'pnlGMap #edit': {
                click:  function(){
                    Ext.Msg.alert(
                        i18n('sEdit_a_marker'), 
                        i18n('sSimply_drag_a_marker_to_a_different_postition_and_click_the_save_button_in_the_info_window')
                    );
                }
            },
            'pnlGMap #delete': {
                click:  function(){
                    Ext.Msg.alert(
                        i18n('sDelete_a_marker'), 
                        i18n('sSimply_drag_a_marker_to_a_different_postition_and_click_the_delete_button_in_the_info_window')
                    );
                }
            },
            '#pnlMapsEdit #cancel': {
                click: me.btnMapCancel
            },
            '#pnlMapsEdit #delete': {
                click: me.btnMapDelete
            },
            '#pnlMapsEdit #save': {
                click: me.btnMapSave
            },
            '#tabDataLimit #chkDataLimitActive' : {
                change:     me.chkDataLimitActiveChange
            },
            '#tabDataLimit #chkDailyDataLimitActive' : {
                change:     me.chkDailyDataLimitActiveChange
            }
            
        });
    },
    appClose:   function(){
        var me          = this;
        me.populated    = false;
        if(me.autoReload != undefined){
            clearInterval(me.autoReload);   //Always clear
        }
       
        if(me.autoReloadUnknownDynamicClients != undefined){
            clearInterval(me.autoReloadUnknownDynamicClients);
        }
    },
    gridActivate: function(p){
        var me = this;
        if(p.getXType() == 'gridUnknownDynamicClients'){
            p.getStore().load();
        }else{
            var g = p.down('grid');
            g.getStore().load();
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
    add: function(button){    
        var me      = this;
        var tab     = button.up("tabpanel");
        var store   = tab.down("gridDynamicClients").getStore();
        Ext.Ajax.request({
            url: me.getUrlApChildCheck(),
            method: 'GET',
            success: function(response){
                var jsonData    = Ext.JSON.decode(response.responseText);
                if(jsonData.success){
                        
                    if(jsonData.items.tree == true){
                        if(!Ext.WindowManager.get('winDynamicClientAddWizardId')){
                            var w = Ext.widget('winDynamicClientAddWizard',{id:'winDynamicClientAddWizardId',store: store});
                            w.show();         
                        }
                    }else{
                        if(!Ext.WindowManager.get('winDynamicClientAddWizardId')){
                            var w = Ext.widget('winDynamicClientAddWizard',
                                {
                                    id          :'winDynamicClientAddWizardId',
                                    startScreen : 'scrnData',
                                    user_id     :'0',
                                    owner       : i18n('sLogged_in_user'), 
                                    no_tree     : true,
                                    store       : store
                                }
                            );
                            w.show();        
                        }
                    }
                }   
            },
            scope: me
        });

    },
    btnTreeNext: function(button){
        var me = this;
        var tree = button.up('treepanel');
        //Get selection:
        var sr = tree.getSelectionModel().getLastSelected();
        if(sr){    
            var win = button.up('window');
            win.down('#owner').setValue(sr.get('username'));
            win.down('#user_id').setValue(sr.getId());
            win.getLayout().setActiveItem('scrnData');
        }else{
            Ext.ux.Toaster.msg(
                        i18n('sSelect_an_owner'),
                        i18n('sFirst_select_an_Access_Provider_who_will_be_the_owner'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }
    },
    btnDataPrev:  function(button){
        var me      = this;
        var win     = button.up('window');
        win.getLayout().setActiveItem('scrnApTree');
    },  
    btnDataNext: function(button){
        var me = this;
        var win     = button.up('window');
        var form    = button.up('form');
        var tp      = form.down('tabpanel');
        var grid    = form.down('gridRealmsForDynamicClientOwner');
        var extra_params ={};   //Get the extra params to submit with form
        var select_flag  = false;

        var chk = form.down('#chkAvailForAll');
        if(chk.getValue() == true){
            extra_params.avail_for_all = true;
        }else{
            grid.getStore().each(function(record){
                if(record.get('selected') == true){
                    select_flag = true;
                    extra_params[record.getId()] = record.get('selected');
                }
            }, me);
        }

        //If they did not select avail_for_all and NOT selected ANY realm, refuse to continue
        if(extra_params.avail_for_all == undefined){
            if(select_flag != true){
                var tp = form.down('tabpanel');
                tp.setActiveTab('tabRealms');
                Ext.ux.Toaster.msg(
                        i18n('sSelect_at_least_one_realm'),
                        i18n('sSelect_one_or_more_realms'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
                );  
                return;
            }
        }

        //Checks passed fine...      
        form.submit({
            clientValidation: true,
            url: me.getUrlAdd(),
            params: extra_params,
            success: function(form, action) {
                win.store.load();
                win.close();
               // me.getGrid().getStore().load();
                Ext.ux.Toaster.msg(
                    i18n('sNew_item_created'),
                    i18n('sItem_created_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },
            //Focus on the first tab as this is the most likely cause of error 
            failure: function(form,action,b,c){
                if(action.result.errors.username != undefined){ //This will be for OpenVPN and pptp
                    tp.setActiveTab(0);
                }else{
                    tp.setActiveTab('tabNas');
                }
                Ext.ux.formFail(form,action)
            }
        });
    },
    monitorTypeChange : function(cmb){
        var me      = this;
        var form    = cmb.up('form');
        var da      = form.down('#heartbeat_dead_after');
        var val     = cmb.getValue();
        
        if(val == 'heartbeat'){
            da.setVisible(true);
        }else{
            da.setVisible(false);
        }   
    },
    chkSessionAutoCloseChange : function(chk){
        var me      = this;
        
        var pnl     = chk.up('panel');
        var nr      = pnl.down('#nrSessionDeadTime');
        
        if(chk.getValue() == true){
            nr.setVisible(true);
        }else{
            nr.setVisible(false);
        }
    },
    chkAvailForAllChange: function(chk){
        var me      = this;
        var pnl     = chk.up('panel');
        var grid    = pnl.down("gridRealmsForDynamicClientOwner");
        if(chk.getValue() == true){
            grid.hide();
        }else{
            grid.show();
        }
    },
    chkAvailForAllChangeTab: function(chk){
        var me      = this;
        var pnl     = chk.up('panel');
        var grid    = pnl.down("gridRealmsForDynamicClientOwner");
        if(chk.getValue() == true){
            grid.hide();
            
        }else{
            grid.show();
        }
        //Clear the grid:
        grid.getStore().getProxy().setExtraParam('clear_flag',true);
        grid.getStore().load();
        grid.getStore().getProxy().setExtraParam('clear_flag',false);
    },
    gridRealmsForDynamicClientOwnerReload: function(button){
        var me      = this;
        var grid    = button.up('gridRealmsForDynamicClientOwner');
        grid.getStore().load();
    },
    gridRealmsForDynamicClientOwnerActivate: function(tab){
        var me      = this;
        var a_to_s  = tab.down('#chkAvailSub').getValue();
        var grid    = tab.down('gridRealmsForDynamicClientOwner');
        grid.getStore().getProxy().setExtraParam('owner_id',me.owner_id);
        grid.getStore().getProxy().setExtraParam('available_to_siblings',a_to_s);
        grid.getStore().load();
    },
    gridRealmsForDynamicClientOwnerChkAvailSub: function(chk){
        var me      = this;
        var a_to_s  = chk.getValue();
        var grid    = chk.up('gridRealmsForDynamicClientOwner');
        grid.getStore().getProxy().setExtraParam('owner_id',me.owner_id);
        grid.getStore().getProxy().setExtraParam('available_to_siblings',a_to_s);
        grid.getStore().load();
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
    
    edit: function(){
        var me      = this;
        var grid    = me.getGrid();

        //Find out if there was something selected
        if(grid.getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{

            var selected    =  grid.getSelectionModel().getSelection();
            var count       = selected.length;         
            Ext.each(grid.getSelectionModel().getSelection(), function(sr,index){

                //Check if the node is not already open; else open the node:
                var tp                      = grid.up('tabpanel');
                var dynamic_client_id       = sr.getId();
                var dynamic_client_tab_id   = 'dynamic_clientTab_'+dynamic_client_id;
                var nt                      = tp.down('#'+dynamic_client_tab_id);
                if(nt){
                    tp.setActiveTab(dynamic_client_tab_id); //Set focus on  Tab
                    return;
                }

                var dynamic_client_tab_name = sr.get('name');
                //Tab not there - add one
                tp.add({ 
                    title       : dynamic_client_tab_name,
                    itemId      : dynamic_client_tab_id,
                    closable    : true,
                    glyph       : Rd.config.icnEdit, 
                    layout      : 'fit',
                    tabConfig : {
                        ui : me.ui
                    }, 
                    items       : {'xtype' : 'pnlDynamicClient',dynamic_client_id: dynamic_client_id, record: sr}
                });
                tp.setActiveTab(dynamic_client_tab_id); //Set focus on Add Tab
            });
        }
    },   
    onTabDynamicClientActive: function(t){
        var me      = this;
        var form    = t.down('form');
        //get the dynamic_client_id's id
        var dynamic_client_id = t.up('pnlDynamicClient').dynamic_client_id;
        
        form.load({
            url     : me.getUrlView(), 
            method  : 'GET',
            params  : {dynamic_client_id:dynamic_client_id},
            success : function(a,b){
                if(b.result.data.show_owner == true){
                    form.down('#fcPickOwner').show();
                }else{
                    form.down('#fcPickOwner').hide();
                }
            }
        });
    },    
    btnPickOwner: function(button){
        var me             = this;
        var form           = button.up('form');
        var updateDisplay  = form.down('#displUser');
        var updateValue    = form.down('#hiddenUser'); 
		if(!Ext.WindowManager.get('winSelectOwnerId')){
            var w = Ext.widget('winSelectOwner',{id:'winSelectOwnerId',updateDisplay:updateDisplay,updateValue:updateValue});
            w.show();       
        }  
    },   
    saveDynamicClient : function(button){

        var me              = this;
        var form            = button.up('form');
        var tab             = button.up('#tabDynamicClient');
        var dynamic_client  = button.up('pnlDynamicClient').dynamic_client_id;
        //Checks passed fine...      
        form.submit({
            clientValidation    : true,
            url                 : me.getUrlEdit(),
            params              : {id: dynamic_client},
            success             : function(form, action) {
                me.reload();
                Ext.ux.Toaster.msg(
                    i18n('sItems_modified'),
                    i18n('sItems_modified_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
                me.onTabDynamicClientActive(tab);
            },
            failure             : Ext.ux.formFail
        });
    },
    
    tabRealmsActivate : function(tab){
        var me      = this;
        var gridR   = tab.down('gridRealmsForDynamicClientOwner');
        gridR.getStore().load();
    },
    
    tabPhotoActivate: function(tab){
        var me      = this;
        var pnl_n   = tab.up('pnlDynamicClient');
        Ext.Ajax.request({
            url: me.getUrlViewPhoto(),
            method: 'GET',
            params: {'id' : pnl_n.dynamic_client_id },
            success: function(response){
                var jsonData    = Ext.JSON.decode(response.responseText);
                if(jsonData.success){     
                    var img = tab.down("cmpImg");
                    var img_url = me.getUrlPhotoBase()+jsonData.data.photo_file_name;
                    img.setImage(img_url);
                }   
            },
            scope: me
        });
    },
    photoSave: function(button){
        var me      = this;
        var form    = button.up('form');
        var pnl_n   = form.up('pnlDynamicClient');
        var pnlNphoto = pnl_n.down('pnlDynamicClientPhoto');
        form.submit({
            clientValidation: true,
            waitMsg: 'Uploading your photo...',
            url: me.getUrlUploadPhoto(),
            params: {'id' : pnl_n.dynamic_client_id },
            success: function(form, action) {              
                if(action.result.success){ 
                    var new_img = action.result.photo_file_name;    
                    var img = pnlNphoto.down("cmpImg");
                    var img_url = me.getUrlPhotoBase()+new_img;
                    img.setImage(img_url);
                } 
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
    photoCancel: function(button){
        var me      = this;
        var form    = button.up('form');
        form.getForm().reset();
    },
    
    tabAvailabilityActivate : function(tab){
        var me      = this;
        tab.getStore().load();
    },
    gridDynamicClientsAvailabilityReload: function(button){
        var me      = this;       
        var grid    = button.up('gridDynamicClientsAvailability');
        var tz      = grid.down('cmbTimezones');
        if(tz){   //Only if this component already exists
            grid.getStore().getProxy().setExtraParam('timezone_id',tz.getValue());
            grid.getStore().load();
        }
    },
    gridDynamicClientsAvailabilityDelete:   function(button){
        var me      = this;  
        var grid    = button.up('gridDynamicClientsAvailability');   
        //Find out if there was something selected
        if(grid.getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item_to_delete'),
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
                            grid.getStore().load(); //Reload from server since the sync was not good  
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
    
    //RAW
    tabRawActivate : function(tab){
        var me      = this;
        tab.getStore().load();
    },
    gridRawReload: function(button){
        var me      = this;
        var grid    = button.up('gridDynamicClientsAvailableRaw');
        var tz      = grid.down('cmbTimezones'); 
        if(tz){   //Only if this component already exists    
            grid.getStore().getProxy().setExtraParam('timezone_id',tz.getValue());
            grid.getStore().load();
        }
    },
    gridRawDelete:   function(button){
        var me      = this;  
        var grid    = button.up('gridDynamicClientsAvailableRaw');   
        //Find out if there was something selected
        if(grid.getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item_to_delete'),
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
                            grid.getStore().load(); //Reload from server since the sync was not good  
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
    //END RAW
       
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
    
    //____ Unknown Dynamic Clients ____
    gridUnknownDynamicClientsReload: function(button){
        var me  = this;
        var g = button.up('gridUnknownDynamicClients');
        g.getStore().load();
    },
    reloadUnknownDynamicClientsOptionClick: function(menu_item){
        var me      = this;
        var n       = menu_item.getItemId();
        var b       = menu_item.up('button'); 
        var interval= 30000; //default
        clearInterval(me.autoReloadUnknownDynamicClients);   //Always clear
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
        me.autoReloadUnknownDynamicClients = setInterval(function(){       
            me.gridUnknownDynamicClientsReload(b);
        }, interval);  
    },
    attachAttachUnknownDynamicClient: function(button){
        var me      = this;
        var tab     = button.up("tabpanel");
        var store   = tab.down("gridUnknownDynamicClients").getStore();
        if(tab.down("gridUnknownDynamicClients").getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            var sr              = tab.down("gridUnknownDynamicClients").getSelectionModel().getLastSelected();
            var id              = sr.getId();
			var nasidentifier   = sr.get('nasidentifier');
            var calledstationid = sr.get('calledstationid');
  
			//Determine if we can show a power bar or not.
			var hide_power = true; //FIXME To be fiexed with real value from mesh
			if(!Ext.WindowManager.get('winAttachUnknownDynamicClientId')){
                var w = Ext.widget('winAttachUnknownDynamicClient',
                {
                    id              :'winAttachUnknownDynamicClientId',
                    store           : store,
					nasidentifier   : nasidentifier,
					calledstationid : calledstationid,
					unknown_dynamic_client_id : id	
                });
                w.show()        
            }
        }
    },
	delUnknownDynamicClient:   function(button){
        var me      = this;
        var tab     = button.up("tabpanel");
        var grid    = tab.down("gridUnknownDynamicClients");
    
        //Find out if there was something selected
        if(grid.getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item_to_delete'),
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
      
    graph: function(button){
        var me = this;  
        //Find out if there was something selected
        if(me.getGrid().getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            //Check if the node is not already open; else open the node:
            var tp      = me.getGrid().up('tabpanel');
            var sr      = me.getGrid().getSelectionModel().getLastSelected();
            var id      = sr.getId();
            var tab_id  = 'dynamicClientTabGraph_'+id;
            var nt      = tp.down('#'+tab_id);
            if(nt){
                tp.setActiveTab(tab_id); //Set focus on  Tab
                return;
            }
            var dd              = me.application.getDashboardData();
            var timezone_id     = dd.user.timezone_id;

            var tab_name = sr.get('name');
            //Tab not there - add one
            tp.add({ 
                title               : tab_name,
                itemId              : tab_id,
                closable            : true,
                glyph               : Rd.config.icnGraph, 
                xtype               : 'pnlDynamicClientGraphs',
                timezone_id         : timezone_id,
                dynamic_client_id   : id,
                tabConfig           : {
                    ui : me.ui
                }
            });
            tp.setActiveTab(tab_id); //Set focus on Add Tab 
        }
    },
    //____ MAP ____
    mapLoadApi:   function(button){
        var me          = this;
        Ext.ux.Toaster.msg(
	        'Loading Google Maps API',
	        'Please be patient....',
	        Ext.ux.Constants.clsInfo,
	        Ext.ux.Constants.msgInfo
	    );
        
        Ext.Loader.loadScript({
            url: 'https://www.google.com/jsapi',                    // URL of script
            scope: this,                   // scope of callbacks
            onLoad: function() {           // callback fn when script is loaded
                google.load("maps", "3", {
                    other_params:"sensor=false",
                    callback : function(){
                    // Google Maps are loaded. Place your code here
                        me.mapCreatePanel(button);
                }
            });
            },
            onError: function() {          // callback fn if load fails 
                console.log("Error loading Google script");
            } 
        });
        
    },

    mapCreatePanel : function(button){

        var me = this
        var grid        = button.up('gridDynamicClients');
        //Check if the node is not already open; else open the node:
        var tp          = grid.up('tabpanel');
        var map_tab_id  = 'mapTab';
        var nt          = tp.down('#'+map_tab_id);
        if(nt){
            tp.setActiveTab(map_tab_id); //Set focus on  Tab
            return;
        }

        var map_tab_name = i18n("sGoogle_Maps");

        //We need to fetch the Preferences for this user's Google Maps map
        Ext.Ajax.request({
            url: me.getUrlViewMapPref(),
            method: 'GET',
            success: function(response){
                var jsonData    = Ext.JSON.decode(response.responseText);
                if(jsonData.success){     
                  // console.log(jsonData);
                    //___Build this tab based on the preferences returned___
                    tp.add({ 
                        title   : map_tab_name,
                        itemId  : map_tab_id,
                        closable: true,
                        iconCls : 'map',
                        glyph   : Rd.config.icnMap, 
                        layout  : 'fit',
                        tabConfig : {
                            ui : me.ui
                        }, 
                        items   : {
                                xtype: 'pnlGMap',
                                store:  me.getStore('sDynamicClients'),
                                mapOptions: {zoom: jsonData.data.zoom, mapTypeId: google.maps.MapTypeId[jsonData.data.type] },
                                centerLatLng: {lat:jsonData.data.lat,lng:jsonData.data.lng},
                                markers: []
                            }
                    });
                    tp.setActiveTab(map_tab_id); //Set focus on Add Tab
                    //____________________________________________________
                }   
            },
            scope: me
        });
    },
    mapPreferences: function(button){
        var me = this;
        if(!Ext.WindowManager.get('winMapPreferencesId')){
            var w = Ext.widget('winMapPreferences',{id:'winMapPreferencesId'});
            w.show();
            //We need to load this widget's form with the latest data:
            w.down('form').load({url:me.getUrlViewMapPref(), method:'GET'});
       }   
    },
    mapPreferencesSnapshot: function(button){

        var me      = this;
        var form    = button.up('form');
        var pnl     = me.getPnlGMap();
        var zoom    = pnl.gmap.getZoom();
        var type    = pnl.gmap.getMapTypeId();
        var ll      = pnl.gmap.getCenter();
        var lat     = ll.lat();
        var lng     = ll.lng();

        form.down('#lat').setValue(lat);
        form.down('#lng').setValue(lng);
        form.down('#zoom').setValue(zoom);
        form.down('#type').setValue(type.toUpperCase());
        
        //console.log(" zoom "+zoom+" type "+type+ " lat "+lat+" lng "+lng);
    },
    mapPreferencesSave: function(button){

        var me      = this;
        var form    = button.up('form');
        var win     = button.up('window');
       
        form.submit({
            clientValidation: true,
            url: me.getUrlEditMapPref(),
            success: function(form, action) {
                win.close();
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
    mapDynamicClientAdd: function(button){
        var me = this;
        if(!Ext.WindowManager.get('winMapDynamicClientAddId')){
            var w = Ext.widget('winMapDynamicClientAdd',{id:'winMapDynamicClientAddId'});
            w.show();       
       }   
    },
    mapDynamicClientAddSubmit: function(button){
        var me      = this;
        var win     = button.up('window');
        var dc      = win.down('cmbDynamicClientsAddMap');
        var id      = dc.getValue();
        var record  = dc.getStore().getById(id);
        win.close();

        var tab_panel = me.getGrid().up('tabpanel');
        var map_tab   = tab_panel.down('#mapTab');
        if(map_tab != null){
            var map_panel = map_tab.down('gmappanel');
            //We need to get the center of the map:
            var m_center = map_panel.gmap.getCenter();
            var sel_marker = map_panel.addMarker({
                lat         : m_center.lat(), 
                lng         : m_center.lng(),
                icon        : "resources/images/map_markers/yellow-dot.png",
                draggable   : true, 
                title       : "New Marker",
                listeners   : {
                    dragend: function(){
                        me.dragEnd(record,map_panel,sel_marker);
                    },
                    dragstart: function(){
                        map_panel.addwindow.close();
                        me.dragStart(record,map_panel,sel_marker);
                    }
                }
            });
            map_panel.addwindow.open(map_panel.gmap, sel_marker);
        }
    },
    
    markerClick: function(record,map_panel,sel_marker){
        var me = this;
        var ip = record.get('nasname');
        var n  = record.get('shortname');
        map_panel.marker_record = record;

        //See if the pnlMapsInfo exists
        //We have to do it here in order to prevent the domready event to fire twice
        var qr =Ext.ComponentQuery.query('#pnlMapsInfo');
        if(qr[0]){
           // qr[0].down('#tabMapInfo').update(record.data);

            //Status
            var t_i_s = "N/A";
            if(record.get('status') != 'unknown'){
                if(record.get('status') == 'up'){
                    var s = i18n("sUp");
                }
                if(record.get('status') == 'down'){
                    var s = i18n("sDown");
                }

                t_i_s           = s+" "+Ext.ux.secondsToHuman(record.get('status_time'));;
            }

            var d  = Ext.apply({
                time_in_state   : t_i_s
            }, record.data);

            qr[0].down('#tabMapInfo').update(d);

            var url_path = me.getUrlPhotoBase()+record.get('photo_file_name');
            qr[0].down('#tabMapPhoto').update({image:url_path});
           // qr[0].doLayout();
        }
        map_panel.infowindow.open(map_panel.gmap,sel_marker); 
    },
    dragStart: function(record,map_panel,sel_marker){
        var me = this;
        me.lastMovedMarker  = sel_marker;
        me.lastOrigPosition = sel_marker.getPosition();
        me.editWindow 		= map_panel.editwindow;
    },
    dragEnd: function(record,map_panel,sel_marker){
        var me = this;
        var l_l = sel_marker.getPosition();
        map_panel.new_lng = l_l.lng();
        map_panel.new_lat = l_l.lat();
        map_panel.editwindow.open(map_panel.gmap, sel_marker);
        me.lastLng    = l_l.lng();
        me.lastLat    = l_l.lat();
        me.lastDragId = record.getId();
    },
    btnMapCancel: function(button){
        var me = this;
        me.editWindow.close();
        me.lastMovedMarker.setPosition(me.lastOrigPosition);
    },
    btnMapDelete: function(button){
        var me = this;
        Ext.Ajax.request({
            url: me.getUrlMapDelete(),
            method: 'GET',
            params: {
                id: me.lastDragId
            },
            success: function(response){
                var jsonData    = Ext.JSON.decode(response.responseText);
                if(jsonData.success){     
                    me.editWindow.close();
                    me.reload();
                    Ext.ux.Toaster.msg(
                        i18n('sItem_deleted'),
                        i18n('sItem_deleted_fine'),
                        Ext.ux.Constants.clsInfo,
                        Ext.ux.Constants.msgInfo
                    );
                }   
            },
            scope: me
        });
    },
    btnMapSave: function(button){
        var me = this;
        Ext.Ajax.request({
            url: me.getUrlMapSave(),
            method: 'GET',
            params: {
                id: me.lastDragId,
                lat: me.lastLat,
                lon: me.lastLng
            },
            success: function(response){
                var jsonData    = Ext.JSON.decode(response.responseText);
                if(jsonData.success){     
                    me.editWindow.close();
                    me.reload();
                    Ext.ux.Toaster.msg(
                        i18n('sItem_updated'),
                        i18n('sItem_updated_fine'),
                        Ext.ux.Constants.clsInfo,
                        Ext.ux.Constants.msgInfo
                    );
                }   
            },
            scope: me
        });
    },  
    available: function(b){
        var me = this;  
        //Find out if there was something selected
        if(me.getGrid().getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            //Check if the node is not already open; else open the node:
            var tp      = me.getGrid().up('tabpanel');
            var sr      = me.getGrid().getSelectionModel().getLastSelected();
            var id      = sr.getId();
            var tab_id  = 'dynamicClientTabAvailable_'+id;
            var nt      = tp.down('#'+tab_id);
            if(nt){
                tp.setActiveTab(tab_id); //Set focus on  Tab
                return;
            }

            var tab_name = sr.get('name');
            //Tab not there - add one
            tp.add({ 
                title               : tab_name,
                itemId              : tab_id,
                closable            : true,
                glyph               : Rd.config.icnWatch, 
                xtype               : 'pnlDynamicClientAvailable',
                dynamic_client_id   : id,
                tabConfig           : {
                    ui : me.ui
                }
            });
            tp.setActiveTab(tab_id); //Set focus on Add Tab 
        }
    },
    
    chkDataLimitActiveChange: function(chk){
        var me      = this;
        var form    = chk.up('form');
        var amount  = form.down('#nrDataLimitAmount');
        var unit    = form.down('#cmbDataLimitUnit');
        var cap     = form.down('#cmbDataLimitCap');
        var reset   = form.down('#nrDataLimitResetOn');
        var hour    = form.down('#nrDataLimitResetHour');
        var minute  = form.down('#nrDataLimitResetMinute');
        if(chk.getValue()){
            amount.setVisible(true);
            amount.setDisabled(false);
            unit.setVisible(true);
            unit.setDisabled(false);
            cap.setVisible(true);
            cap.setDisabled(false);
            reset.setVisible(true);
            reset.setDisabled(false);       
            hour.setVisible(true);
            hour.setDisabled(false);
            minute.setVisible(true);
            minute.setDisabled(false);
        }else{
            amount.setVisible(false);
            amount.setDisabled(true);
            unit.setVisible(false);
            unit.setDisabled(true);
            cap.setVisible(false);
            cap.setDisabled(true);
            reset.setVisible(false);
            reset.setDisabled(true);
            hour.setVisible(false);
            hour.setDisabled(true);
            minute.setVisible(false);
            minute.setDisabled(true);
        }
    },
    chkDailyDataLimitActiveChange: function(chk){
        var me      = this;
        var form    = chk.up('form');
        var amount  = form.down('#nrDailyDataLimitAmount');
        var unit    = form.down('#cmbDailyDataLimitUnit');
        var cap     = form.down('#cmbDailyDataLimitCap');
        var hour    = form.down('#nrDailyDataLimitResetHour');
        var minute  = form.down('#nrDailyDataLimitResetMinute');
        if(chk.getValue()){
            amount.setVisible(true);
            amount.setDisabled(false);
            unit.setVisible(true);
            unit.setDisabled(false);
            cap.setVisible(true);
            cap.setDisabled(false);
            hour.setVisible(true);
            hour.setDisabled(false);
            minute.setVisible(true);
            minute.setDisabled(false);
        }else{
            amount.setVisible(false);
            amount.setDisabled(true);
            unit.setVisible(false);
            unit.setDisabled(true);
            cap.setVisible(false);
            cap.setDisabled(true);
            hour.setVisible(false);
            hour.setDisabled(true);
            minute.setVisible(false);
            minute.setDisabled(true);
        }
    },
    unknown_clients: function(b){
        var me = this;
        tp = b.up('tabpanel');
        var tab  = tp.items.findBy(function (tab){
            return tab.getXType() === 'gridUnknownDynamicClients';
        });
        
        if (!tab){
            tab = tp.insert(1,{
                xtype   : 'gridUnknownDynamicClients',
                padding : Rd.config.gridPadding,
                border  : false,
                glyph   : Rd.config.icnQuestion,
                title   : 'Unknown Clients',
                plain	: true,
                closable: true, 
                tabConfig: {
                    ui: Rd.config.tabDevices
                }
            });
            tab.on({activate : me.gridActivate,scope: me}); 
        }        
        tp.setActiveTab(tab);  
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

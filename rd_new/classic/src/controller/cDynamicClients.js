Ext.define('Rd.controller.cDynamicClients', {
    extend: 'Ext.app.Controller',
    actionIndex: function(pnl,itemId){
        var me      = this;
        var item    = pnl.down('#'+itemId);
        var added   = false;
        if(!item){
            pnl.add({ 
                itemId : itemId,
                xtype  : 'gridDynamicClients',
                border : false,
                plain  : true,
                padding : '0 3 0 3'
            });
            pnl.on({activate : me.gridActivate,scope: me});
            added = true;
        }
        return added;      
    },
    views:  [
        'dynamicClients.gridDynamicClients',
        'dynamicClients.winDynamicClientAdd',
        'dynamicClients.pnlDynamicClientDynamicClient',
        'dynamicClients.gridUnknownDynamicClients',
        'dynamicClients.winAttachUnknownDynamicClient',
        'components.cmbTimezones',
        'dynamicClients.pnlDynamicClient',
        'dynamicClients.pnlRealmsForDynamicClientCloud',
        'dynamicClients.gridRealmsForDynamicClientCloud',
        'dynamicClients.pnlDynamicClientPhoto',
        'components.pnlUsageGraph',
        'dynamicClients.pnlDynamicClientGraphs'
    ],
    stores: ['sDynamicClients', 'sUnknownDynamicClients',],
    models: [ 'mDynamicClient','mRealmForDynamicClientCloud', 'mUnknownDynamicClient','mDynamicClientState','mUserStat'],
    selectedRecord: null,
    config: {
        urlExportCsv    : '/cake4/rd_cake/dynamic-clients/export_csv',
        urlAdd          : '/cake4/rd_cake/dynamic-clients/add.json',
        urlDelete       : '/cake4/rd_cake/dynamic-clients/delete.json',
		urlEdit         : '/cake4/rd_cake/dynamic-clients/edit.json',
		urlView         : '/cake4/rd_cake/dynamic-clients/view.json',
		urlViewPhoto    : '/cake4/rd_cake/dynamic-clients/view_photo.json',
        urlPhotoBase    : '/cake4/rd_cake/img/nas/',
        urlUploadPhoto  : '/cake4/rd_cake/dynamic-clients/upload_photo.json'
    },
    refs: [
        {  ref: 'grid',     selector: 'gridDynamicClients'  }  
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
            'pnlDynamicClient #tabDynamicClient #save' : {
                click: me.saveDynamicClient
            },            
            'pnlRealmsForDynamicClientCloud #chkAvailForAll' :{
                change:     me.chkAvailForAllChangeTab
            },
            'pnlRealmsForDynamicClientCloud gridRealmsForDynamicClientCloud #reload' :{
                click:      me.gridRealmsForDynamicClientCloudReload
            },
            'pnlDynamicClient #tabRealmsDc': {
                activate:   me.tabRealmsActivateDc
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
            
            'gridDynamicClients #graph'   : {
                click:      me.graph
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
            'winDynamicClientAdd #btnDataNext' : {
                click:  me.btnDataNext
            },
            'winDynamicClientAdd #monitorType': {
                change: me.monitorTypeChange
            },
            'winDynamicClientAdd #chkSessionAutoClose': {
                change:     me.chkSessionAutoCloseChange
            },
            'winDynamicClientAdd gridRealmsForDynamicClientCloud #reload': {
                click:      me.gridRealmsForDynamicClientCloudReload
            },
            'winDynamicClientAdd #tabRealms': {
                activate:      me.gridRealmsForDynamicClientCloudActivate
            }, 
            'winDynamicClientAdd #tabRealms #chkAvailForAll': {
                change:     me.chkAvailForAllChange
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
            'winAttachUnknownDynamicClient gridRealmsForDynamicClientCloud #reload': {
                click:      me.gridRealmsForDynamicClientCloudReload
            },
            'winAttachUnknownDynamicClient #tabRealms': {
                activate:      me.gridRealmsForDynamicClientCloudActivate
            }, 
            'winAttachUnknownDynamicClient #tabRealms #chkAvailForAll': {
                change:     me.chkAvailForAllChange
            },
			'gridUnknownDynamicClients #delete': {
                click: me.delUnknownDynamicClient
            },
            'pnlDynamicClient #tabDynamicClient #chkDataLimitActive' : {
                change:     me.chkDataLimitActiveChange
            },
            'pnlDynamicClient #tabDynamicClient #chkDailyDataLimitActive' : {
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
        var me 		= this;
        var c_name 	= me.application.getCloudName();
        var c_id	= me.application.getCloudId()
        if(!Ext.WindowManager.get('winDynamicClientAddId')){
            var w = Ext.widget('winDynamicClientAdd',{id:'winDynamicClientAddId',cloudId: c_id, cloudName: c_name,store: store});
            w.show();         
        }
    },
    btnDataNext: function(button){
        var me = this;
        var win     = button.up('window');
        var form    = button.up('form');
        var tp      = form.down('tabpanel');
        var grid    = form.down('gridRealmsForDynamicClientCloud');
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
        var grid    = pnl.down("gridRealmsForDynamicClientCloud");
        if(chk.getValue() == true){
            grid.hide();
        }else{
            grid.show();
        }
    },
    chkAvailForAllChangeTab: function(chk){
        var me      = this;
        var pnl     = chk.up('panel');
        var grid    = pnl.down("gridRealmsForDynamicClientCloud");
        if(chk.getValue() == true){
            grid.hide();
            grid.getStore().getProxy().setExtraParam('clear_flag',true);
            
        }else{
            grid.show();
            grid.getStore().getProxy().setExtraParam('clear_flag',false);
        }
        grid.getStore().load();
    },
    gridRealmsForDynamicClientCloudReload: function(button){
        var me      = this;
        var grid    = button.up('gridRealmsForDynamicClientCloud');
        grid.getStore().load();
    },
    gridRealmsForDynamicClientCloudActivate: function(tab){
        var me      = this;
        var grid    = tab.down('gridRealmsForDynamicClientCloud');
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
        var form    = t;
        //get the dynamic_client_id's id
        var dynamic_client_id = t.up('pnlDynamicClient').dynamic_client_id;     
        form.load({
            url     : me.getUrlView(), 
            method  : 'GET',
            params  : {dynamic_client_id:dynamic_client_id},
            success : function(a,b){
                
            }
        });
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
    
    tabRealmsActivateDc : function(tab){
        var me      = this;
        var gridR   = tab.down('gridRealmsForDynamicClientCloud');
        gridR.getStore().load();
    },
    
    tabPhotoActivate: function(tab){
    	var me      = this;
    	var pnl_n   = tab.up('pnlDynamicClient');   	
        var id      = pnl_n.dynamic_client_id 
        var p_img   = tab.down('#pnlImg');
        Ext.Ajax.request({
            url: me.getUrlViewPhoto(),
            method: 'GET',
            params: {id : id },
            success: function(response){
                var jsonData    = Ext.JSON.decode(response.responseText);
                if(jsonData.success){
                    var img_url = me.getUrlPhotoBase()+jsonData.data.photo_file_name;
                    p_img.update({image:img_url});
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
                    var p_img 	= pnlNphoto.down("#pnlImg");
                    var img_url = me.getUrlPhotoBase()+new_img;
                    p_img.update({image:img_url});
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

Ext.define('Rd.controller.cAccessPointEdits', {
    extend: 'Ext.app.Controller',
    views:  [
        'aps.pnlAccessPointEdit',
        'aps.pnlApGeneral',
        'aps.gridAccessPointEntries', 
        'aps.gridAccessPointExits',
        'aps.pnlAccessPointCommonSettings',    
        'aps.gridAccessPointAps',
        
        'aps.winAccessPointAddEntry',   
        'components.cmbEncryptionOptions',
        'aps.winAccessPointEditEntry',
             
        'aps.winAccessPointAddExit',    
        'aps.tagAccessPointEntryPoints',
        'aps.winAccessPointEditExit',
        
        'aps.cmbApHardwareModels',
        'aps.pnlAccessPointAddEditAp', 
        
        'components.cmbTimezones',      
        'components.cmbCountries',
        'components.cmbFiveGigChannels',
        'components.cmbRealm',
        'components.cmbMacFilter',
        'components.cmbPermanentUser'
    ],
    stores      : [	
		'sAccessPointEntries', 'sAccessPointExits', 	'sAps', 'sAccessPointEntryPoints', 'sRealms','sClouds'
    ],
    models      : [ 
		'mAccessPointEntry',  	'mAccessPointExit', 	'mAp',  'mAccessPointEntryPoint', 'mRealm', 'mPermanentUser'
    ],
    config      : {  
        urlAddEntry:        '/cake3/rd_cake/ap-profiles/ap_profile_entry_add.json',
        urlViewEntry:       '/cake3/rd_cake/ap-profiles/ap_profile_entry_view.json',
        urlEditEntry:       '/cake3/rd_cake/ap-profiles/ap_profile_entry_edit.json',
        
       
        urlExitAddDefaults: '/cake3/rd_cake/ap-profiles/ap_profile_exit_add_defaults.json',
        urlAddExit:         '/cake3/rd_cake/ap-profiles/ap_profile_exit_add.json',
        urlEditExit:        '/cake3/rd_cake/ap-profiles/ap_profile_exit_edit.json',
         
        urlViewApCommonSettings:'/cake3/rd_cake/ap-profiles/ap_common_settings_view.json',
        urlEditApCommonSettings:'/cake3/rd_cake/ap-profiles/ap_common_settings_edit.json',    
		urlMapPrefView		: '/cake3/rd_cake/meshes/map_pref_view.json',
		urlMapPrefEdit		: '/cake3/rd_cake/meshes/map_pref_edit.json',
		urlMapSave			: '/cake3/rd_cake/meshes/map_node_save.json',
		urlMapDelete		: '/cake3/rd_cake/meshes/map_node_delete.json',
		urlMeshNodes		: '/cake3/rd_cake/meshes/mesh_nodes_index.json',
		urlBlueMark 		: 'resources/images/map_markers/blue-dot.png',
		
		urlAdvancedSettingsForModel : '/cake3/rd_cake/ap-profiles/advanced_settings_for_model.json',
		urlViewApProfileSettings    : '/cake3/rd_cake/ap-profiles/ap-profile-settings-view.json',
		urlEditApProfileSettings    :'/cake3/rd_cake/ap-profiles/ap-profile-settings-edit.json',
    },
    refs: [
    	{  ref: 'editEntryWin', 	selector: 'winAccessPointEditEntry'},
        {  ref: 'editExitWin',  	selector: 'winAccessPointEditExit' },
        {  ref: 'tabAccessPoints',  selector: '#tabAccessPoints'      } 
    ],
    init: function() {
        var me = this;
        
        if (me.inited) {
            return;
        }
        me.inited = true;
        
        
        me.control({
			'gridAccessPointEntries #reload': {
                click:  me.reloadEntry
            },
            'gridAccessPointEntries #add': {
                click:  me.addEntry
            },
            'gridAccessPointEntries #edit': {
                click:  me.editEntry
            },
            'winAccessPointAddEntry cmbEncryptionOptions': {
                change: me.cmbEncryptionChange
            },
            'winAccessPointAddEntry #chk_auto_nasid': {
                change: me.chkAutoNasidChange
            },
            'winAccessPointAddEntry #chk_maxassoc': {
                change: me.chkMaxassocChange
            },
            'winAccessPointAddEntry cmbMacFilter': {
                change: me.cmbMacFilterChange
            },
            'winAccessPointAddEntry #save': {
                click: me.btnAddEntrySave
            },
            'gridAccessPointEntries #delete': {
                click: me.delEntry
            },
            'winAccessPointEditEntry': {
                beforeshow:      me.loadEntry
            },
            'winAccessPointEditEntry cmbEncryptionOptions': {
                change: me.cmbEncryptionChange
            },
            'winAccessPointEditEntry #chk_auto_nasid': {
                change: me.chkAutoNasidChange
            },
            'winAccessPointEditEntry #chk_maxassoc': {
                change: me.chkMaxassocChange
            },
            'winAccessPointEditEntry cmbMacFilter': {
                change: me.cmbMacFilterChange
            },
            'winAccessPointEditEntry #save': {
                click: me.btnEditEntrySave
            },  
            'gridAccessPointExits #reload': {
                click:  me.reloadExit
            },
            'gridAccessPointExits #add': {
                click:  me.addExit
            },
            'winAccessPointAddExit': {
                beforeshow:      me.loadAddExit
            },
            'winAccessPointAddExit #btnTypeNext' : {
                click:  me.btnExitTypeNext
            },
            'winAccessPointAddExit #btnDataPrev' : {
                click:  me.btnExitDataPrev
            },
            'winAccessPointAddExit #save' : {
                click:  me.btnAddExitSave
            },
            'gridAccessPointExits #delete': {
                click: me.delExit
            },
            'gridAccessPointExits #edit': {
                click:  me.editExit
            },
            'winAccessPointEditExit #save': {
                click: me.btnEditExitSave
            },//Common node settings
             //Enable the CoovaChilli transparent proxy settings
            '#chkProxyEnable' : {
                change:  me.chkProxyEnableChange
            },
            'pnlAccessPointEdit #tabApGeneral' : {
                activate:      me.frmApGeneralLoad
            },
            'pnlAccessPointEdit #tabApGeneral #save': {
                click:  me.btnApGeneralSave
            },
            'pnlAccessPointEdit #tabApGeneral #btnPickOwner': {
                click:  me.btnApGeneralPickOwner
            },      
            'pnlAccessPointEdit #tabAccessPointCommonSettings' : {
                activate:      me.frmApCommonSettingsLoad
            },
            'pnlAccessPointCommonSettings  #chkEnableSchedules' : {
                change:  me.chkEnableSchedulesChange
            },
            'pnlAccessPointCommonSettings #save': {
                click:  me.btnApCommonSettingsSave
            },
            			
            //Here nodes start
            'gridAccessPointAps #reload': {
                click:  me.reloadAps
            },
            'gridAccessPointAps #add': {
                click:  me.addAp
            }, 
           
            'gridAccessPointAps #delete': {
                click: me.delAp
            },
            'gridAccessPointAps #edit': {
                click:  me.editAp
            },
            'winAccessPointAddExit #chkNasClient' : {
				change	: me.chkNasClientChange
			},
			'winAccessPointEditExit #chkNasClient' : {
				change	: me.chkNasClientChange
			},  
            'winAccessPointAddExit #chkLoginPage' : {
				change	: me.chkLoginPageChange
			},
			'winAccessPointEditExit #chkLoginPage' : {
				change	: me.chkLoginPageChange
			}
        });
    },
    actionIndex: function(ap_profile_id,name){
        var me              = this;
        var id		        = 'tabAccessPoint'+ ap_profile_id;
        var tabAccessPoints = me.getTabAccessPoints();
        var newTab  = tabAccessPoints.items.findBy(
            function (tab){
                return tab.getItemId() === id;
            });
         
        if (!newTab){
            newTab = tabAccessPoints.add({
                glyph   : Rd.config.icnEdit, 
                title   : name,
                closable: true,
                layout  : 'fit',
                xtype   : 'pnlAccessPointEdit',
                itemId  : id,
                ap_profile_id : ap_profile_id
            });
        }    
        tabAccessPoints.setActiveTab(newTab);
    },
	reloadEntry: function(button){
        var me      = this;
        var pnl     = button.up("pnlAccessPointEdit");//
        var entGrid = pnl.down("gridAccessPointEntries");
        entGrid.getStore().reload();
    },
    addEntry: function(button){
        var me      = this;
        var pnl     = button.up("pnlAccessPointEdit");
        var store   = pnl.down("gridAccessPointEntries").getStore();
       
        if(!Ext.WindowManager.get('winAccessPointAddEntryId')){
            var w = Ext.widget('winAccessPointAddEntry',
            {
                id          :'winAccessPointAddEntryId',
                store       : store,
                apProfileId : pnl.ap_profile_id
            });
            w.show();      
        }
    },
    chkAutoNasidChange: function(chk){
        var me      = this;
        var form    = chk.up('form');
        var nasid   = form.down('#nasid');
        var acct    = form.down('#chk_accounting');
        var enc     =  form.down('cmbEncryptionOptions').getValue();
        if((enc == 'wpa')|(enc == 'wpa2')){
            if(acct){
                if(chk.getValue()){
                    nasid.setVisible(false);
                    nasid.setDisabled(true);  
                }else{
                    nasid.setVisible(true);
                    nasid.setDisabled(false);
                }  
            }
        }else{
            nasid.setVisible(false);
            nasid.setDisabled(true);
        }
    },
    
    cmbEncryptionChange: function(cmb){
        var me      = this;
        var form    = cmb.up('form');
        var key     = form.down('#key');
        var srv     = form.down('#auth_server');
        var scrt    = form.down('#auth_secret'); 
        var nasid   = form.down('#nasid');
        var acct    = form.down('#chk_accounting');
        var auto    = form.down('#chk_auto_nasid');
        var val     = cmb.getValue();
        if(val == 'none'){
            key.setVisible(false);
            key.setDisabled(true); 
            srv.setVisible(false);
            srv.setDisabled(true);
            scrt.setVisible(false);
            scrt.setDisabled(true);
            nasid.setVisible(false);
            nasid.setDisabled(true); 
            acct.setVisible(false);
            acct.setDisabled(true);  
            auto.setVisible(false);
            auto.setDisabled(true);   
        }

        if((val == 'wep')|(val == 'psk')|(val =='psk2')){
            key.setVisible(true);
            key.setDisabled(false); 
            srv.setVisible(false);
            srv.setDisabled(true);
            scrt.setVisible(false);
            scrt.setDisabled(true);
            nasid.setVisible(false);
            nasid.setDisabled(true); 
            acct.setVisible(false);
            acct.setDisabled(true);  
            auto.setVisible(false);
            auto.setDisabled(true);   
        }

        if((val == 'wpa')|(val == 'wpa2')){
            key.setVisible(false);
            key.setDisabled(true); 
            srv.setVisible(true);
            srv.setDisabled(false);
            scrt.setVisible(true);
            scrt.setDisabled(false);
            acct.setVisible(true);
            acct.setDisabled(false);  
            auto.setVisible(true);
            auto.setDisabled(false); 
            if(auto.getValue()){
                nasid.setVisible(false);
                nasid.setDisabled(true);  
            }else{
                nasid.setVisible(true);
                nasid.setDisabled(false);  
            }    
        }

    },
    chkMaxassocChange: function(chk){
        var me      = this;
        var form    = chk.up('form');
        var num     = form.down('#maxassoc');    
        var val     = chk.getValue();
        if(val){
            num.setVisible(true);
            num.setDisabled(false); 
        }else{
            num.setVisible(false);
            num.setDisabled(true);
        }
    },
    cmbMacFilterChange:function(cmb){
        var me      = this;
        var form    = cmb.up('form');
        var pu      = form.down('cmbPermanentUser');
        var val     = cmb.getValue();
        
        if(val == 'disable'){
            pu.setVisible(false);
            pu.setDisabled(true); 
        }else{
            pu.setVisible(true);
            pu.setDisabled(false); 
        }
    },
    btnAddEntrySave:  function(button){
        var me      = this;
        var win     = button.up("winAccessPointAddEntry");
        var form    = win.down('form');
        form.submit({
            clientValidation: true,
            url: me.getUrlAddEntry(),
            success: function(form, action) {
                win.store.load();
                win.close();
                Ext.ux.Toaster.msg(
                        i18n("sItem_added_fine"),
                        i18n('New Access Point SSID created fine'),
                        Ext.ux.Constants.clsInfo,
                        Ext.ux.Constants.msgInfo
                );
            },
            scope       : me,
            failure     : 'formFailure'
        });
    },
    editEntry: function(button){  
        var me      = this;
        var pnl     = button.up("pnlAccessPointEdit");
        var store   = pnl.down("gridAccessPointEntries").getStore();  
        if(pnl.down("gridAccessPointEntries").getSelectionModel().getCount() == 0){
            Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );    
        }else{
            var sr      = pnl.down("gridAccessPointEntries").getSelectionModel().getLastSelected();
            var id      = sr.getId();
            
            if(!Ext.WindowManager.get('winAccessPointEditEntryId')){
                var w = Ext.widget('winAccessPointEditEntry',
                {
                    id          :'winAccessPointEditEntryId',
                    store       : store,
                    entryId     : id
                });
                w.show();         
            }else{
                var w       = Ext.WindowManager.get('winAccessPointEditEntryId');
                w.entryId   = id; 
                me.loadEntry(w)
            } 
        }     
    },
    loadEntry: function(win){
        var me      = this; 
        var form    = win.down('form');
        var entryId = win.entryId;      
        form.load({
            url         :me.getUrlViewEntry(), 
            method      :'GET',
            params      :{entry_id:entryId},
            success     : function(a,b,c){
                var mf     = form.down("cmbMacFilter");
                var mf_val = mf.getValue();
                if(mf_val != 'disable'){
                    var cmb     = form.down("cmbPermanentUser");
                    var rec     = Ext.create('Rd.model.mPermanentUser', {username: b.result.data.username, id: b.result.data.permanent_user_id});
                    cmb.getStore().loadData([rec],false);
                    cmb.setValue(b.result.data.permanent_user_id);
                }
            }
        });  
    },
    btnEditEntrySave:  function(button){
        var me      = this;
        var win     = button.up("winAccessPointEditEntry");
        var form    = win.down('form');
        form.submit({
            clientValidation: true,
            url: me.getUrlEditEntry(),
            success: function(form, action) {
                win.close();
                win.store.load();
                Ext.ux.Toaster.msg(
                        i18n("sItem_updated_fine"),
                        i18n("sItem_updated_fine"),
                        Ext.ux.Constants.clsInfo,
                        Ext.ux.Constants.msgInfo
                );
            },
            scope       : me,
            failure     : Ext.ux.formFail
        });
    },
    delEntry:   function(button){
        var me      = this;
        var pnl     = button.up("pnlAccessPointEdit");
        var grid    = pnl.down("gridAccessPointEntries");
    
        //Find out if there was something selected
        if(grid.getSelectionModel().getCount() == 0){
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
                        grid.getStore().remove(grid.getSelectionModel().getSelection());
                        grid.getStore().sync({
                            success: function(batch,options){
                                Ext.ux.Toaster.msg(
                                        i18n("sItem_deleted_fine"),
                                        i18n("sItem_deleted_fine"),
                                        Ext.ux.Constants.clsInfo,
                                        Ext.ux.Constants.msgInfo
                                );
                            },
                            failure: function(batch,options,c,d){
                                Ext.ux.Toaster.msg(
                                            i18n('sError_encountered'),
                                            batch.proxy.getReader().rawData.message.message,
                                            Ext.ux.Constants.clsWarn,
                                            Ext.ux.Constants.msgWarn
                                );
                                grid.getStore().load(); //Reload from server since the sync was not good
                            }
                        });
                    }
                }
            });
        }
    },
    
    chkNasClientChange: function(chk){
        var me          = this;
        var form        = chk.up('form');
        var cmb_realm   = form.down('#cmbRealm');
        if(chk.getValue()){	
			cmb_realm.setVisible(true);
			cmb_realm.setDisabled(false);
		}else{
			cmb_realm.setVisible(false);
			cmb_realm.setDisabled(true);		
		}
    },
    chkLoginPageChange: function(chk){
        var me          = this;
        var form        = chk.up('form');
        var cmb_page    = form.down('#cmbDynamicDetail');
        if(chk.getValue()){	
			cmb_page.setVisible(true);
			cmb_page.setDisabled(false);
		}else{
			cmb_page.setVisible(false);
			cmb_page.setDisabled(true);		
		}
    },
      
    reloadExit: function(button){
        var me      = this;
        var pnl     = button.up("pnlAccessPointEdit");
        var exit    = pnl.down("gridAccessPointExits");
        exit.getStore().reload();
    },
    loadAddExit: function(win){
        var me      = this; 
        var form    = win.down('#scrnData');
        form.load({url:me.getUrlExitAddDefaults(), method:'GET'});
    },
    addExit: function(button){
        var me      = this;
        var pnl     = button.up("pnlAccessPointEdit");
        //If there are NO entry points defined; we will NOT pop up this window.
        var entries_count   = pnl.down("gridAccessPointEntries").getStore().count();
        if(entries_count == 0){
            Ext.ux.Toaster.msg(
                        i18n("sDefine_some_entry_points_first"),
                        i18n("sDefine_some_entry_points_first"),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );     
            return;
        }
        
        //Entry points present; continue 
        var store   = pnl.down("gridAccessPointExits").getStore();
        if(!Ext.WindowManager.get('winAccessPointAddExitId')){
            var w = Ext.widget('winAccessPointAddExit',
            {
                id              :'winAccessPointAddExitId',
                store           : store,
                apProfileId     : pnl.ap_profile_id
            });
            w.show();        
        }
    },
    btnExitTypeNext: function(button){
        var me      = this;
        var win     = button.up('winAccessPointAddExit');
        var type    = win.down('#rgrpExitType').getValue().exit_type;
        var vlan    = win.down('#vlan');
        var tab_capt= win.down('#tabCaptivePortal');
        var tab_nat = win.down('#tabNatDhcp');
        var sel_type= win.down('#type');
        var vpn     = win.down('#cmbOpenVpnServers') 
        var a_nas   = win.down('#chkNasClient');
        var cmb_realm = win.down('#cmbRealm');
        var a_page  = win.down('#chkLoginPage');
        var cmb_page= win.down('cmbDynamicDetail');
        
        var rgrpProtocol= win.down('#rgrpProtocol');
        var l3Detail    = win.down('#pnlLayer3Detail');
        
        var tagConWith  = win.down('tagAccessPointEntryPoints');
        
        sel_type.setValue(type);
        
        if(type == 'openvpn_bridge'){
            vpn.setVisible(true);
            vpn.setDisabled(false);
        }else{
            vpn.setVisible(false);
            vpn.setDisabled(true);
        }
 
        if(type == 'tagged_bridge'){
            vlan.setVisible(true);
            vlan.setDisabled(false);
        }else{
            vlan.setVisible(false);
            vlan.setDisabled(true);
        }
        
        if(type == 'nat'){
            tab_nat.tab.show();
            tab_nat.setDisabled(false);
        }else{
	        tab_nat.tab.hide();
            tab_nat.setDisabled(true);
        }

        if(type == 'captive_portal'){
            tab_capt.setDisabled(false);
			tab_capt.tab.show();
						
			a_nas.setVisible(true);
			a_nas.setDisabled(false);
			a_page.setVisible(true);
			a_page.setDisabled(false);
			cmb_page.setVisible(true);
			cmb_page.setDisabled(false);
			cmb_realm.setVisible(true);
			cmb_realm.setDisabled(false);
			
        }else{
            tab_capt.setDisabled(true);
			tab_capt.tab.hide();
			
			a_nas.setVisible(false);
			a_nas.setDisabled(true);
			a_page.setVisible(false);
			a_page.setDisabled(true);
			cmb_page.setVisible(false);
			cmb_page.setDisabled(true);
			cmb_realm.setVisible(false);
			cmb_realm.setDisabled(true);
			
        }
        
        if(type == 'tagged_bridge_l3'){
            vlan.setVisible(true);
            vlan.setDisabled(false);
            rgrpProtocol.setVisible(true);
            rgrpProtocol.setDisabled(false);
                  
            if(rgrpProtocol.getValue().proto == 'static'){ 
                l3Detail.setHidden(false);
                l3Detail.setDisabled(false);                    
            }else{
                l3Detail.setHidden(true);
                l3Detail.setDisabled(true);                        
            }
            
            tagConWith.setVisible(false);
            tagConWith.setDisabled(true);
            
        }else{
            //vlan.setVisible(false);
            //vlan.setDisabled(true);
            rgrpProtocol.setVisible(false);
            rgrpProtocol.setDisabled(true);
            l3Detail.setHidden(true);
            l3Detail.setDisabled(true);    
            tagConWith.setVisible(true);
            tagConWith.setDisabled(false);
        } 
        win.getLayout().setActiveItem('scrnData');
    },
    
    btnExitDataPrev: function(button){
        var me      = this;
        var win     = button.up('winAccessPointAddExit');
        win.getLayout().setActiveItem('scrnType');
    },
    btnAddExitSave: function(button){
        var me      = this;
        var win     = button.up("winAccessPointAddExit");
        var form    = win.down('#scrnData');
        form.submit({
            clientValidation: true,
            url: me.getUrlAddExit(),
            submitEmptyText: false,
            success: function(form, action) {
                win.close();
                win.store.load();
                Ext.ux.Toaster.msg(
                        i18n("sItem_added_fine"),
                        i18n("sItem_added_fine"),
                        Ext.ux.Constants.clsInfo,
                        Ext.ux.Constants.msgInfo
                );
                
            },
            scope       : me,
            failure     : Ext.ux.formFail
        });
    },
    delExit:   function(button){
        var me      = this;
        var pnl     = button.up("pnlAccessPointEdit");
        var grid    = pnl.down("gridAccessPointExits");
    
        //Find out if there was something selected
        if(grid.getSelectionModel().getCount() == 0){
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
                        grid.getStore().remove(grid.getSelectionModel().getSelection());
                        grid.getStore().sync({
                            success: function(batch,options){                             
                                Ext.ux.Toaster.msg(
                                        i18n("sItem_deleted_fine"),
                                        i18n("sItem_deleted_fine"),
                                        Ext.ux.Constants.clsInfo,
                                        Ext.ux.Constants.msgInfo
                                );
                            },
                            failure: function(batch,options,c,d){
                                Ext.ux.Toaster.msg(
                                            i18n('sError_encountered'),
                                            batch.proxy.getReader().rawData.message.message,
                                            Ext.ux.Constants.clsWarn,
                                            Ext.ux.Constants.msgWarn
                                );
                                grid.getStore().load(); //Reload from server since the sync was not good
                            }
                        });

                    }
                }
            });
        }
    },
    editExit: function(button){
        var me      = this;
        var pnl     = button.up("pnlAccessPointEdit");
        var store   = pnl.down("gridAccessPointExits").getStore();
        
        if(pnl.down("gridAccessPointExits").getSelectionModel().getCount() == 0){
            Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );     
        }else{
            var sr          = pnl.down("gridAccessPointExits").getSelectionModel().getLastSelected();
            var id          = sr.getId();
            var apProfileId = sr.get('ap_profile_id');
            var type        = sr.get('type');
            if(!Ext.WindowManager.get('winAccessPointEditExitId')){
                var w = Ext.widget('winAccessPointEditExit',
                {
                    id          :'winAccessPointEditExitId',
                    store       : store,
                    exitId      : id,
                    apProfileId : apProfileId,
                    type        : type
                });
                w.show(); 
                        
            }else{
                var w           = Ext.WindowManager.get('winAccessPointEditExitId');
                var vlan        = w.down('#vlan');
                var tab_capt    = w.down('#tabCaptivePortal');
                var tab_nat     = win.down('#tabNatDhcp');
                w.exitId        = id;
                w.apProfileId   = apProfileId;
                var vpn         = w.down('#cmbOpenVpnServers'); 
                
                var a_nas       = w.down('#chkNasClient');
                var a_page      = w.down('#chkLoginPage');
                var cmb_page    = w.down('cmbDynamicDetail');
                
                if(type == 'nat'){
                    tab_nat.tab.show();
                    tab_nat.setDisabled(false);
                }else{
	                tab_nat.tab.hide();
                    tab_nat.setDisabled(true);
                }
                                 
                if(type == 'openvpn_bridge'){
                    vpn.setVisible(true);
                    vpn.setDisabled(false);
                    
                    vlan.setVisible(false);
                    vlan.setDisabled(true);
                    
                }else{
                    vpn.setVisible(false);
                    vpn.setDisabled(true);
                }

                if(type == 'tagged_bridge'){
                    vlan.setVisible(true);
                    vlan.setDisabled(false);
                }else{
                    vlan.setVisible(false);
                    vlan.setDisabled(true);
                }

                if(type == 'captive_portal'){
                    tab_capt.setDisabled(false);
					tab_capt.tab.show();
					
					a_nas.setVisible(true);
			        a_nas.setDisabled(false);
			        a_page.setVisible(true);
			        a_page.setDisabled(false);
			        cmb_page.setVisible(true);
			        cmb_page.setDisabled(false);
					
                }else{
                    tab_capt.setDisabled(true);
					tab_capt.tab.hide(); 
					
					a_nas.setVisible(false);
			        a_nas.setDisabled(true);
			        a_page.setVisible(false);
			        a_page.setDisabled(true);
			        cmb_page.setVisible(false);
			        cmb_page.setDisabled(true);	
                }               
                w.getController().loadExit(w);
            } 
        }     
    }, 
    btnEditExitSave:  function(button){
        var me      = this;
        var win     = button.up("winAccessPointEditExit");
        var form    = win.down('form');
        form.submit({
            clientValidation: true,
            url: me.getUrlEditExit(),
            submitEmptyText: false,
            success: function(form, action) {
                win.close();
                win.store.load();
                Ext.ux.Toaster.msg(
                        i18n("sItem_updated_fine"),
                        i18n("sItem_updated_fine"),
                        Ext.ux.Constants.clsInfo,
                        Ext.ux.Constants.msgInfo
                );
            },
            scope       : me,
            failure     : Ext.ux.formFail
        });
    }, 
    chkProxyEnableChange: function(chk){
        var me      = this;
        var panel   = chk.up('panel');
        var items   = Ext.ComponentQuery.query("textfield", panel);
        if(chk.getValue()){
            Ext.Array.each(items, function(item, index, itemsItSelf) {
                item.setDisabled(false);
                 item.setVisible(true);
            });
        }else{
            Ext.Array.each(items, function(item, index, itemsItSelf) {
                item.setDisabled(true);
                 item.setVisible(false);
            });
        }
    },  
    //Common ap settings
    frmApCommonSettingsLoad: function(tab){
        var me          = this;
        var form        = tab;
        var apProfileId = tab.apProfileId;
        form.load({
            url     : me.getUrlViewApCommonSettings(), 
            method  : 'GET',
            params  : {ap_profile_id:apProfileId},
            success : function(a,b,c){
                var schedule    = form.down("cmbSchedule");
                var sch_val     = schedule.getValue();
                if(sch_val != null){
                    var cmb     = form.down("cmbSchedule");
                    var rec     = Ext.create('Rd.model.mAp', {name: b.result.data.schedule_name, id: b.result.data.schedule_id});
                    cmb.getStore().loadData([rec],false);
                    cmb.setValue(b.result.data.schedule_id);
                }
            }
        });
    },
    chkEnableSchedulesChange : function(chk){
		var me 		= this;
		var form	= chk.up('form');
		var cnt	    = form.down('#cntSchedule');
		if(chk.getValue()){
		    cnt.setVisible(true);
            cnt.setDisabled(false); 
		}else{
			cnt.setVisible(false);
            cnt.setDisabled(true); 
		}
	},
    btnApCommonSettingsSave: function(button){
        var me          = this;
        var form        = button.up('form');
        var tab         = button.up('#tabAccessPointCommonSettings');
        var apProfileId = tab.apProfileId;
        form.submit({
            clientValidation    : true,
            url                 : me.getUrlEditApCommonSettings(),
            params              : {ap_profile_id: apProfileId},
            success: function(form, action) {
                Ext.ux.Toaster.msg(
                        i18n("sItem_updated_fine"),
                        i18n("sItem_updated_fine"),
                        Ext.ux.Constants.clsInfo,
                        Ext.ux.Constants.msgInfo
                );
            },
            scope       : me,
            failure     : Ext.ux.formFail
        });
    },  
    //Aps related
   reloadAps: function(button){
        var me      = this;
        var pnl     = button.up("pnlAccessPointEdit");
        var aps     = pnl.down("gridAccessPointAps");
        aps.getStore().reload();
    },
    addAp: function(button){
        var me      = this;
        var pnl     = button.up("pnlAccessPointEdit");
        var store   = pnl.down("gridAccessPointAps").getStore();
        var id      = 0; // New Ap
		var name    = "New Ap"; 
		var apProfileId = pnl.ap_profile_id;
		var apProfile   = pnl.title;
        me.application.runAction('cAccessPointAp','Index',id,{name:name,apProfileId:apProfileId,apProfile:apProfile,store:store});
    },
    delAp:   function(button){
        var me      = this;
        var pnl     = button.up("pnlAccessPointEdit");
        var grid    = pnl.down("gridAccessPointAps");
    
        //Find out if there was something selected
        if(grid.getSelectionModel().getCount() == 0){
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

                        grid.getStore().remove(grid.getSelectionModel().getSelection());
                        grid.getStore().sync({
                            success: function(batch,options){
                                Ext.ux.Toaster.msg(
                                        i18n("sItem_deleted_fine"),
                                        i18n("sItem_deleted_fine"),
                                        Ext.ux.Constants.clsInfo,
                                        Ext.ux.Constants.msgInfo
                                );
                            },
                            failure: function(batch,options,c,d){
                                Ext.ux.Toaster.msg(
                                            i18n('sError_encountered'),
                                            batch.proxy.getReader().rawData.message.message,
                                            Ext.ux.Constants.clsWarn,
                                            Ext.ux.Constants.msgWarn
                                );
                                grid.getStore().load(); //Reload from server since the sync was not good
                            }
                        });

                    }
                }
            });
        }
    },
    editAp: function(button){
        var me      = this;
        var pnl     = button.up("pnlAccessPointEdit");
        var store   = pnl.down("gridAccessPointAps").getStore();
        if(pnl.down("gridAccessPointAps").getSelectionModel().getCount() == 0){
            Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );   
            
        }else{
            var sr          = pnl.down("gridAccessPointAps").getSelectionModel().getLastSelected();
            var id      = sr.getId();
            var name    = sr.get('name'); 
			var apProfileId = sr.get('ap_profile_id');
			var apProfile   = sr.get('ap_profile');
            me.application.runAction('cAccessPointAp','Index',id,{name:name,apProfileId:apProfileId,apProfile:apProfile,store:store});
        }
    },
	//____ MAP ____

    mapLoadApi:   function(button){
        var me 	= this;
        Ext.ux.Toaster.msg(
                        i18n("sLoading_Google_Maps_API"),
                        i18n("sLoading_Google_Maps_API"),
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
        var pnl         = button.up('pnlAccessPointEdit');
        var map_tab_id  = 'mapTab';
        var nt          = pnl.down('#'+map_tab_id);
        if(nt){
            pnl.setActiveTab(map_tab_id); //Set focus on  Tab
            return;
        }

        var map_tab_name    = i18n("sGoogle_Maps");
		var mesh_id		    = pnl.mesh_id

        //We need to fetch the Preferences for this user's Google Maps map
        Ext.Ajax.request({
            url		: me.getUrlMapPrefView(),
            method	: 'GET',
			params	: {
				mesh_id	: mesh_id
			},
            success: function(response){
                var jsonData    = Ext.JSON.decode(response.responseText);
                if(jsonData.success){     
                   	//console.log(jsonData);
					//___Build this tab based on the preferences returned___
                    pnl.add({ 
                        title 		: map_tab_name,
                        itemId		: map_tab_id,
                        closable	: true,
                        glyph		: Rd.config.icnMap, 
                        layout		: 'fit', 
                        xtype		: 'pnlMeshEditGMap',
                        mapOptions	: {zoom: jsonData.data.zoom, mapTypeId: google.maps.MapTypeId[jsonData.data.type] },	//Required for map
                       	centerLatLng: {lat:jsonData.data.lat,lng:jsonData.data.lng},										//Required for map
                       	markers		: [],
						meshId		: mesh_id
                    });
                    pnl.setActiveTab(map_tab_id); //Set focus on Add Tab
                    //____________________________________________________   
                }   
            },
			failure: function(batch,options){
			    Ext.ux.Toaster.msg(
                        i18n('sError_encountered'),
                        i18n('sMap_preferences_could_not_be_fetched'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            ); 
            },
			scope: me
        });
    },
    dragStart: function(node_id,map_panel,sel_marker){
        var me = this;
        me.lastMovedMarker  = sel_marker;
        me.lastOrigPosition = sel_marker.getPosition();
        me.editWindow 		= map_panel.editwindow;
    },
    dragEnd: function(node_id,map_panel,sel_marker){
        var me = this;
        var l_l = sel_marker.getPosition();
        map_panel.new_lng = l_l.lng();
        map_panel.new_lat = l_l.lat();
        map_panel.editwindow.open(map_panel.gmap, sel_marker);
        me.lastLng    = l_l.lng();
        me.lastLat    = l_l.lat();
        me.lastDragId = node_id;
    },
    btnMapCancel: function(button){
        var me = this;
        me.editWindow.close();
        me.lastMovedMarker.setPosition(me.lastOrigPosition);
    },
    btnMapDelete: function(button){
        var me 		= this;
		var pnl		= button.up('#pnlMapsEdit');
		var map_pnl = pnl.mapPanel;
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
                    Ext.ux.Toaster.msg(
                            i18n("sItem_deleted_fine"),
                            i18n("sItem_deleted_fine"),
                            Ext.ux.Constants.clsInfo,
                            Ext.ux.Constants.msgInfo
                    );
                    
					me.reloadMap(map_pnl);
                }   
            },
            scope: me
        });
    },
    btnMapSave: function(button){
        var me 		= this;
		var pnl		= button.up('#pnlMapsEdit');
		var map_pnl = pnl.mapPanel;
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
                    Ext.ux.Toaster.msg(
                            i18n("sItem_updated_fine"),
                            i18n("sItem_updated_fine"),
                            Ext.ux.Constants.clsInfo,
                            Ext.ux.Constants.msgInfo
                    );
                
					me.reloadMap(map_pnl);
                }   
            },
            scope: me
        });
    },
	mapPreferences: function(button){
       	var me 		= this;
		var pnl		= button.up('pnlMeshEdit');
		var mesh_id	= pnl.mesh_id;
		var pref_id = 'winMeshMapPreferences_'+mesh_id;
		var map_p	= pnl.down('pnlMeshEditGMap');

        if(!Ext.WindowManager.get(pref_id)){
            var w = Ext.widget('winMeshMapPreferences',{id:pref_id,mapPanel: map_p,meshId: mesh_id});
            w.show();
            //We need to load this widget's form with the latest data:
            w.down('form').load({
				url		: me.getUrlMapPrefView(),
            	method	: 'GET',
				params	: {
					mesh_id	: mesh_id
				}
			});
       }   
    },
   	mapNodeAdd: function(button){
        var me 		= this;
		var pnl		= button.up('pnlMeshEdit');
		var mesh_id	= pnl.mesh_id;
		var add_id  = 'winMeshMapNodeAdd_'+mesh_id;
		var map_p	= pnl.down('pnlMeshEditGMap');

        if(!Ext.WindowManager.get(add_id)){
            var w = Ext.widget('winMeshMapNodeAdd',{id: add_id,mapPanel: map_p,meshId:mesh_id});
            w.show();     
       }   
    },
    meshMapNodeAddSubmit: function(button){
        var me      = this;
        var win     = button.up('winMeshMapNodeAdd');
        var node    = win.down('cmbMeshAddMapNodes');
        var id      = node.getValue();
		var pnl		= win.mapPanel
        win.close();
        var m_center 	= pnl.gmap.getCenter();
        var sel_marker 	= pnl.addMarker({
            lat: m_center.lat(), 
            lng: m_center.lng(),
            icon: "resources/images/map_markers/yellow-dot.png",
            draggable: true, 
            title: i18n("sNew_marker"),
            listeners: {
                dragend: function(){
                    me.dragEnd(id,pnl,sel_marker);
                },
                dragstart: function(){
                    pnl.addwindow.close();
                    me.dragStart(id,pnl,sel_marker);
                }
            }
        });
		//Show the add infowinfow on the pnl's gmap at the marker
		pnl.addwindow.open(pnl.gmap, sel_marker);
    },
    mapPreferencesSnapshot: function(button){

        var me      = this;
        var form    = button.up('form');
		var w		= button.up('winMeshMapPreferences');
        var pnl     = w.mapPanel;
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
        var win     = button.up('winMeshMapPreferences');
		var mesh_id = win.meshId;
       
        form.submit({
            clientValidation: true,
            url: me.getUrlMapPrefEdit(),
			params: {
				mesh_id: mesh_id
			},
            success: function(form, action) {
                win.close();
                Ext.ux.Toaster.msg(
                            i18n("sItem_updated_fine"),
                            i18n("sItem_updated_fine"),
                            Ext.ux.Constants.clsInfo,
                            Ext.ux.Constants.msgInfo
                    );
            },
            scope       : me,
            failure     : Ext.ux.formFail
        });
    },
	reloadMap: function(map_panel){
		var me = this;
		//console.log("Reload markers");
		map_panel.setLoading(true);
		map_panel.clearMarkers();
		var mesh_id = map_panel.meshId;

		Ext.Ajax.request({
            url: me.getUrlMeshNodes(),
            method: 'GET',
			params: {
				mesh_id: mesh_id
			},
            success: function(response){
                var jsonData    = Ext.JSON.decode(response.responseText);
                if(jsonData.success){
					Ext.each(jsonData.items, function(i){
						var icon = me.getUrlBlueMark();
						var sel_marker = map_panel.addMarker({
		                    lat			: i.lat, 
		                    lng			: i.lng,
		                    icon		: icon,
		                    draggable	: true, 
		                    title		: i.name,
		                    listeners: {
		                        dragend: function(){
		                            me.dragEnd(i.id,map_panel,sel_marker);
		                        },
		                        dragstart: function(){
		                            me.dragStart(i.id,map_panel,sel_marker);
		                        }
		                    }
		                })
					});
					map_panel.setLoading(false);
                }   
            },
            scope: me
        });
	},
	frmApGeneralLoad: function(tab){
        var me          = this;
        var form        = tab;
        var apProfileId = tab.apProfileId;
        form.load({
            url     : me.getUrlViewApProfileSettings(), 
            method  :'GET',
            params  : {ap_profile_id:apProfileId},
            success : function(a,b,c){   
                if(b.result.data.show_owner == true){
                    form.down('#fcPickOwner').show();
                }else{
                    form.down('#fcPickOwner').hide();
                }
            }
        });
    },
    btnApGeneralSave: function(button){
        var me          = this;
        var form        = button.up('form');
        var tab         = button.up('#tabApGeneral');
        var apProfileId = tab.apProfileId;
        form.submit({
            clientValidation    : true,
            url                 : me.getUrlEditApProfileSettings(),
            params              : {ap_profile_id: apProfileId},
            success: function(form, action) {
                Ext.ux.Toaster.msg(
                    i18n('sItem_updated'),
                    i18n('sItem_updated_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
                me.frmApGeneralLoad(tab);
            },
            failure: Ext.ux.formFail
        });
    },
    btnApGeneralPickOwner: function(button){
        var me             = this;
        var form           = button.up('form');
        var updateDisplay  = form.down('#displUser');
        var updateValue    = form.down('#hiddenUser'); 
		if(!Ext.WindowManager.get('winSelectOwnerId')){
            var w = Ext.widget('winSelectOwner',{id:'winSelectOwnerId',updateDisplay:updateDisplay,updateValue:updateValue});
            w.show();       
        }  
    }
});

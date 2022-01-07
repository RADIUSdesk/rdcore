
Ext.define('Rd.controller.cNas', {
    extend: 'Ext.app.Controller',
    owner   : undefined,
    user_id : undefined,
    actionIndex: function(pnl){

        var me = this;
        
        if (me.populated) {
            return; 
        }     
        pnl.add({
            xtype   : 'tabpanel',
            border  : false,
            itemId  : 'tabNas',
            plain   : true,
            cls     : 'subSubTab', //Make darker -> Maybe grey
            items   : [
                { 'title' : i18n('sHome'), xtype: 'gridNas','glyph': Rd.config.icnHome}
            ]
        });
        me.populated = true;   
    },

    views:  [
        'nas.gridNas','nas.winNasAddWizard','nas.gridRealmsForNasOwner','nas.winTagManage', 
        'components.winCsvColumnSelect', 'components.winNote', 'components.winNoteAdd', 'nas.pnlNas',
        'nas.pnlRealmsForNasOwner', 'nas.pnlNasOpenVpn', 'nas.pnlNasNas', 'nas.pnlNasPptp', 'nas.pnlNasDynamic', 
        'nas.cmbNasTypes', 'components.pnlGMap', 'components.cmbNas', 'nas.winMapNasAdd', 'nas.pnlNasPhoto', 
        'nas.winMapPreferences', 'nas.gridNasAvailability', 'nas.gridNasActions', 'nas.winNasActionAdd',
        'components.pnlUsageGraph',
        'nas.pnlNasGraphs'
    ],
    stores: ['sNas','sTags','sDynamicAttributes','sAccessProvidersTree', 'sTags', 'sNasTypes'],
    models: ['mNas','mRealmForNasOwner','mApRealms','mTag', 'mDynamicAttribute','mGenericList','mAccessProviderTree', 
                'mTag', 'mNasType', 'mNaState', 'mAction','mUserStat' ],
    selectedRecord: null,
    config: {
        urlAdd:             '/cake3/rd_cake/nas/add.json',
        urlAddDirect:       '/cake3/rd_cake/nas/add_direct.json',
        urlAddOpenVpn:      '/cake3/rd_cake/nas/add_open_vpn.json',
        urlAddDynamic:      '/cake3/rd_cake/nas/add_dynamic.json',
        urlAddPptp:         '/cake3/rd_cake/nas/add_pptp.json',
        urlDelete:          '/cake3/rd_cake/nas/delete.json',
        urlEditPanelCfg:    '/cake3/rd_cake/nas/edit_panel_cfg.json',
        urlManageTags:      '/cake3/rd_cake/nas/manage_tags.json',
        urlApChildCheck:    '/cake3/rd_cake/access-providers/child-check.json',
        urlExportCsv:       '/cake3/rd_cake/nas/export_csv',
        urlNoteAdd:         '/cake3/rd_cake/nas/note-add.json',
        urlViewOpenVpn:     '/cake3/rd_cake/nas/view_openvpn.json',
        urlEditOpenVpn:     '/cake3/rd_cake/nas/edit_openvpn.json',
        urlViewDynamic:     '/cake3/rd_cake/nas/view_dynamic.json',
        urlEditDynamic:     '/cake3/rd_cake/nas/edit_dynamic.json',
        urlViewPptp:        '/cake3/rd_cake/nas/view_pptp.json',
        urlEditPptp:        '/cake3/rd_cake/nas/edit_pptp.json',
        urlViewNas:         '/cake3/rd_cake/nas/view_nas.json',
        urlEditNas:         '/cake3/rd_cake/nas/edit_nas.json',
        urlMapDelete:       '/cake3/rd_cake/nas/delete_map.json',
        urlMapSave:         '/cake3/rd_cake/nas/edit_map.json',
        urlViewPhoto:       '/cake3/rd_cake/nas/view_photo.json',
        urlPhotoBase:       '/cake3/rd_cake/webroot/img/nas/',
        urlUploadPhoto:     '/cake3/rd_cake/nas/upload_photo/',
        urlGreenMark:       'resources/images/map_markers/green-dot.png',
        urlRedMark:         'resources/images/map_markers/red-dot.png', 
        urlBlueMark:        'resources/images/map_markers/blue-dot.png', 
        urlYellowMark:      'resources/images/map_markers/yellow-dot.png',
        urlViewMapPref:     '/cake3/rd_cake/nas/view_map_pref.json', 
        urlEditMapPref:     '/cake3/rd_cake/nas/edit_map_pref.json',
        urlNasActionsAdd:   '/cake3/rd_cake/actions/add.json'
    },
    refs: [
        {  ref: 'gridNas',  selector:   'gridNas'},
        {  ref: 'pnlGMap',  selector:   'pnlGMap'},
        {  ref: 'grid',     selector:   'gridNas'}      
    ],
    init: function() {
        var me = this;
        if (me.inited) {
            return;
        }
        me.inited = true;
        me.control({
            '#tabNas' : {
                destroy   :      me.appClose   
            },
            'gridNas #reload': {
                click:      me.reload
            },
            'gridNas #add'  : {
                click:      me.add
            },
            'gridNas #delete'   : {
                click:      me.del
            }, 
            'gridNas #edit' : {
                click:      me.edit
            }, 
            'gridNas #note' : {
                click:      me.note
            },
            'gridNas #csv'  : {
                click:      me.csvExport
            },
            'gridNas #tag'   : {
                click:      me.tag
            },
            'gridNas #map'   : {
                click:      me.mapLoadApi
            },
            'gridNas #reload menuitem[group=refresh]'   : {
                click:      me.reloadOptionClick
            },
            'gridNas #graph'   : {
                click:      me.graph
            },
            'gridNas'       : {
                select      : me.select,
                activate    : me.gridActivate
            },
            'winNasAddWizard #btnTreeNext' : {
                click:  me.btnTreeNext
            },
            'winNasAddWizard #btnConTypePrev' : {
                click:  me.btnConTypePrev
            },
            'winNasAddWizard #btnConTypeNext' : {
                click:  me.btnConTypeNext
            },
            'winNasAddWizard #btnOpenvpnPrev' : {
                click: me.btnOpenvpnPrev
            },
            'winNasAddWizard #btnOpenvpnNext' : {
                click: me.btnOpenvpnNext
            },
            'winNasAddWizard #btnPptpPrev' : {
                click: me.btnPptpPrev
            },
            'winNasAddWizard #btnPptpNext' : {
                click: me.btnPptpNext
            },
            'winNasAddWizard #btnDynamicPrev' : {
                click: me.btnDynamicPrev
            },
            'winNasAddWizard #btnDynamicNext' : {
                click: me.btnDynamicNext
            },
            'winNasAddWizard #btnDirectPrev' : {
                click:  me.btnDirectPrev
            },
            'winNasAddWizard #btnDirectNext' : {
                click:  me.btnDirectNext
            },
            'winNasAddWizard gridRealmsForNasOwner #reload': {
                click:      me.gridRealmsForNasOwnerReload
            },
            'winNasAddWizard #tabRealms': {
                activate:      me.gridRealmsForNasOwnerActivate
            }, 
            'winNasAddWizard #tabRealms #chkAvailForAll': {
                change:     me.chkAvailForAllChange
            },
            'winNasAddWizard gridRealmsForNasOwner #chkAvailSub':     {
                change:     me.gridRealmsForNasOwnerChkAvailSub
            },
            'winTagManage #save' : {
                click:  me.btnTagManageSave
            },
            '#winCsvColumnSelectNas #save': {
                click:  me.csvExportSubmit
            },
            'gridNote[noteForGrid=nas] #reload' : {
                click:  me.noteReload
            },
            'gridNote[noteForGrid=nas] #add' : {
                click:  me.noteAdd
            },
            'gridNote[noteForGrid=nas] #delete' : {
                click:  me.noteDelete
            },
            'gridNote[noteForGrid=nas]' : {
                itemclick: me.gridNoteClick
            },
            'winNoteAdd[noteForGrid=nas] #btnTreeNext' : {
                click:  me.btnNoteTreeNext
            },
            'winNoteAdd[noteForGrid=nas] #btnNoteAddPrev'  : {   
                click: me.btnNoteAddPrev
            },
            'winNoteAdd[noteForGrid=nas] #btnNoteAddNext'  : {   
                click: me.btnNoteAddNext
            },
            'pnlNasNas #save':    {
                click: me.pnlNasNasSave
            },
            'pnlNasNas #monitorType': {
                change: me.monitorTypeChange
            },
            'pnlRealmsForNasOwner #chkAvailForAll' :{
                change:     me.chkAvailForAllChangeTab
            },
            'pnlRealmsForNasOwner gridRealmsForNasOwner #reload' :{
                click:      me.gridRealmsForNasOwnerReload
            },
            'pnlRealmsForNasOwner #chkAvailSub':{
                change:     me.chkAvailSubTab
            },
            //Daa the Edit componet's events
            'pnlNas #tabOpenVpn': {
                beforerender:   me.tabOpenVpnRender,
                activate:       me.tabOpenVpnActivate
            },
            'pnlNas #tabOpenVpn #save': {
                click:          me.saveOpenVpn
            },
            'pnlNas #tabPptp': {
                beforerender:   me.tabPptpActivate,
                activate:       me.tabPptpActivate
            },
            'pnlNas #tabPptp #save': {
                click:          me.savePptp
            },
            'pnlNas #tabDynamic': {
                beforerender:   me.tabDynamicActivate,
                activate:       me.tabDynamicActivate
            },
            'pnlNas #tabDynamic #save': {
                click:          me.saveDynamic
            },
            'pnlNas #tabNas': {
                beforerender:   me.tabNasActivate,
                activate:       me.tabNasActivate
            },
            'pnlNas #tabRealms': {
                activate:   me.tabRealmsActivate
            },
            'pnlGMap #preferences': {
                click: me.mapPreferences
            },
            'pnlGMap #add': {
                click: me.mapNasAdd
            },
            'winMapNasAdd #save': {
                click: me.mapNasAddSubmit
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
            },//Photo
            'pnlNas #tabPhoto': {
                activate:       me.tabPhotoActivate
            },
            'pnlNas #tabPhoto #save': {
                click:       me.photoSave
            },
            'pnlNas #tabPhoto #cancel': {
                click:       me.photoCancel
            },
            'winMapPreferences #snapshot': {
                click:      me.mapPreferencesSnapshot
            },
            'winMapPreferences #save': {
                click:      me.mapPreferencesSave
            },//Availability
            'pnlNas #tabAvailability': {
                activate:   me.tabAvailabilityActivate
            },
            'gridNasAvailability #reload' :{
                click:      me.gridNasAvailabilityReload
            },
            'gridNasAvailability #delete' :{
                click:      me.gridNasAvailabilityDelete
            },//Actions
            'pnlNas #tabActions': {
                activate:   me.tabActionsActivate
            },
            'gridNasActions #reload' :{
                click:      me.gridNasActionsReload
            },
            'gridNasActions #add' :{
                click:      me.gridNasActionsAdd
            },
            'gridNasActions #delete' :{
                click:      me.gridNasActionsDelete
            },
            'winNasActionAdd #save': {
                click: me.gridNasActionsAddSubmit
            },
            // -- Graphs --
            '#tabNas pnlNasGraphs #daily' : {
                activate:      me.loadGraph
            },
            '#tabNas pnlNasGraphs #daily #reload' : {
                click:      me.reloadDailyGraph
            },
            '#tabNas pnlNasGraphs #daily #day' : {
                change:      me.changeDailyGraph
            },
            '#tabNas pnlNasGraphs #weekly' : {
                activate:      me.loadGraph
            },
            '#tabNas pnlNasGraphs #weekly #reload' : {
                click:      me.reloadWeeklyGraph
            },
            '#tabNas pnlNasGraphs #weekly #day' : {
                change:      me.changeWeeklyGraph
            },
            '#tabNas pnlNasGraphs #monthly' : {
                activate:      me.loadGraph
            },
            '#tabNas pnlNasGraphs #monthly #reload' : {
                click:      me.reloadMonthlyGraph
            },
            '#tabNas pnlNasGraphs #monthly #day' : {
                change:      me.changeMonthlyGraph
            }  
        });
    },
    appClose:   function(){
        var me          = this;
        me.populated    = false;
        if(me.autoReload != undefined){
            clearInterval(me.autoReload);   //Always clear
        }
    },
    reload: function(){
        var me =this;
        if(me.getGrid() == undefined){   //Thw window is closed; exit
            clearInterval(me.autoReload);
            return;
        }
        me.getGrid().getSelectionModel().deselectAll(true);
        me.getGrid().getStore().load();
    },
    gridActivate: function(g){
        var me = this;
        g.getStore().load();
    },
    add: function(button){
        var me = this;
        //We need to do a check to determine if this user (be it admin or acess provider has the ability to add to children)
        //admin/root will always have, an AP must be checked if it is the parent to some sub-providers. If not we will 
        //simply show the nas connection typer selection 
        //if it does have, we will show the tree to select an access provider.
        Ext.Ajax.request({
            url: me.getUrlApChildCheck(),
            method: 'GET',
            success: function(response){
                var jsonData    = Ext.JSON.decode(response.responseText);
                if(jsonData.success){
                        
                    if(jsonData.items.tree == true){
                        if(!Ext.WindowManager.get('winNasAddWizardId')){
                            var w = Ext.widget('winNasAddWizard',{
                                id          :'winNasAddWizardId',
                                startScreen : 'scrnApTree'
                            });
                            w.show();        
                        }
                    }else{
                        if(!Ext.WindowManager.get('winNasAddWizardId')){
                            me.user_id = 0; //We do it a bit defferent on this one
                            var w = Ext.widget('winNasAddWizard',{
                                id          :'winNasAddWizardId',
                                startScreen : 'scrnConType',
                                user_id     : '0',
                                owner       : i18n('sLogged_in_user'),
                                no_tree     : true
                            });
                            w.show();        
                        }
                    }
                }   
            },
            scope: me
        });
    },
    //After the use selected an owner they can continiue
    btnTreeNext: function(button){
        var me = this;
        var tree = button.up('treepanel');
        //Get selection:
        var sr = tree.getSelectionModel().getLastSelected();
        if(sr){ 
            var win     = button.up('winNasAddWizard');   
            me.username = sr.get('username');
            me.user_id  = sr.getId();
            win.getLayout().setActiveItem('scrnConType');
        }else{
            Ext.ux.Toaster.msg(
                        i18n('sSelect_an_owner'),
                        i18n('sFirst_select_an_Access_Provider_who_will_be_the_owner'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }
    },
    //Back to the owner selection
    btnConTypePrev: function(button){
        var me = this;
        var win = button.up('winNasAddWizard');
        win.getLayout().setActiveItem('scrnApTree');
    },
    //Here we see whic connection type they choose
    btnConTypeNext: function(button){
        var me      = this;
        var win     = button.up('winNasAddWizard');
        //Find out the selected connection type:
        var form    = button.up('form');
        var rbg     = form.down('radiogroup');

        if(rbg.getValue().rb == 'direct'){
            var scrn = win.down('#scrnDirect');
            scrn.down('#owner').setValue(me.username);
            scrn.down('#user_id').setValue(me.user_id);
            win.getLayout().setActiveItem('scrnDirect'); 
        }

        if(rbg.getValue().rb == 'openvpn'){
            var scrn = win.down('#scrnOpenvpn');
            scrn.down('#owner').setValue(me.username);
            scrn.down('#user_id').setValue(me.user_id);
            win.getLayout().setActiveItem('scrnOpenvpn'); 
        }

        if(rbg.getValue().rb == 'dynamic'){
            var scrn = win.down('#scrnDynamic');
            scrn.down('#owner').setValue(me.username);
            scrn.down('#user_id').setValue(me.user_id);
            win.getLayout().setActiveItem('scrnDynamic'); 
        }

        if(rbg.getValue().rb == 'pptp'){
            var scrn = win.down('#scrnPptp');
            scrn.down('#owner').setValue(me.username);
            scrn.down('#user_id').setValue(me.user_id);
            win.getLayout().setActiveItem('scrnPptp'); 
        }
    },
    //__OPEN VPN___
    btnOpenvpnPrev: function(button){
        var me      = this;
        var win     = button.up('winNasAddWizard');
        win.getLayout().setActiveItem('scrnConType');
    },
    //__OPEN VPN___
    btnOpenvpnNext: function(button){
        var me      = this;
        me.addSubmit(button,me.getUrlAddOpenVpn());
    },
    //__DYNAMIC___
    btnDynamicPrev: function(button){
        var me      = this;
        var win     = button.up('winNasAddWizard');
        win.getLayout().setActiveItem('scrnConType');
    },
    //__DYNAMIC___
    btnDynamicNext: function(button){
        var me      = this;
        me.addSubmit(button,me.getUrlAddDynamic());
    },
    //__PPTP___
    btnPptpPrev: function(button){
        var me      = this;
        var win     = button.up('winNasAddWizard');
        win.getLayout().setActiveItem('scrnConType');
    },
    //__PPTP___
    btnPptpNext: function(button){
        var me      = this;
        me.addSubmit(button,me.getUrlAddPptp());
    },
    //___DIRECT___
    btnDirectPrev:  function(button){
        var me      = this;
        var win     = button.up('winNasAddWizard');
        win.getLayout().setActiveItem('scrnConType');
    },
    //___DIRECT___
    btnDirectNext:  function(button){
        var me      = this;
        //We need to submit to the add_direct ...
        me.addSubmit(button,me.getUrlAddDirect());
    },
    chkAvailForAllChange: function(chk){
        var me      = this;
        var pnl     = chk.up('panel');
        var grid    = pnl.down("gridRealmsForNasOwner");
        if(chk.getValue() == true){
            grid.hide();
        }else{
            grid.show();
        }
    },
    chkAvailForAllChangeTab: function(chk){
        var me      = this;
        var pnl     = chk.up('panel');
        var grid    = pnl.down("gridRealmsForNasOwner");
        if(chk.getValue() == true){
            grid.hide();
            
        }else{
            grid.show();
        }
        //Clear the grid:
        //FIXME THIS DOES NOT SEEM TO WORK
        grid.getStore().getProxy().setExtraParam('clear_flag',true);
        grid.getStore().load();
        grid.getStore().getProxy().setExtraParam('clear_flag',false);
    },
    gridRealmsForNasOwnerReload: function(button){
        var me      = this;
        var grid    = button.up('gridRealmsForNasOwner');
        grid.getStore().load();
    },
    gridRealmsForNasOwnerActivate: function(tab){
        var me      = this;
        var a_to_s  = tab.down('#chkAvailSub').getValue();
        var grid    = tab.down('gridRealmsForNasOwner');
        grid.getStore().getProxy().setExtraParam('owner_id',me.owner_id);
        grid.getStore().getProxy().setExtraParam('available_to_siblings',a_to_s);
        grid.getStore().load();
    },
    gridRealmsForNasOwnerChkAvailSub: function(chk){
        var me      = this;
        var a_to_s  = chk.getValue();
        var grid    = chk.up('gridRealmsForNasOwner');
        grid.getStore().getProxy().setExtraParam('owner_id',me.owner_id);
        grid.getStore().getProxy().setExtraParam('available_to_siblings',a_to_s);
        grid.getStore().load();
    },

    addSubmit: function(button, url){
        var me = this;
        var win     = button.up('winNasAddWizard');
        var form    = button.up('form');
        var tp      = form.down('tabpanel');
        var grid    = form.down('gridRealmsForNasOwner');
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
            url: url,
            params: extra_params,
            success: function(form, action) {
                win.close();
                me.getGrid().getStore().load();
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

    //_____ END ADD _______

    tag: function(button){
        var me      = this;    
        //Find out if there was something selected
        if(me.getGrid().getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item_to_tag'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            if(!Ext.WindowManager.get('winNasAddWizardId')){
                var w = Ext.widget('winTagManage',{id:'winTagManageId'});
                w.show();      
            }    
        }
    },

    btnTagManageSave: function(button){
        var me      = this;
        var win     = button.up('window');
        var form    = win.down('form');
        var cmb     = form.down('combo');
        var rbg     = form.down('radiogroup');

        if(cmb.getValue() == null){
            Ext.ux.Toaster.msg(
                        i18n('sSelect_a_tag'),
                        i18n('sSelect_a_tag_please'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{

            var extra_params    = {};
            var s               = me.getGrid().getSelectionModel().getSelection();
            Ext.Array.each(s,function(record){
                var r_id = record.getId();
                extra_params[r_id] = r_id;
            });

            //Checks passed fine...      
            form.submit({
                clientValidation: true,
                url: me.getUrlManageTags(),
                params: extra_params,
                success: function(form, action) {

                win.close();
                me.getGrid().getStore().load();
                Ext.ux.Toaster.msg(
                    i18n('sTags_modified'),
                    i18n('sTags_modified_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );

                },
                failure: Ext.ux.formFail
            });
        }
    },
    select: function(grid,record){
        var me = this;
        //Adjust the Edit Delete and Tag buttons accordingly...
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

        var m_tag = record.get('manage_tags');
        if(del == true){
            if(tb.down('#tag') != null){
                tb.down('#tag').setDisabled(false);
            }
        }else{
            if(tb.down('#tag') != null){
                tb.down('#tag').setDisabled(true);
            }
        } 
    },

    onStoreNasLoaded: function(store, records, success, options) {
        var me      = this;
        var count   = me.getStore('sNas').getTotalCount();
        me.getGrid().down('#count').update({count: count});
        //WIP for MAP
/*
{
                        lat: 42.339641,
                        lng: -71.094224,
                        title: 'Boston Museum of Fine Arts',
                        draggable: true,
                        listeners: {
                            click: function(e){
                                Ext.Msg.alert('It\'s fine', 'and it\'s art.');
                            }
                        }
                    }
*/

        //See if the maps tab exists
        var tab_panel = me.getGrid().up('tabpanel');
        var map_tab   = tab_panel.down('#mapTab');
        if(map_tab != null){
            var map_panel = map_tab.down('gmappanel');
            //Clear all the previous ones:
            map_panel.clearMarkers();
            Ext.each(records, function(record) {
                var lat     = record.get('lat');
                var lng     = record.get('lon');
                var status  = record.get('status');
                //Check if valid lat and lng
                if((lat != null)&(lng != null)){
                    var icon = me.getUrlBlueMark();
                    if(status == 'up'){
                        icon = me.getUrlGreenMark();
                    }
                    if(status == 'down'){
                        icon = me.getUrlRedMark();
                    }

                    var ip = record.get('nasname');
                    var n  = record.get('shortname');
                   // console.log("Marker added "+ip+" name "+n)
                    var sel_marker = map_panel.addMarker({
                        lat: lat, 
                        lng: lng,
                        icon: icon,
                        draggable: true, 
                        title: ip,
                        listeners: {
                            click: function(e,f){
                                //console.log(record);
                                me.markerClick(record,map_panel,sel_marker);   
                            },
                            dragend: function(){
                                //console.log(record);
                                me.dragEnd(record,map_panel,sel_marker);
                            },
                            dragstart: function(){
                                //console.log(record);
                                me.dragStart(record,map_panel,sel_marker);
                            }
                        }
                    })
                }
            }, me);
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
    mapPreferences: function(button){
        var me = this;
        if(!Ext.WindowManager.get('winMapPreferencesId')){
            var w = Ext.widget('winMapPreferences',{id:'winMapPreferencesId'});
            w.show();
            //We need to load this widget's form with the latest data:
            w.down('form').load({url:me.getUrlViewMapPref(), method:'GET'});
       }   
    },
    mapNasAdd: function(button){
        var me = this;
        if(!Ext.WindowManager.get('winMapNasAddId')){
            var w = Ext.widget('winMapNasAdd',{id:'winMapNasAddId'});
            w.show();      
       }   
    },
    mapNasAddSubmit: function(button){
        var me      = this;
        var win     = button.up('window');
        var nas     = win.down('cmbNas');
        var id      = nas.getValue();
        var record  = nas.getStore().getById(id);
        win.close();

        var tab_panel = me.getGrid().up('tabpanel');
        var map_tab   = tab_panel.down('#mapTab');
        if(map_tab != null){
            var map_panel = map_tab.down('gmappanel');
            //We need to get the center of the map:
            var m_center = map_panel.gmap.getCenter();
            var sel_marker = map_panel.addMarker({
                lat: m_center.lat(), 
                lng: m_center.lng(),
                icon: "resources/images/map_markers/yellow-dot.png",
                draggable: true, 
                title: "New Marker",
                listeners: {
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
    csvExport: function(button,format) {
        var me          = this;
        var columns     = me.getGrid().columnManager.columns;
        var col_list    = [];
        Ext.Array.each(columns, function(item,index){
            if(item.dataIndex != ''){
                var chk = {boxLabel: item.text, name: item.dataIndex, checked: true};
                col_list[index] = chk;
            }
        }); 

        if(!Ext.WindowManager.get('winCsvColumnSelectNas')){
            var w = Ext.widget('winCsvColumnSelect',{id:'winCsvColumnSelectNas',columns: col_list});
            w.show();         
        }
    },
    csvExportSubmit: function(button){

        var me      = this;
        var win     = button.up('window');
        var form    = win.down('form');

        var chkList = form.query('checkbox');
        var c_found = false;
        var columns = [];
        var c_count = 0;
        Ext.Array.each(chkList,function(item){
            if(item.getValue()){ //Only selected items
                c_found = true;
                columns[c_count] = {'name': item.getName()};
                c_count = c_count +1; //For next one
            }
        },me);

        if(!c_found){
            Ext.ux.Toaster.msg(
                        i18n('sSelect_one_or_more'),
                        i18n('sSelect_one_or_more_columns_please'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{     
            //next we need to find the filter values:
            var filters     = [];
            var f_count     = 0;
            var f_found     = false;
            var filter_json ='';
            
            var filter_collection = me.getGrid().getStore().getFilters();     
            if(filter_collection.count() > 0){
                var i = 0;
                while (f_count < filter_collection.count()) { 

                    console.log(filter_collection.getAt(f_count).serialize( ));
                    f_found         = true;
                    var ser_item    = filter_collection.getAt(f_count).serialize( );
                    ser_item.field  = ser_item.property;
                    filters[f_count]= ser_item;
                    f_count         = f_count + 1;
                    
                }     
            }
            
            var col_json        = "columns="+encodeURIComponent(Ext.JSON.encode(columns));
            var extra_params    = Ext.Object.toQueryString(Ext.Ajax.getExtraParams());
            var append_url      = "?"+extra_params+'&'+col_json;
            if(f_found){
                filter_json = "filter="+encodeURIComponent(Ext.JSON.encode(filters));
                append_url  = append_url+'&'+filter_json;
            }
            window.open(me.getUrlExportCsv()+append_url);
            win.close();
        }
    },

    note: function(button,format) {
        var me      = this;     
        //Find out if there was something selected
        var sel_count = me.getGrid().getSelectionModel().getCount();
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

                //Determine the selected record:
                var sr = me.getGrid().getSelectionModel().getLastSelected();
                
                if(!Ext.WindowManager.get('winNoteNas'+sr.getId())){
                    var w = Ext.widget('winNote',
                        {
                            id          : 'winNoteNas'+sr.getId(),
                            noteForId   : sr.getId(),
                            noteForGrid : 'nas',
                            noteForName : sr.get('nasname')
                        });
                    w.show();     
                }
            }    
        }
    },
    noteReload: function(button){
        var me      = this;
        var grid    = button.up('gridNote');
        grid.getStore().load();
    },
    noteAdd: function(button){
        var me      = this;
        var grid    = button.up('gridNote');
        //See how the wizard should be displayed:
        Ext.Ajax.request({
            url: me.getUrlApChildCheck(),
            method: 'GET',
            success: function(response){
                var jsonData    = Ext.JSON.decode(response.responseText);
                if(jsonData.success){                      
                    if(jsonData.items.tree == true){
                        if(!Ext.WindowManager.get('winNoteNasAdd'+grid.noteForId)){
                            var w   = Ext.widget('winNoteAdd',
                            {
                                id          : 'winNoteNasAdd'+grid.noteForId,
                                noteForId   : grid.noteForId,
                                noteForGrid : grid.noteForGrid,
                                refreshGrid : grid
                            });
                            w.show();       
                        }
                    }else{
                        if(!Ext.WindowManager.get('winNoteNasAdd'+grid.noteForId)){
                            var w   = Ext.widget('winNoteAdd',
                            {
                                id          : 'winNoteNasAdd'+grid.noteForId,
                                noteForId   : grid.noteForId,
                                noteForGrid : grid.noteForGrid,
                                refreshGrid : grid,
                                startScreen : 'scrnNote',
                                user_id     : '0',
                                owner       : i18n('sLogged_in_user'),
                                no_tree     : true
                            });
                            w.show();       
                        }
                    }
                }   
            },
            scope: me
        });
    },
    gridNoteClick: function(item,record){
        var me = this;
        //Dynamically update the top toolbar
        grid    = item.up('gridNote');
        tb      = grid.down('toolbar[dock=top]');
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
    btnNoteTreeNext: function(button){
        var me = this;
        var tree = button.up('treepanel');
        //Get selection:
        var sr = tree.getSelectionModel().getLastSelected();
        if(sr){    
            var win = button.up('winNoteAdd');
            win.down('#owner').setValue(sr.get('username'));
            win.down('#user_id').setValue(sr.getId());
            win.getLayout().setActiveItem('scrnNote');
        }else{
            Ext.ux.Toaster.msg(
                        i18n('sSelect_an_owner'),
                        i18n('sFirst_select_an_Access_Provider_who_will_be_the_owner'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }
    },
    btnNoteAddPrev: function(button){
        var me = this;
        var win = button.up('winNoteAdd');
        win.getLayout().setActiveItem('scrnApTree');
    },
    btnNoteAddNext: function(button){
        var me      = this;
        var win     = button.up('winNoteAdd');
        win.refreshGrid.getStore().load();
        var form    = win.down('form');
        form.submit({
            clientValidation: true,
            url: me.getUrlNoteAdd(),
            params: {for_id : win.noteForId},
            success: function(form, action) {
                win.close();
                win.refreshGrid.getStore().load();
                me.reload();
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
    noteDelete: function(button){
        var me      = this;
        var grid    = button.up('gridNote');
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
                            grid.getStore().load();   //Update the count
                            me.reload();   
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

    //______ EDIT _______

    edit: function(button){
        var me      = this;
        var grid    = button.up('gridNas');

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
                var tp          = grid.up('tabpanel');
                var nas_id      = sr.getId();
                var nas_tab_id  = 'nasTab_'+nas_id;
                var nt          = tp.down('#'+nas_tab_id);
                if(nt){
                    tp.setActiveTab(nas_tab_id); //Set focus on  Tab
                    return;
                }

                var nas_tab_name = sr.get('nasname');
                //Tab not there - add one
                tp.add({ 
                    title :     nas_tab_name,
                    itemId:     nas_tab_id,
                    closable:   true,
                    iconCls:    'edit',
                    glyph: Rd.config.icnEdit, 
                    layout:     'fit', 
                    items:      {'xtype' : 'pnlNas',nas_id: nas_id, url: me.getUrlEditPanelCfg(), record: sr}
                });
                tp.setActiveTab(nas_tab_id); //Set focus on Add Tab
            });
        }
    },

    //__EDIT RELATED EVENTS
    tabOpenVpnRender : function(tab){
        var me      = this;
        var form    = tab.down('form');
        var nas_id  = tab.up('pnlNas').nas_id;
        form.load({url:me.getUrlViewOpenVpn(), method:'GET',params:{nas_id:nas_id}});
    },
    tabOpenVpnActivate : function(tab){
        var me      = this;
        var form    = tab.down('form');
        var nas_id  = tab.up('pnlNas').nas_id;
        form.load({url:me.getUrlViewOpenVpn(), method:'GET',params:{nas_id:nas_id}});
    },
    saveOpenVpn:function(button){

        var me      = this;
        var form    = button.up('form');
        var nas_id  = button.up('pnlNas').nas_id;
        //Checks passed fine...      
        form.submit({
            clientValidation    : true,
            url                 : me.getUrlEditOpenVpn(),
            params              : {nas_id: nas_id},
            success             : function(form, action) {
                me.reload();
                Ext.ux.Toaster.msg(
                    i18n('sItems_modified'),
                    i18n('sItems_modified_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },
            failure             : Ext.ux.formFail
        });
    },
    tabPptpActivate : function(tab){
        var me = this;
        var form    = tab.down('form');
        var nas_id  = tab.up('pnlNas').nas_id;
        form.load({url:me.getUrlViewPptp(), method:'GET',params:{nas_id:nas_id}});
    },
    savePptp:function(button){

        var me      = this;
        var form    = button.up('form');
        var nas_id  = button.up('pnlNas').nas_id;
        //Checks passed fine...      
        form.submit({
            clientValidation    : true,
            url                 : me.getUrlEditPptp(),
            params              : {nas_id: nas_id},
            success             : function(form, action) {
                me.reload();
                Ext.ux.Toaster.msg(
                    i18n('sItems_modified'),
                    i18n('sItems_modified_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },
            failure             : Ext.ux.formFail
        });
    },
    tabDynamicActivate : function(tab){
        var me = this;
        var form    = tab.down('form');
        var nas_id  = tab.up('pnlNas').nas_id;
        form.load({url:me.getUrlViewDynamic(), method:'GET',params:{nas_id:nas_id}});
    },
    saveDynamic:function(button){

        var me      = this;
        var form    = button.up('form');
        var nas_id  = button.up('pnlNas').nas_id;
        //Checks passed fine...      
        form.submit({
            clientValidation    : true,
            url                 : me.getUrlEditDynamic(),
            params              : {id: nas_id},
            success             : function(form, action) {
                me.reload();
                Ext.ux.Toaster.msg(
                    i18n('sItems_modified'),
                    i18n('sItems_modified_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },
            failure             : Ext.ux.formFail
        });
    },
    tabNasActivate : function(tab){
        var me = this;
        var form    = tab.down('form');
        var nas_id  = tab.up('pnlNas').nas_id;
        form.load({url:me.getUrlViewNas(), method:'GET',params:{nas_id:nas_id}});
    },
    tabAvailabilityActivate : function(tab){
        var me      = this;
        tab.getStore().load();
    },
    pnlNasNasSave : function(button){
        var me      = this;
        var form    = button.up('form');
        var pnl_n   = button.up('pnlNas');

        form.submit({
            clientValidation: true,
            url: me.getUrlEditNas(),
            params: {'id' : pnl_n.nas_id },
            success: function(form, action) {
                me.reload();
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

    monitorTypeChange : function(cmb){
        var me = this;
        var form = cmb.up('form');
        var pi = form.down('#ping_interval');
        var da = form.down('#heartbeat_dead_after');
        var val = cmb.getValue();

        if(val == 'off'){
            pi.setVisible(false);
            da.setVisible(false);
        }

        if(val == 'ping'){
            pi.setVisible(true);
            da.setVisible(false);
        }

        if(val == 'heartbeat'){
            pi.setVisible(false);
            da.setVisible(true);
        }   
    },
    chkAvailSubTab: function(chk){
        var me      = this;
        var grid    = chk.up('gridRealmsForNasOwner');
        if(chk.getValue() == true){
            grid.getStore().getProxy().setExtraParam('available_to_siblings',true);
        }else{
            grid.getStore().getProxy().setExtraParam('available_to_siblings',false);
        }
        //Clear the grid:
        grid.getStore().getProxy().setExtraParam('clear_flag',true);
        grid.getStore().load();
        grid.getStore().getProxy().setExtraParam('clear_flag',false);
    },
    tabPhotoActivate: function(tab){
        var me      = this;
        var pnl_n   = tab.up('pnlNas');
        Ext.Ajax.request({
            url: me.getUrlViewPhoto(),
            method: 'GET',
            params: {'id' : pnl_n.nas_id },
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
        var pnl_n   = form.up('pnlNas');
        var pnlNphoto = pnl_n.down('pnlNasPhoto');
        form.submit({
            clientValidation: true,
            waitMsg: 'Uploading your photo...',
            url: me.getUrlUploadPhoto(),
            params: {'id' : pnl_n.nas_id },
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

    //_____ DELETE ______
    del:   function(button){
        var me      = this;  
        var grid    = button.up('gridNas');   
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
                        success: function(batch,options){//console.log('success');
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
        var grid        = button.up('gridNas');
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
                        title :     map_tab_name,
                        itemId:     map_tab_id,
                        closable:   true,
                        iconCls:    'map',
                        glyph: Rd.config.icnMap, 
                        layout:     'fit', 
                        items:      {
                                xtype: 'pnlGMap',
                                store:  me.getStore('sNas'),
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
    gridNasAvailabilityReload: function(button){
        var me      = this;
        var grid    = button.up('gridNasAvailability');
        grid.getStore().load();
    },
    tabRealmsActivate : function(tab){
        var me      = this;
        var gridR   = tab.down('gridRealmsForNasOwner');
        gridR.getStore().load();
    },
    gridNasAvailabilityDelete:   function(button){
        var me      = this;  
        var grid    = button.up('gridNasAvailability');   
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
    //Actions
    gridNasActionsReload: function(button){
        var me      = this;
        var grid    = button.up('gridNasActions');
        grid.getStore().load();
    },
    tabActionsActivate : function(tab){
        var me      = this;
        tab.getStore().load();
    },
    gridNasActionsAdd: function(button){
        var me      = this;
        var pnl_nas = button.up('pnlNas');
        var grid    = button.up('gridNasActions');
        var nas_id  = pnl_nas.nas_id;
        if(!Ext.WindowManager.get('winNasActionAddId')){
            var w = Ext.widget('winNasActionAdd',{id:'winNasActionAddId',nas_id: nas_id,grid: grid});
            w.show();      
       }   
    },
   gridNasActionsAddSubmit: function(button){
        var me      = this;
        var form    = button.up('form');
        var win     = button.up('winNasActionAdd');

        form.submit({
            clientValidation: true,
            url             : me.getUrlNasActionsAdd(),
            success: function(form, action) {
                win.grid.getStore().load(); //Refresh the grid
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
    gridNasActionsDelete:   function(button){
        var me      = this;  
        var grid    = button.up('gridNasActions');   
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
            var tab_id  = 'nasTabGraph_'+id;
            var nt      = tp.down('#'+tab_id);
            if(nt){
                tp.setActiveTab(tab_id); //Set focus on  Tab
                return;
            }

            var tab_name = sr.get('nasname');
            //Tab not there - add one
            console.log(tab_id);
            tp.add({ 
                title   : tab_name,
                itemId  : tab_id,
                closable: true,
                glyph   : Rd.config.icnGraph, 
                xtype   : 'pnlNasGraphs',
                nas_id  : id
            });
            tp.setActiveTab(tab_id); //Set focus on Add Tab 
        }
    },
    loadGraph: function(tab){
        var me  = this;
        tab.down("chart").setLoading(true);
        //Get the value of the Day:
        var day = tab.down('#day');
        tab.down("chart").getStore().getProxy().setExtraParam('day',day.getValue());
        me.reloadChart(tab);
    },
    reloadDailyGraph: function(btn){
        var me  = this;
        console.log("Reload hom");
        tab     = btn.up("#daily");
        me.reloadChart(tab);
    },
    changeDailyGraph: function(d,new_val, old_val){
        var me      = this;
        var tab     = d.up("#daily");
        tab.down("chart").getStore().getProxy().setExtraParam('day',new_val);
        me.reloadChart(tab);
    },
    reloadWeeklyGraph: function(btn){
        var me  = this;
        tab     = btn.up("#weekly");
        me.reloadChart(tab);
    },
    changeWeeklyGraph: function(d,new_val, old_val){
        var me      = this;
        var tab     = d.up("#weekly");
        tab.down("chart").getStore().getProxy().setExtraParam('day',new_val);
        me.reloadChart(tab);
    },
    reloadMonthlyGraph: function(btn){
        var me  = this;
        tab     = btn.up("#monthly");
        me.reloadChart(tab);
    },
    changeMonthlyGraph: function(d,new_val, old_val){
        var me      = this;
        var tab     = d.up("#monthly");
        tab.down("chart").getStore().getProxy().setExtraParam('day',new_val);
        me.reloadChart(tab);
    },
    reloadChart: function(tab){
        var me      = this;
        var chart   = tab.down("chart");
        chart.setLoading(true); //Mask it
        chart.getStore().load({
            scope: me,
            callback: function(records, operation, success) {
                chart.setLoading(false);
                if(success){
                    Ext.ux.Toaster.msg(
                            "Graph fetched",
                            "Graph detail fetched OK",
                            Ext.ux.Constants.clsInfo,
                            Ext.ux.Constants.msgInfo
                        );
                    //-- Show totals
                    var rawData     = chart.getStore().getProxy().getReader().rawData;
                    var totalIn     = Ext.ux.bytesToHuman(rawData.totalIn);
                    var totalOut    = Ext.ux.bytesToHuman(rawData.totalOut);
                    var totalInOut  = Ext.ux.bytesToHuman(rawData.totalInOut);
                    tab.down('#totals').update({'in': totalIn, 'out': totalOut, 'total': totalInOut });

                }else{
                    Ext.ux.Toaster.msg(
                            "Problem fetching graph",
                            "Problem fetching graph detail",
                            Ext.ux.Constants.clsWarn,
                            Ext.ux.Constants.msgWarn
                        );
                } 
            }
        });   
    }
});

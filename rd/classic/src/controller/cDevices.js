Ext.define('Rd.controller.cDevices', {
    extend: 'Ext.app.Controller',
    actionIndex: function(tp){
        var me      = this;
        me.ui       = Rd.config.tabDevices; //This is set in the config file      
        var me      = this;  
        var tab     = tp.items.findBy(function (tab){
            return tab.getXType() === 'gridDevices';
        });
        
        if (!tab){
            tab = tp.insert(1,{
                xtype   : 'gridDevices',
                padding : Rd.config.gridPadding,
                border  : false,
                itemId  : 'tabDevices',
                glyph   : Rd.config.icnDevice,
                title   : 'BYOD',
                plain	: true,
                closable: true, 
                tabConfig: {
                    ui: me.ui
                }
            });
        }      
        tp.setActiveTab(tab);
        me.populated = true;
    },

    views:  [
       'devices.gridDevices',    'devices.winDeviceAddWizard',
       'components.cmbPermanentUser',   'components.cmbProfile',  'components.cmbCap',
       'components.winNote',            'components.winNoteAdd',  'components.winCsvColumnSelect',
       'components.winEnableDisable',   'devices.pnlDevice',      'devices.gridDeviceRadaccts', 
       'devices.gridDeviceRadpostauths','devices.gridDevicePrivate', 'components.pnlUsageGraph',
       'components.cmbVendor',          'components.cmbAttribute',
       'devices.pnlDeviceGraphs'
    ],
    stores: [ 'sAccessProvidersTree',   'sPermanentUsers', 'sRealms',   'sProfiles',    'sDevices', 'sAttributes', 'sVendors'  ],
    models: ['mAccessProviderTree',     'mPermanentUser',  'mRealm',    'mProfile',     'mDevice',   'mUserStat',
             'mRadacct',                'mRadpostauth',    'mAttribute','mVendor',      'mPrivateAttribute'
    ],
    selectedRecord: null,
     config: {
        urlAdd              : '/cake3/rd_cake/devices/add.json',
        urlApChildCheck     : '/cake3/rd_cake/access-providers/child-check.json',
        urlExportCsv        : '/cake3/rd_cake/devices/export-csv',
        urlNoteAdd          : '/cake3/rd_cake/devices/note-add.json',
        urlViewBasic        : '/cake3/rd_cake/devices/view-basic-info.json',
        urlEditBasic        : '/cake3/rd_cake/devices/edit-basic-info.json',
        urlEnableDisable    : '/cake3/rd_cake/devices/enable-disable.json',
        urlDelete           : '/cake3/rd_cake/devices/delete.json',
        
        urlDeleteRadaccts:  '/cake3/rd_cake/radaccts/delete.json',
        urlDeletePostAuths: '/cake3/rd_cake/radpostauths/delete.json'
    },
    refs: [
        {  ref: 'grid',         selector:   'gridDevices'},
        {  ref: 'privateGrid',  selector:   'gridDevicePrivate'},
        {  ref: 'tabUsers',     selector: '#tabUsers'     }      
    ],
    init: function() {
        var me = this;
        if (me.inited) {
            return;
        }
        me.inited = true;
        
        me.control({
            '#tabDevices' : {
                destroy   :      me.appClose   
            },
           'gridDevices #reload': {
                click:      me.reload
            }, 
            'gridDevices #add'   : {
                click:      me.add
            },
            'gridDevices #delete'   : {
                click:      me.del
            },
            'gridDevices #edit'   : {
                click:      me.edit
            },
            'gridDevices #note'   : {
                click:      me.note
            },
            'gridDevices #csv'  : {
                click:      me.csvExport
            },
            'gridDevices #enable_disable' : {
                click:      me.enableDisable
            },
            'gridDevices #test_radius' : {
                click:      me.testRadius
            },
            'gridDevices #graph'   : {
                click:      me.graph
            },
            'gridDevices'   : {
                select          : me.select,
                activate        : me.gridActivate,
                menuItemClick   : me.onActionColumnMenuItemClick 
            },
            'gridDevices actioncolumn': { 
                 itemClick  : me.onActionColumnItemClick
            },
            'winDeviceAddWizard #btnDataNext' : {
                click:  me.btnDataNext
            },
            'winDeviceAddWizard #profile' : {
                change:  me.cmbProfileChange
            },
			'winDeviceAddWizard #owner' : {
                change:  me.cmbOwnerChange
            },
            'winDeviceAddWizard #always_active' : {
                change:  me.chkAlwaysActiveChange
            },
            'winDeviceAddWizard #to_date' : {
                change:  me.toDateChange
            },
            'winDeviceAddWizard #from_date' : {
                change:  me.fromDateChange
            },
            '#winCsvColumnSelectDevices #save': {
                click:  me.csvExportSubmit
            },
            'gridNote[noteForGrid=devices] #reload' : {
                click:  me.noteReload
            },
            'gridNote[noteForGrid=devices] #add' : {
                click:  me.noteAdd
            },
            'gridNote[noteForGrid=devices] #delete' : {
                click:  me.noteDelete
            },
            'gridNote[noteForGrid=devices]' : {
                itemclick: me.gridNoteClick
            },
            'winNoteAdd[noteForGrid=devices] #btnTreeNext' : {
                click:  me.btnNoteTreeNext
            },
            'winNoteAdd[noteForGrid=devices] #btnNoteAddPrev'  : {   
                click: me.btnNoteAddPrev
            },
            'winNoteAdd[noteForGrid=devices] #btnNoteAddNext'  : {   
                click: me.btnNoteAddNext
            },
            '#winEnableDisableDevice #save': {
                click: me.enableDisableSubmit
            },
            'pnlDevice gridUserRadpostauths #reload' :{
                click:      me.gridDeviceRadpostauthsReload
            },
            'pnlDevice gridDeviceRadpostauths #delete' :{
                click:      me.deletePostAuths
            },
            'pnlDevice gridDevicePrivate' : {
                select:        me.selectDevicePrivate,
                activate:      me.onDeviceActivate
            },
            'pnlDevice gridDeviceRadpostauths' : {
                activate:      me.onDeviceRadpostauthsActivate
            },
            'pnlDevice gridDeviceRadaccts #reload' :{
                click:      me.gridDeviceRadacctsReload
            },
            'pnlDevice gridDeviceRadaccts #delete' :{
                click:      me.deleteRadaccts
            },
            'pnlDevice gridDeviceRadaccts' : {
                activate:      me.onDeviceRadacctsActivate
            },
            'pnlDevice #profile' : {
                change:  me.cmbProfileChange,
                render:  me.renderEventProfile
            },
            'pnlDevice #owner' : {
                render:  me.renderEventOwner,
                change:  me.cmbOwnerChange
            },
            'pnlDevice #always_active' : {
                change:  me.chkAlwaysActiveChange
            },
            'pnlDevice #to_date' : {
                change:  me.toDateChange
            },
            'pnlDevice #from_date' : {
                change:  me.fromDateChange
            },
            'pnlDevice #tabBasicInfo' : {
                activate: me.onTabBasicInfoActive
            },
            'pnlDevice #tabBasicInfo #save' : {
                click: me.saveBasicInfo
            },
            'gridDevicePrivate' : {
                beforeedit:     me.onBeforeEditDevicePrivate
            },
            'gridDevicePrivate  #cmbVendor': {
                change:      me.cmbVendorChange
            },
            'gridDevicePrivate  #add': {
                click:      me.attrAdd
            },
            'gridDevicePrivate  #reload': {
                click:      me.attrReload
            },
            'gridDevicePrivate  #delete': {
                click:      me.attrDelete
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
        me.getGrid().getSelectionModel().deselectAll(true);
        me.getStore('sDevices').load();
    },
    gridActivate: function(g){
        var me = this;  
        g.getStore().load();
    },
    add: function(button){
        var me = this;
        if(!Ext.WindowManager.get('winDeviceAddWizardId')){
            var w = Ext.widget('winDeviceAddWizard',{
                id:'winDeviceAddWizardId', selLanguage : me.application.getSelLanguage()
            });
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
                me.getStore('sDevices').load();
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
	cmbOwnerChange: function(cmb){
		var me      = this;
		var value   = cmb.getValue();
		var rec 	= cmb.getStore().getById(value);
		var ap_id	= rec.get('owner_id');
		var form    = cmb.up('form');
		form.down('cmbProfile').getStore().getProxy().setExtraParam('ap_id',ap_id);
		form.down('cmbProfile').getStore().load();
	},
    cmbProfileChange:   function(cmb){
        var me      = this;
        var form    = cmb.up('form');
        var cmbDataCap  = form.down('#cmbDataCap');
        var cmbTimeCap  = form.down('#cmbTimeCap');
        var value   = cmb.getValue();
        var s = cmb.getStore();
        var r = s.getById(value);
        if(r != null){
            var data_cap = r.get('data_cap_in_profile');
            if(data_cap){
                cmbDataCap.setVisible(true);
                cmbDataCap.setDisabled(false);
            }else{
                cmbDataCap.setVisible(false);
                cmbDataCap.setDisabled(true);
            }
            var time_cap = r.get('time_cap_in_profile');
            if(time_cap){
                cmbTimeCap.setVisible(true);
                cmbTimeCap.setDisabled(false);
            }else{
                cmbTimeCap.setVisible(false);
                cmbTimeCap.setDisabled(true);
            }
        }
    },
    chkAlwaysActiveChange: function(chk){
        var me      = this;
        var form    = chk.up('form');
        var from    = form.down('#from_date');
        var to      = form.down('#to_date');
        var value   = chk.getValue();
        if(value){
            to.setVisible(false);
            to.setDisabled(true);
            from.setVisible(false);
            from.setDisabled(true);
        }else{
            to.setVisible(true);
            to.setDisabled(false);
            from.setVisible(true);
            from.setDisabled(false);
        }
    },
    toDateChange: function(d,newValue,oldValue){
        var me = this;
        var form = d.up('form');   
        var from_date = form.down('#from_date');
        if(newValue <= from_date.getValue()){
            Ext.ux.Toaster.msg(
                        i18n('sEnd_date_wrong'),
                        i18n('sThe_end_date_should_be_after_the_start_date'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }
    },
    fromDateChange: function(d,newValue, oldValue){
        var me = this;
        var form = d.up('form');
        var to_date = form.down('#to_date');
        if(newValue >= to_date.getValue()){
            Ext.ux.Toaster.msg(
                        i18n('sStart_date_wrong'),
                        i18n('sThe_start_date_should_be_before_the_end_date'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }
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
    onStoreDevicesLoaded: function() {
        var me      = this;
        var count   = me.getStore('sDevices').getTotalCount();
        me.getGrid().down('#count').update({count: count});
    },
    edit:   function(){
      //  console.log("Edit device");  
        var me = this;
        //See if there are anything selected... if not, inform the user
        var sel_count = me.getGrid().getSelectionModel().getCount();
        if(sel_count == 0){
            Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{

            var selected    =  me.getGrid().getSelectionModel().getSelection();
            var count       = selected.length;         
            Ext.each(me.getGrid().getSelectionModel().getSelection(), function(sr,index){

                //Check if the node is not already open; else open the node:
                var tp          = me.getGrid().up('tabpanel');
                var d_id        = sr.getId();
                var d_tab_id    = 'dTab_'+d_id;
                var nt          = tp.down('#'+d_tab_id);
                if(nt){
                    tp.setActiveTab(d_tab_id); //Set focus on  Tab
                    return;
                }

                var d_tab_name = sr.get('name');
                //Tab not there - add one
                tp.add({ 
                    title :     d_tab_name,
                    itemId:     d_tab_id,
                    closable:   true,
                    iconCls:    'edit', 
                    glyph: Rd.config.icnEdit,
                    tabConfig: {
                         ui: me.ui
                    },
                    layout:     'fit', 
                    items:      {'xtype' : 'pnlDevice',d_id: d_id, d_name: d_tab_name,record:sr}
                });
                tp.setActiveTab(d_tab_id); //Set focus on Add Tab             
            });
        }
    },
    csvExport: function(button,format) {
        var me          = this;
        var columns     = me.getGrid().down('headercontainer').getGridColumns();
        var col_list    = [];
        Ext.Array.each(columns, function(item,index){
            if(item.dataIndex != ''){
                var chk = {boxLabel: item.text, name: item.dataIndex, checked: true};
                col_list.push(chk);
            }
        }); 

        if(!Ext.WindowManager.get('winCsvColumnSelectDevices')){
            var w = Ext.widget('winCsvColumnSelect',{id:'winCsvColumnSelectDevices',columns: col_list});
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

                    //console.log(filter_collection.getAt(f_count).serialize( ));
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
                
                if(!Ext.WindowManager.get('winNoteDevices'+sr.getId())){
                    var w = Ext.widget('winNote',
                        {
                            id          : 'winNoteDevices'+sr.getId(),
                            noteForId   : sr.getId(),
                            noteForGrid : 'devices',
                            noteForName : sr.get('name')
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
                        if(!Ext.WindowManager.get('winNoteDevicesAdd'+grid.noteForId)){
                            var w   = Ext.widget('winNoteAdd',
                            {
                                id          : 'winNoteDevicesAdd'+grid.noteForId,
                                noteForId   : grid.noteForId,
                                noteForGrid : grid.noteForGrid,
                                refreshGrid : grid
                            });
                            w.show();       
                        }
                    }else{
                        if(!Ext.WindowManager.get('winNoteDevicesAdd'+grid.noteForId)){
                            var w   = Ext.widget('winNoteAdd',
                            {
                                id          : 'winNoteDevicesAdd'+grid.noteForId,
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
      //  console.log(win.noteForId);
      //  console.log(win.noteForGrid);
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
    enableDisable: function(){
        var me      = this;
        var grid    = me.getGrid();
        //Find out if there was something selected
        if(grid.getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item_to_modify'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            if(!Ext.WindowManager.get('winEnableDisableDevice')){
                var w = Ext.widget('winEnableDisable',{id:'winEnableDisableDevice'});
                w.show();      
            }    
        }
    },
    enableDisableSubmit:function(button){
        var me      = this;
        var win     = button.up('window');
        var form    = win.down('form');

        var extra_params    = {};
        var s               = me.getGrid().getSelectionModel().getSelection();
        Ext.Array.each(s,function(record){
            var r_id = record.getId();
            extra_params[r_id] = r_id;
        });

        //Checks passed fine...      
        form.submit({
            clientValidation    : true,
            url                 : me.getUrlEnableDisable(),
            params              : extra_params,
            success             : function(form, action) {
                win.close();
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
    testRadius: function(){
        var me      = this;
        var grid    = me.getGrid();       
        //Find out if there was something selected
        if(grid.getSelectionModel().getCount() == 0){ 
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item_to_test'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            var sr = grid.getSelectionModel().getLastSelected();
            me.application.runAction('cRadiusClient','TestDevice',sr);        
        }
    },  
    onTabBasicInfoActive: function(t){
        var me      = this;
        var form    = t.down('form');
        //get the user's id
        var device_id = t.up('pnlDevice').d_id;
        form.load({url:me.getUrlViewBasic(), method:'GET',params:{device_id:device_id}, 
            success : function(a,b){
                //Set the CAP's of the permanent user
                if(b.result.data.data_cap_type != undefined){
                    var cmbDataCap  = form.down('#cmbDataCap');
                    cmbDataCap.setVisible(true);
                    cmbDataCap.setDisabled(false);
                    cmbDataCap.setValue(b.result.data.data_cap_type);
                }

                if(b.result.data.time_cap_type != undefined){
                    var cmbTimeCap  = form.down('#cmbTimeCap');
                    cmbTimeCap.setVisible(true);
                    cmbTimeCap.setDisabled(false);
                    cmbTimeCap.setValue(b.result.data.time_cap_type);
                }
            } 
        });
    },
    saveBasicInfo:function(button){

        var me      = this;
        var form    = button.up('form');
        var device_id = button.up('pnlDevice').d_id;
        //Checks passed fine...      
        form.submit({
            clientValidation    : true,
            url                 : me.getUrlEditBasic(),
            params              : {id: device_id},
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
    onDeviceActivate: function(g){
        var me = this;
        g.getStore().load();
    },
    onDeviceRadpostauthsActivate: function(g){
        var me = this;
        g.getStore().load();
    },
    gridDeviceRadpostauthsReload: function(button){
        var me  = this;
        var g = button.up('gridDeviceRadpostauths');
        g.getStore().load();
    },
    onDeviceRadacctsActivate: function(g){
        var me = this;
        g.getStore().load();
    },
    onDevicePrivateActivate: function(g){
        var me = this;
        g.getStore().load();
    },
    gridDeviceRadacctsReload: function(button){
        var me  = this;
        var g = button.up('gridDeviceRadaccts');
        g.getStore().load();
    },
    deletePostAuths:   function(button){
        var me      = this;
        var grid    = button.up('grid');
     //   console.log("Generic delete clicked...");    
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
                    var selected    = grid.getSelectionModel().getSelection();
                    var list        = [];
                    Ext.Array.forEach(selected,function(item){
                        var id = item.getId();
                        Ext.Array.push(list,{'id' : id});
                    });
                    Ext.Ajax.request({
                        url: me.getUrlDeletePostAuths(),
                        method: 'POST',          
                        jsonData: list,
                        success: function(batch,options){console.log('success');
                            Ext.ux.Toaster.msg(
                                i18n('sItem_deleted'),
                                i18n('sItem_deleted_fine'),
                                Ext.ux.Constants.clsInfo,
                                Ext.ux.Constants.msgInfo
                            );
                            grid.getSelectionModel().deselectAll(true);
                            grid.getStore().load();
                        },                                    
                        failure: function(batch,options){
                            Ext.ux.Toaster.msg(
                                i18n('sProblems_deleting_item'),
                                batch.proxy.getReader().rawData.message.message,
                                Ext.ux.Constants.clsWarn,
                                Ext.ux.Constants.msgWarn
                            );
                            grid.getSelectionModel().deselectAll(true);
                            grid.getStore().load();
                        }
                    });
                }
            });
        }
    },
    deleteRadaccts:   function(button){
        var me      = this;
        var grid    = button.up('grid');   
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
                    var selected    = grid.getSelectionModel().getSelection();
                    var list        = [];
                    Ext.Array.forEach(selected,function(item){
                        var id = item.getId();
                        Ext.Array.push(list,{'id' : id});
                    });
                    Ext.Ajax.request({
                        url: me.getUrlDeleteRadaccts(),
                        method: 'POST',          
                        jsonData: list,
                        success: function(batch,options){console.log('success');
                            Ext.ux.Toaster.msg(
                                i18n('sItem_deleted'),
                                i18n('sItem_deleted_fine'),
                                Ext.ux.Constants.clsInfo,
                                Ext.ux.Constants.msgInfo
                            );
                            grid.getSelectionModel().deselectAll(true);
                            grid.getStore().load();
                        },                                    
                        failure: function(batch,options){
                            Ext.ux.Toaster.msg(
                                i18n('sProblems_deleting_item'),
                                batch.proxy.getReader().rawData.message.message,
                                Ext.ux.Constants.clsWarn,
                                Ext.ux.Constants.msgWarn
                            );
                            grid.getSelectionModel().deselectAll(true);
                            grid.getStore().load();
                        }
                    });
                }
            });
        }
    },
    selectDevicePrivate:  function(grid, record, item, index, event){
        var me = this;
        //Adjust the Edit and Delete buttons accordingly...
        //Dynamically update the top toolbar
        tb = me.getPrivateGrid().down('toolbar[dock=top]');
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
    onBeforeEditDevicePrivate: function(g,e){
        var me = this;
        return e.record.get('edit');
    },
    cmbVendorChange: function(cmb){
        var me = this;
       // console.log("Combo thing changed");
        var value   = cmb.getValue();
        var grid    = cmb.up('gridDevicePrivate');
        var attr    = grid.down('cmbAttribute');
        //Cause this to result in a reload of the Attribute combo
        attr.getStore().getProxy().setExtraParam('vendor',value);
        attr.getStore().load();   
    },
    attrAdd: function(b){
        var me = this;
      //  console.log("Add to specific template");
        var grid    = b.up('gridDevicePrivate');
        var attr    = grid.down('cmbAttribute');
        var a_val   = attr.getValue();
        if(a_val == null){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{

            //We do double's
            var f = grid.getStore().find('attribute',a_val);
            if(f == -1){
                grid.getStore().add(Ext.create('Rd.model.mPrivateAttribute',
                    {
                        type            : 'check',
                        attribute       : a_val,
                        op              : ':=',
                        value           : i18n('sReplace_this_value'),
                        delete          : true,
                        edit            : true
                    }
                ));
                grid.getStore().sync();
            }else{
                //We allow second entried for multiple values
                grid.getStore().add(Ext.create('Rd.model.mPrivateAttribute',
                    {
                        type            : 'check',
                        attribute       : a_val,
                        op              : '+=',
                        value           : i18n('sReplace_this_value'),
                        delete          : true,
                        edit            : true
                    }
                ));
                grid.getStore().sync(); 
            }
        }
    },
    attrReload: function(b){
        var me = this;
        var grid = b.up('gridDevicePrivate');
        grid.getStore().load();
    },
    attrDelete: function(button){

        var me      = this;
        var grid    = button.up('gridDevicePrivate');
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
                           // grid.getStore().load();   //Update the count
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
    renderEventOwner: function(cmb){
        var me                      = this;
        var pnlDevice               = cmb.up('pnlDevice');
        pnlDevice.cmbOwnerRendered  = true;
        if(pnlDevice.record != undefined){
            var un      = pnlDevice.record.get('permanent_user');
            var u_id    = pnlDevice.record.get('permanent_user_id');
            var rec     = Ext.create('Rd.model.mPermanentUser', {username: un, id: u_id});
            cmb.getStore().loadData([rec],false);
        }
    },
    renderEventProfile: function(cmb){
        var me          = this;
        var pnlDevice   = cmb.up('pnlDevice');
        pnlDevice.cmbProfileRendered  = true;
        if(pnlDevice.record != undefined){
            var pn      = pnlDevice.record.get('profile');
            var p_id    = pnlDevice.record.get('profile_id');
            var rec     = Ext.create('Rd.model.mProfile', {name: pn, id: p_id});
            cmb.getStore().loadData([rec],false);
        }
    },
    graph: function(){
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
            var tab_id  = 'deviceTabGraph_'+id;
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
                title   : tab_name,
                itemId  : tab_id,
                closable: true,
                glyph   : Rd.config.icnGraph, 
                xtype   : 'pnlDeviceGraphs',
                timezone_id : timezone_id,
                d_name  : tab_name,
                tabConfig: {
                     ui: me.ui
                }
            });
            tp.setActiveTab(tab_id); //Set focus on Add Tab 
        }
    },
    onActionColumnItemClick: function(view, rowIndex, colIndex, item, e, record, row, action){
        var me = this;
        var grid = view.up('grid');
        grid.setSelection(record);
        if(action == 'update'){
            me.edit(); 
        }
        if(action == 'delete'){
            me.del(); 
        }
    },
    onActionColumnMenuItemClick: function(grid,action){
        var me = this;
        grid.setSelection(grid.selRecord);
        if(action == 'disable'){
            me.enableDisable();
        }
        if(action == 'radius'){
            me.testRadius();
        }
        if(action == 'graphs'){
            me.graph();
        }
    }
});

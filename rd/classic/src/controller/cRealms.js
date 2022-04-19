Ext.define('Rd.controller.cRealms', {
    extend: 'Ext.app.Controller',
    actionIndex: function(pnl){

        var me = this;
        
        if (me.populated) {
            return; 
        }
        me.ui  = Rd.config.tabRealms; //This is set in the config file       
        pnl.add({ 
            padding : Rd.config.gridPadding,
            xtype   : 'gridRealms'
        });
        
        pnl.on({activate : me.gridActivate,scope: me});
        me.populated = true;
    },
    views:  [
        'realms.gridRealms',                'realms.winRealmAddWizard', 'realms.winRealmAdd',   'realms.pnlRealm',
        'components.winCsvColumnSelect',    'components.winNote',       'components.winNoteAdd','realms.pnlRealmDetail',
        'realms.pnlRealmLogo',              'components.pnlUsageGraph',
        'realms.pnlRealmGraphs',
        'components.winSelectOwner'
    ],
    stores: ['sRealms','sAccessProvidersTree'],
    models: ['mRealm','mAccessProviderTree', 'mUserStat'],
    selectedRecord: null,
    config: {
        urlAdd:             '/cake3/rd_cake/realms/add.json',
        urlEdit:            '/cake3/rd_cake/realms/edit.json',
        urlDelete:          '/cake3/rd_cake/realms/delete.json',
        urlApChildCheck:    '/cake3/rd_cake/access-providers/child-check.json',
        urlExportCsv:       '/cake3/rd_cake/realms/export-csv',
        urlNoteAdd:         '/cake3/rd_cake/realms/note-add.json',
        urlViewRealmDetail: '/cake3/rd_cake/realms/view.json',
        urlLogoBase:        '/cake3/rd_cake/img/realms/',
        urlUploadLogo:      '/cake3/rd_cake/realms/upload-logo/'
    },
    refs: [
         {  ref:    'gridRealms',           selector:   'gridRealms'},
         {  ref:    'gridAdvancedRealms',   selector:   'gridAdvancedRealms'},
         { ref:     'grid',                 selector:   'gridRealms'}
    ],
    init: function() {
        me = this;
        if (me.inited) {
            return;
        }
        me.inited = true;
        
        me.control({
            'gridRealms #reload': {
                click:      me.reload
            },
            'gridRealms #add': {
                click:      me.add
            },
            'gridRealms #delete': {
                click:      me.del
            },
            'gridRealms #edit': {
                click:      me.edit
            },
            'gridRealms #note'   : {
                click:      me.note
            },
            'gridRealms #csv'  : {
                click:      me.csvExport
            },
            'gridRealms #logo'  : {
                click:      me.logo
            },
            'gridRealms #graph'   : {
                click:      me.graph
            },
            'gridRealms'   : {
                itemclick       :  me.gridClick,
                menuItemClick   : me.onActionColumnMenuItemClick 
            },
            'gridRealms actioncolumn': { 
                 itemClick  : me.onActionColumnItemClick
            },
            'winRealmAddWizard #btnTreeNext' : {
                click:  me.btnTreeNext
            },
            'winRealmAddWizard #btnDataPrev' : {
                click:  me.btnRealmDetailPrev
            },
            'winRealmAddWizard #btnDataNext' : {
                click:  me.addSubmit
            },
            '#tabAdmin pnlRealmDetail #btnPickOwner': {
                click:  me.btnPickOwner
            },
            '#tabAdmin pnlRealmDetail #save' : {
                click:  me.editSubmit
            },
            '#winCsvColumnSelectRealms #save': {
                click:  me.csvExportSubmit
            },
            'gridNote[noteForGrid=realms] #reload' : {
                click:  me.noteReload
            },
            'gridNote[noteForGrid=realms] #add' : {
                click:  me.noteAdd
            },
            'gridNote[noteForGrid=realms] #delete' : {
                click:  me.noteDelete
            },
            'gridNote[noteForGrid=realms]' : {
                itemclick: me.gridNoteClick
            },
            'winNoteAdd[noteForGrid=realms] #btnTreeNext' : {
                click:  me.btnNoteTreeNext
            },
            'winNoteAdd[noteForGrid=realms] #btnNoteAddPrev'  : {   
                click: me.btnNoteAddPrev
            },
            'winNoteAdd[noteForGrid=realms] #btnNoteAddNext'  : {   
                click: me.btnNoteAddNext
            },
            '#tabAdmin pnlRealmDetail': {
                activate:       me.tabDetailActivate
            },
            '#tabAdmin pnlRealmLogo': {
                activate:       me.tabLogoActivate
            },
            '#tabAdmin pnlRealmLogo #save': {
                click:       me.logoSave
            },
            '#tabAdmin pnlRealmLogo #cancel': {
                click:       me.logoCancel
            }
         
        });;
    },
    gridActivate: function(g){
        var me = this;
        var grid = g.down('grid');
        if(grid){
            grid.getStore().load();
        }else{
            g.getStore().load();
        }        
    },
    appClose:   function(){
        var me          = this;
        me.populated    = false;
    },
    reload: function(){
        var me =this;
        me.getGrid().getSelectionModel().deselectAll(true);
        me.getGrid().getStore().load();
    },
    gridClick:  function(grid, record, item, index, event){
        var me                  = this;
        me.selectedRecord = record;
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
    add: function(button){
        var me = this;
        //We need to do a check to determine if this user (be it admin or acess provider has the ability to add to children)
        //admin/root will always have, an AP must be checked if it is the parent to some sub-providers. If not we will simply show the add window
        //if it does have, we will show the add wizard.

        Ext.Ajax.request({
            url: me.getUrlApChildCheck(),
            method: 'GET',
            success: function(response){
                var jsonData    = Ext.JSON.decode(response.responseText);
                if(jsonData.success){
                    if(jsonData.items.tree == true){
                        if(!Ext.WindowManager.get('winApAddWizardId')){
                            var w = Ext.widget('winRealmAddWizard',
                            {
                                id          :'winRealmAddWizardId'
                            });
                            w.show();         
                        }
                    }else{
                        if(!Ext.WindowManager.get('winApAddWizardId')){
                            var w   = Ext.widget('winRealmAddWizard',
                            {
                                id          : 'winRealmAddWizardId',
                                startScreen : 'scrnData',
                                user_id     : '0',
                                owner       : i18n('sLogged_in_user'),
                                no_tree     : true
                            });
                            w.show()       
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
            var win = button.up('winRealmAddWizard');
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
    btnRealmDetailPrev: function(button){
        var me = this;
        var win = button.up('winRealmAddWizard');
        win.getLayout().setActiveItem('scrnApTree');
    },
    addSubmit: function(button){
        var me      = this;
        var win     = button.up('window');
        var form    = win.down('form');
        form.submit({
            clientValidation: true,
            url: me.getUrlAdd(),
            success: function(form, action) {
                win.close();
                me.getStore('sRealms').load();
                Ext.ux.Toaster.msg(
                    i18n('sNew_item_created'),
                    i18n('sItem_created_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },
            //Focus on the first tab as this is the most likely cause of error 
            failure: function(form,action){
                var tp = win.down('tabpanel');
                tp.setActiveTab(0);
                Ext.ux.formFail(form,action)
            }
        });
    },
    del:   function(button){
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
    edit: function(){
        var me = this;
        var grid    = me.getGrid();  
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
            var tab_id  = 'realmTab_'+id;
            var nt      = tp.down('#'+tab_id);
            if(nt){
                tp.setActiveTab(tab_id); //Set focus on  Tab
                return;
            }

            //var tab_name = me.selectedRecord.get('name');
            var tab_name = me.getGrid().getSelectionModel().getLastSelected().get('name');
            //Tab not there - add one
            tp.add({ 
                title       : tab_name,
                itemId      : tab_id,
                closable    : true,
                glyph       : Rd.config.icnEdit, 
                xtype       : 'pnlRealmDetail',
                realm_id    : id,
                tabConfig : {
                    ui : me.ui
                }
            });
            tp.setActiveTab(tab_id); //Set focus on Add Tab
        }
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
    editSubmit: function(button){
        var me      = this;
        var form    = button.up('form');
        var tab     = button.up('pnlRealmDetail'); 
        form.submit({
            clientValidation: true,
            url: me.getUrlEdit(),
            success: function(form, action) {
                me.getStore('sRealms').load();
                Ext.ux.Toaster.msg(
                    i18n('sItem_updated'),
                    i18n('sItem_updated_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
                me.tabDetailActivate(tab);
            },
            failure: Ext.ux.formFail
        });
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

        if(!Ext.WindowManager.get('winCsvColumnSelectRealms')){
            var w = Ext.widget('winCsvColumnSelect',{id:'winCsvColumnSelectRealms',columns: col_list});
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

                   // console.log(filter_collection.getAt(f_count).serialize( ));
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
                
                if(!Ext.WindowManager.get('winNoteRealms'+sr.getId())){
                    var w = Ext.widget('winNote',
                        {
                            id          : 'winNoteRealms'+sr.getId(),
                            noteForId   : sr.getId(),
                            noteForGrid : 'realms',
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
                        if(!Ext.WindowManager.get('winNoteRealmsAdd'+grid.noteForId)){
                            var w   = Ext.widget('winNoteAdd',
                            {
                                id          : 'winNoteRealmsAdd'+grid.noteForId,
                                noteForId   : grid.noteForId,
                                noteForGrid : grid.noteForGrid,
                                refreshGrid : grid
                            });
                            w.show();       
                        }
                    }else{
                        if(!Ext.WindowManager.get('winNoteRealmsAdd'+grid.noteForId)){
                            var w   = Ext.widget('winNoteAdd',
                            {
                                id          : 'winNoteRealmsAdd'+grid.noteForId,
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
    tabDetailActivate : function(tab){
        var me      = this;
        var form    = tab;
        var realm_id= tab.realm_id;       
        form.load({
            url     : me.getUrlViewRealmDetail(), 
            method  : 'GET',
            params  : {realm_id:realm_id},
            success : function(a,b){
                if(b.result.data.show_owner == true){
                    form.down('#fcPickOwner').show();
                }else{
                    form.down('#fcPickOwner').hide();
                }
            }
        });       
    },
    logo: function(button){
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
            var tab_id  = 'realmTabLogo_'+id;
            var nt      = tp.down('#'+tab_id);
            if(nt){
                tp.setActiveTab(tab_id); //Set focus on  Tab
                return;
            }
            var tab_name = me.selectedRecord.get('name');
            //Tab not there - add one
            tp.add({ 
                title   : tab_name,
                itemId  : tab_id,
                closable: true,
                glyph   : Rd.config.icnCamera, 
                xtype   : 'pnlRealmLogo',
                realm_id: id,
                tabConfig : {
                    ui : me.ui
                }
            });
            tp.setActiveTab(tab_id); //Set focus on Add Tab 
        }
    },
    tabLogoActivate: function(tab){
        var me      = this;
        var realm_id= tab.realm_id;
        var p_img   = tab.down('#pnlImg');
        Ext.Ajax.request({
            url: me.getUrlViewRealmDetail(),
            method: 'GET',
            params: {realm_id : realm_id },
            success: function(response){
                var jsonData    = Ext.JSON.decode(response.responseText);
                if(jsonData.success){
                    var img_url = me.getUrlLogoBase()+jsonData.data.icon_file_name;
                    p_img.update({image:img_url});
                }   
            },
            scope: me
        });
    },
    logoSave: function(button){
        var me      = this;
        var form    = button.up('form');
        var pnl_r   = form.up('pnlRealmLogo');
        var p_form  = form.up('panel');
        var p_img   = p_form.down('#pnlImg');
        form.submit({
            clientValidation: true,
            waitMsg: 'Uploading your photo...',
            url: me.getUrlUploadLogo(),
            params: {'id' : pnl_r.realm_id },
            success: function(form, action) {              
                if(action.result.success){ 
                    var new_img = action.result.icon_file_name;    
                    var img_url = me.getUrlLogoBase()+new_img;
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
    logoCancel: function(button){
        var me      = this;
        var form    = button.up('form');
        form.getForm().reset();
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
            var tab_id  = 'realmTabGraph_'+id;
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
                xtype   : 'pnlRealmGraphs',
                timezone_id : timezone_id,
                realm_id: id,
                tabConfig : {
                    ui : me.ui
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
        if(action == 'graph'){
            me.graph(); 
        }
        if(action == 'logo'){
            me.logo();
        }
    }
});

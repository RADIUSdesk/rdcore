Ext.define('Rd.controller.cProfiles', {
    extend: 'Ext.app.Controller',
    actionIndex: function(pnl){

        var me = this;
        
        if (me.populated) {
            return; 
        }     
        pnl.add({
            xtype   : 'gridProfiles',
            padding : Rd.config.gridPadding,
            border  : false,
            plain	: true
        });
        pnl.on({activate : me.gridActivate,scope: me});
        me.populated = true;
    },

    views:  [
        'profiles.gridProfiles',    'profiles.winProfileAddWizard',
        'components.winCsvColumnSelect',    'components.winNote',       'components.winNoteAdd',
        'profiles.winComponentManage'
    ],
    stores: ['sProfiles', 'sAccessProvidersTree', 'sProfileComponents'],
    models: ['mProfile',  'mAccessProviderTree'],
    selectedRecord: null,
    config: {
        urlAdd:             '/cake3/rd_cake/profiles/add.json',
        urlDelete:          '/cake3/rd_cake/profiles/delete.json',
        urlApChildCheck:    '/cake3/rd_cake/access-providers/child-check.json',
        urlExportCsv:       '/cake3/rd_cake/profiles/export-csv',
        urlNoteAdd:         '/cake3/rd_cake/profiles/note_add.json',
        urlManageComponents:'/cake3/rd_cake/profiles/manage-components.json'
    },
    refs: [
        {  ref: 'grid',  selector:   'gridProfiles'}       
    ],
    init: function() {
        var me = this;
        if (me.inited) {
            return;
        }
        me.inited = true;
        
        me.control({
            '#tabProfiles'    : {
                destroy   :      me.appClose
            },
            'gridProfiles #reload': {
                click:      me.reload
            }, 
            'gridProfiles #add'   : {
                click:      me.add
            },
            'gridProfiles #delete'   : {
                click:      me.del
            },
            'gridProfiles #edit'   : {
                click:      me.edit
            },
            'gridProfiles #note'   : {
                click:      me.note
            },
            'gridProfiles #csv'  : {
                click:      me.csvExport
            },
            'gridProfiles #profile_components'  : {
                click:      me.profileComponents
            },
            'gridProfiles #advanced_edit'  : {
                click:      me.advanced_edit
            },
            'gridProfiles'   : {
                select          : me.select
            },
            'gridProfiles actioncolumn': { 
                 itemClick  : me.onActionColumnItemClick
            },
            'winProfileAddWizard #btnTreeNext' : {
                click:  me.btnTreeNext
            },
            'winProfileAddWizard #btnDataPrev' : {
                click:  me.btnDataPrev
            },
            'winProfileAddWizard #btnDataNext' : {
                click:  me.btnDataNext
            },
            '#winCsvColumnSelectProfiles #save': {
                click:  me.csvExportSubmit
            },
            'gridNote[noteForGrid=profiles] #reload' : {
                click:  me.noteReload
            },
            'gridNote[noteForGrid=profiles] #add' : {
                click:  me.noteAdd
            },
            'gridNote[noteForGrid=profiles] #delete' : {
                click:  me.noteDelete
            },
            'gridNote[noteForGrid=profiles]' : {
                itemclick: me.gridNoteClick
            },
            'winNoteAdd[noteForGrid=profiles] #btnTreeNext' : {
                click:  me.btnNoteTreeNext
            },
            'winNoteAdd[noteForGrid=profiles] #btnNoteAddPrev'  : {   
                click: me.btnNoteAddPrev
            },
            'winNoteAdd[noteForGrid=profiles] #btnNoteAddNext'  : {   
                click: me.btnNoteAddNext
            },
            'winComponentManage #save' : {
                click:  me.btnComponentManageSave
            },
            'winComponentManage radiogroup' : {
                change: me.radioComponentManage
            }
        });
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
                    
                    var hide_owner  = true;
                    var user_id     = 0; //Zero means the logged in user (and we hide the pick owner thing)  
                    if(jsonData.items.tree == true){
                        hide_owner = false;
                        user_id = -1;
                    }                    
                    var store   = me.getGrid().getStore();
                    var tp      = me.getGrid().up('tabpanel');
                    var id      = 0; // New Profile
		            var name    = "New Profile"; 
                    me.application.runAction('cProfileSimple','Index',id,{
                        name        :name,
                        store       :store,
                        tp          :tp,
                        //Needed on Add and Edit
                        hide_owner  :hide_owner,
                        user_id     :user_id,
                        username    : 'Please Select One'
                    }); 
                    
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
            var win = button.up('winProfileAddWizard');
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
        var win     = button.up('winProfileAddWizard');
        win.getLayout().setActiveItem('scrnApTree');
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
                me.getStore('sProfiles').load();
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
    edit: function(){
      
        var me      = this;    
        var store   = me.getGrid().getStore();
        var tp      = me.getGrid().up('tabpanel'); 
        if(me.getGrid().getSelectionModel().getCount() == 0){
            Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );   
            
        }else{
              
            Ext.Ajax.request({
            url: me.getUrlApChildCheck(),
            method: 'GET',
            success: function(response){
                    var jsonData    = Ext.JSON.decode(response.responseText);
                    if(jsonData.success){
                        
                        var hide_owner  = true;
                        var user_id     = 0; //Zero means the logged in user (and we hide the pick owner thing)    
                        if(jsonData.items.tree == true){
                            hide_owner = false;
                            user_id = -1;
                        }                    

                        var tp      = me.getGrid().up('tabpanel');
                        var sr      = me.getGrid().getSelectionModel().getLastSelected();
                        var id      = sr.getId();
                        var name    = sr.get('name');
                        var user_id = sr.get('user_id');
                        me.application.runAction('cProfileSimple','Index',id,{
                            name        :name,
                            tp          :tp,
                            //Needed on Add and Edit
                            hide_owner  :hide_owner,
                            user_id     :user_id,
                            username    : 'Will be supplied..'
                        });                         
                    }   
                },
                scope: me
            });           
        }
    },

    radioComponentManage: function(rbg){
        var me      = this;
        var form    = rbg.up('form');
        var cmb     = form.down('combo');
        var prior   = form.down('numberfield');

        if((rbg.getValue().rb == 'add')||(rbg.getValue().rb == 'remove')){
            cmb.setVisible(true);
            cmb.setDisabled(false);
        }else{
            cmb.setVisible(false);
            cmb.setDisabled(true);
        }

        if(rbg.getValue().rb == 'add'){
            prior.setVisible(true);
            prior.setDisabled(false);
        }else{
            prior.setVisible(false);
            prior.setDisabled(true);
        }
    },

    btnComponentManageSave: function(button){
        var me      = this;
        var win     = button.up('window');
        var form    = win.down('form');
        var cmb     = form.down('combo');
        var rbg     = form.down('radiogroup');

        //For these two we need to have a value selected
        if((rbg.getValue().rb == 'add')||(rbg.getValue().rb == 'remove')){
            if(cmb.getValue() == null){
                Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sSelect_a_component_to_add_or_remove'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
                );
                 return;
            } 
        }

        var extra_params    = {};
        var s               = me.getGrid().getSelectionModel().getSelection();
        Ext.Array.each(s,function(record){
            var r_id = record.getId();
            extra_params[r_id] = r_id;
        });

        //Checks passed fine...      
        form.submit({
            clientValidation: true,
            url: me.getUrlManageComponents(),
            params: extra_params,
            success: function(form, action) {
                win.close();
                me.getGrid().getStore().load();
                Ext.ux.Toaster.msg(
                    i18n('sProfiles_modified'),
                    i18n('sProfiles_modified_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
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

        if(!Ext.WindowManager.get('winCsvColumnSelectProfiles')){
            var w = Ext.widget('winCsvColumnSelect',{id:'winCsvColumnSelectProfiles',columns: col_list});
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

                  //  console.log(filter_collection.getAt(f_count).serialize( ));
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
                if(!Ext.WindowManager.get('winNoteProfiles'+sr.getId())){
                    var w = Ext.widget('winNote',
                        {
                            id          : 'winNoteProfiles'+sr.getId(),
                            noteForId   : sr.getId(),
                            noteForGrid : 'profiles',
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
                        if(!Ext.WindowManager.get('winNoteProfilesAdd'+grid.noteForId)){
                            var w   = Ext.widget('winNoteAdd',
                            {
                                id          : 'winNoteProfilesAdd'+grid.noteForId,
                                noteForId   : grid.noteForId,
                                noteForGrid : grid.noteForGrid,
                                refreshGrid : grid
                            });
                            w.show();       
                        }
                    }else{
                        if(!Ext.WindowManager.get('winNoteProfilesAdd'+grid.noteForId)){
                            var w   = Ext.widget('winNoteAdd',
                            {
                                id          : 'winNoteProfilesAdd'+grid.noteForId,
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
        console.log(win.noteForId);
        console.log(win.noteForGrid);
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
    profileComponents: function(b){
        var me = this;
        tp = b.up('tabpanel');
        me.application.runAction('cProfileComponents','Index',tp);
    },
    advanced_edit: function(){
        var me      = this;
        var grid    = me.getGrid()
        //Find out if there was something selected
        if(grid.getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item_to_edit'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            if(!Ext.WindowManager.get('winComponentManageId')){
                var w = Ext.widget('winComponentManage',{id:'winComponentManageId'});
                w.show();       
            }    
        }
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
        if(action == 'advanced_edit'){
            me.advanced_edit();
        }
    }
});

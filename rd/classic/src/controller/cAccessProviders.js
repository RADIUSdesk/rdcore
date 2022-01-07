Ext.define('Rd.controller.cAccessProviders', {
    extend: 'Ext.app.Controller',
    actionIndex: function(pnl){
        var me = this;
        me.ui   = Rd.config.tabAccPrvdrs; //This is set in the config file    
        if (me.populated) {
            return; 
        }      
        pnl.add({ 
            padding : Rd.config.gridPadding,
            //xtype   : 'gridAccessProviders'
            xtype   : 'treeAccessProviders'
        });
        //pnl.on({activate : me.gridActivate,scope: me});
        me.populated = true;
    },
    views:  [
        'accessProviders.pnlAccessProvider',    'accessProviders.pnlAccessProviderDetail',
        'accessProviders.treeApUserRights',     'accessProviders.gridRealms',   
        'accessProviders.gridAccessProviders',  'accessProviders.winApAddWizard',
        'components.winCsvColumnSelect',        'components.winNote',                   'components.winNoteAdd',
        'accessProviders.winAccessProviderPassword','components.winEnableDisable',        'components.vCmbLanguages',
        'accessProviders.treeAccessProviders'
    ],
    stores: ['sLanguages',  'sApRights',    'sAccessProvidersGrid',     'sAccessProvidersTree',
        'sAccessProvidersTreeGrid'
    ],
    models: ['mApUserRight','mApRealms',    'mAccessProviderGrid',      'mAccessProviderTree', 'mAccessProviderTreeGrid' ],
    selectedRecord: undefined,
    config: {
        urlAdd          : '/cake3/rd_cake/access-providers/add.json', //Keep this still the original untill everything is ported for AROs
        urlEdit         : '/cake3/rd_cake/access-providers/edit.json',
        urlDelete       : '/cake3/rd_cake/access-providers/delete.json', //Keep this still the original untill everything is ported for AROs
        urlApChildCheck : '/cake3/rd_cake/access-providers/child-check.json',
        urlExportCsv    : '/cake3/rd_cake/access-providers/exportCsv',
        urlNoteAdd      : '/cake3/rd_cake/access-providers/note-add.json',
        urlViewAPDetail : '/cake3/rd_cake/access-providers/view.json',
        urlChangeTag    : '/cake3/rd_cake/access-providers/ap-change-tag.json',
        urlEnableDisable: '/cake3/rd_cake/access-providers/enable-disable.json',
        urlChangePassword:'/cake3/rd_cake/access-providers/change-password.json',
        urlChangeParent : '/cake3/rd_cake/access-providers/change-parent.json'
    },
    refs: [
        { ref:  'winAccessProviders',   selector:   '#accessProvidersWin'},
        { ref:  'grid',                 selector:   'gridAccessProviders'},
        { ref:  'tree',                 selector:   'treeAccessProviders'}
         //***Make sure this is part of the references 
        //*** When it is part of the references we can reference the grid by using me.getGrid() (The convention is get+Capital'G'+rid() for grid) 
    ],
    init: function() {
        var me = this;
        if (me.inited) {
            return;
        }
        me.inited = true;
        
        me.control({
            'treeAccessProviders #reload': {
                click:      me.reload
            },
            'treeAccessProviders #add': {
                click:      me.add
            },
            'treeAccessProviders #edit': {
                click:      me.edit
            },
            'treeAccessProviders #delete': {
                click:      me.del
            },
            'treeAccessProviders #note'   : {
                click:      me.note
            },
            'treeAccessProviders #csv'  : {
                click:      me.csvExport
            },
            'treeAccessProviders #password'  : {
                click:      me.changePassword
            },
            'treeAccessProviders #enable_disable' : {
                click:      me.enableDisable
            },
            //***Tweaks Start***
            'treeAccessProviders'       : {
                drop        : me.treeDrop,
                activate    : me.treeActivate,
                itemclick   : me.gridClick,
                menuItemClick   : me.onActionColumnMenuItemClick //***Add listener for the menuItemClick event of the tree ('treeAccessProviders') 
                //***...Each controller's grid will be different 
            },
            'treeAccessProviders actioncolumn': { //*** Add a listener for the actioncolumn -> itemClick event for the tree ('treeAccessProviders')
                 itemClick  : me.onActionColumnItemClick
                 //***...Each controller's grid will be different 
            },
            //***Tweaks End***
            //Add WiZard 
            
            'winApAddWizard #btnTreeNext': {
                click:      me.btnTreeNext
            },             
            'winApAddWizard #btnDataPrev' : {
                click:  me.btnDataPrev
            },
            
            'winApAddWizard #btnDataNext' : {
                click:  me.btnDataNext
            },
            'pnlAccessProvider pnlAccessProviderDetail #save': {
                click:      me.editSubmit
            },
            'pnlAccessProvider treeApUserRights #reload': {
                click:      me.apRightReload
            },
            'pnlAccessProvider treeApUserRights #expand': {
                click:      me.apRightExpand
            },
            'pnlAccessProvider treeApUserRights advCheckColumn': {
                checkchange: me.apRightChange
            },
            'pnlAccessProvider gridApRealms #reload': {
                click:      me.apRealmsReload
            },
            '#winCsvColumnSelectAp #save': {
                click:  me.csvExportSubmit
            },
            'gridNote[noteForGrid=access-providers] #reload' : {
                click:  me.noteReload
            },
            'gridNote[noteForGrid=access-providers] #add' : {
                click:  me.noteAdd
            },
            'gridNote[noteForGrid=access-providers] #delete' : {
                click:  me.noteDelete
            },
            'gridNote[noteForGrid=access-providers]' : {
                itemclick: me.gridNoteClick
            },
            'winNoteAdd[noteForGrid=access-providers] #btnTreeNext' : {
                click:  me.btnNoteTreeNext
            },
            'winNoteAdd[noteForGrid=access-providers] #btnNoteAddPrev'  : {   
                click: me.btnNoteAddPrev
            },
            'winNoteAdd[noteForGrid=access-providers] #btnNoteAddNext'  : {   
                click: me.btnNoteAddNext
            },
            'pnlAccessProvider #tabDetail': {
                //beforerender:   me.tabDetailActivate,//No need for this one 
                activate:       me.tabDetailActivate
            },
            'pnlAccessProvider #tabRealms': {
                activate:       me.tabRealmsActivate
            },
            'pnlAccessProvider #tabRights': {
                activate:       me.tabRightsActivate
            },
            'winAccessProviderPassword #save': {
                click: me.changePasswordSubmit
            },
            '#winEnableDisableUser #save': {
                click: me.enableDisableSubmit
            }
        });;
    },
    treeDrop: function( node, data, overModel, dropPosition, eOpts ){
        var me = this;
        console.log("==MOVING==");
        var moved = data.records[0];
        if(moved){
            var srcLevel = moved.get('level');
            var dstLevel = overModel.get('level');
            if((srcLevel == 1)&&(dstLevel == 0)){
                Ext.ux.Toaster.msg(
                        "Nothing Changes",
                        "Nothing Changes Reloading...",
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
                );
                me.reload(); 
            }else{
                //----
                var srcName = moved.get('username');
                var dstName = overModel.get('username');     
                Ext.MessageBox.confirm(i18n('sConfirm'), "Move "+srcName+" To Be Under "+dstName, function(val){
                    if(val== 'yes'){
                   
                        var data        = {};
                        data['src_id']  = moved.get('id');
                        data['dst_id'] = overModel.get('id');
                   
                        Ext.Ajax.request({
                            url     : me.getUrlChangeParent(),
                            method  : 'POST',          
                            jsonData: data,
                            success: function(response){
                                var jsonData    = Ext.JSON.decode(response.responseText);
                                if(jsonData.success){ //success=true
                                    Ext.ux.Toaster.msg(
                                        i18n('sItem_deleted'),
                                        i18n('sItem_deleted_fine'),
                                        Ext.ux.Constants.clsInfo,
                                        Ext.ux.Constants.msgInfo
                                    );
                                    me.reload(); //Reload from server
                                }else{ //success=false
                                     Ext.ux.Toaster.msg(
                                        i18n('sProblems_deleting_item'),
                                        jsonData.message,
                                        Ext.ux.Constants.clsWarn,
                                        Ext.ux.Constants.msgWarn
                                    );
                                    me.reload(); //Reload from server
                                }   
                            },                                   
                            failure: Ext.ux.ajaxFail
                        });
                    }
                    if(val== 'no'){
                        me.reload();
                    }
                });                          
                //----
                
            }                      
        }            
    },
    appClose:   function(){
        var me          = this;
        me.populated    = false;
    },
    reload: function(){
        var me = this;
        me.getTree().getSelectionModel().deselectAll(true);
        me.getTree().getStore().load();
    },
    treeActivate: function(g){
        var me = this;
        var grid = g.down('grid');
        if(grid){
            grid.getStore().load();
        }else{
            g.getStore().load();
        }        
    },
    gridClick:  function(grid, record, item, index, event){
        var me                  = this;
        me.selectedRecord = record;
        //Dynamically update the top toolbar
        tb = me.getTree().down('toolbar[dock=top]');

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
    add:    function(){
        var me = this;
        Ext.Ajax.request({
            url: me.getUrlApChildCheck(),
            method: 'GET',
            success: function(response){
                var jsonData    = Ext.JSON.decode(response.responseText);
                if(jsonData.success){
                    if(jsonData.items.tree == true){
                        if(!Ext.WindowManager.get('winApAddWizardId')){
                            var w = Ext.widget('winApAddWizard',
                            {
                                id          :'winApAddWizardId',
                                no_tree     : false,
                                selLanguage : me.application.getSelLanguage()
                            });
                            w.show();         
                        }   
                    }else{
                        if(!Ext.WindowManager.get('winApAddWizardId')){
                            var w = Ext.widget('winApAddWizard',
                            {
                                id          :'winApAddWizardId',
                                no_tree     : true,
                                selLanguage : me.application.getSelLanguage(),
                                startScreen : 'scrnData',
                                user_id     : '0',
                                owner       : i18n('sLogged_in_user')
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
            var win = button.up('winApAddWizard');
            var owner = "<div class=\"fieldGrey\"><b>"+sr.get('username')+"</b></div>"
            win.down('#owner').setValue(owner);
            win.down('#parent_id').setValue(sr.getId());
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
        var win     = button.up('winApAddWizard');
        win.getLayout().setActiveItem('scrnApTree');
    },
    btnDataNext: function(button){
        var me       = this;
        var win     = button.up('window');
        var form    = win.down('form');
        form.submit({
            clientValidation: true,
            url: me.getUrlAdd(),
            success: function(form, action) {
                win.close();
                me.reload();
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
    edit:   function(){ 
        var me = this;
        //See if there are anything selected... if not, inform the user
        var sel_count = me.getTree().getSelectionModel().getCount();
        if(sel_count == 0){
            Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{

            var selected    =  me.getTree().getSelectionModel().getSelection();
            var count       = selected.length;         
            Ext.each(me.getTree().getSelectionModel().getSelection(), function(sr,index){

                //Check if the node is not already open; else open the node:
                var tp          = me.getTree().up('tabpanel');
                var ap_id       = sr.getId();
                var ap_tab_id   = 'apTab_'+ap_id;
                var nt          = tp.down('#'+ap_tab_id);
                if(nt){
                    tp.setActiveTab(ap_tab_id); //Set focus on  Tab
                    return;
                }

               var ap_tab_name = sr.get('username');
              
                tp.add({ 
                    title :     ap_tab_name,
                    itemId:     ap_tab_id,
                    closable:   true,
                    iconCls:    'edit', 
                    glyph:      Rd.config.icnEdit,
                    layout:     'fit', 
                    items:      {'xtype' : 'pnlAccessProvider',ap_id: ap_id},
                    tabConfig : {
                        ui : me.ui
                    }
                });
                tp.setActiveTab(ap_tab_id); //Set focus on Add Tab
                
            });
        }
    },
    editSubmit: function(button){
        var me      = this;
        var form    = button.up('form');
        form.submit({
            clientValidation: true,
            url: me.getUrlEdit(),
            success: function(f, action) {
                Ext.ux.Toaster.msg(
                    i18n('sItem_updated'),
                    i18n('sItem_updated_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
                
                //Refresh the form
                var ap_id = form.down('#ap_id').getValue();
                form.load({
                    url :me.getUrlViewAPDetail(), 
                    method:'GET',
                    params:{ap_id:ap_id},
                    success    : function(a,b,c){
                        if(b.result.data.wl_img != null){
                            var img = form.down("#imgWlLogo");
                            img.setSrc(b.result.data.wl_img);
                        }
                    }
                });
                    
            },
            failure: Ext.ux.formFail
        });
    },
    del:   function(){
        var me      = this;     
        //Find out if there was something selected
        if(me.getTree().getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            Ext.MessageBox.confirm(i18n('sConfirm'), i18n('sAre_you_sure_you_want_to_do_that_qm'), function(val){
                if(val== 'yes'){
                    var selected    = me.getTree().getSelectionModel().getSelection();
                    var list        = [];
                    Ext.Array.forEach(selected,function(item){
                        var id = item.getId();
                        Ext.Array.push(list,{'id' : id});
                    });
                    Ext.Ajax.request({
                        url: me.getUrlDelete(),
                        method: 'POST',          
                        jsonData: list,
                        success: function(response){
                            var jsonData    = Ext.JSON.decode(response.responseText);
                            if(jsonData.success){ //success=true
                                Ext.ux.Toaster.msg(
                                    i18n('sItem_deleted'),
                                    i18n('sItem_deleted_fine'),
                                    Ext.ux.Constants.clsInfo,
                                    Ext.ux.Constants.msgInfo
                                );
                                me.reload(); //Reload from server
                            }else{ //success=false
                                 Ext.ux.Toaster.msg(
                                    i18n('sProblems_deleting_item'),
                                    jsonData.message,
                                    Ext.ux.Constants.clsWarn,
                                    Ext.ux.Constants.msgWarn
                                );
                                me.reload(); //Reload from server
                            }   
                        },                                   
                        failure: Ext.ux.ajaxFail
                    });
                }
            });
        }
    },
    apRightReload: function(button){
        var me = this;
        var tree = button.up('treeApUserRights');
        tree.getStore().load();
    },
    apRightExpand: function(button){
        var me = this;
        var tree = button.up('treeApUserRights');
        var sel_count = tree.getSelectionModel().getCount();
        if(sel_count == 0){
            Ext.ux.Toaster.msg(
                        i18n('sSelect_a_node'),
                        i18n('sFirst_select_a_node_to_expand'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            var sr = tree.getSelectionModel().getLastSelected();
            tree.expandNode(sr,true); 
        }
    },
    apRightChange: function(i){
        var me      = this;
        var tree    = i.up('treeApUserRights');
        tree.getStore().sync({
            success: function(batch,options){
                Ext.ux.Toaster.msg(
                    i18n('sRight_Changed'),
                    i18n('sRight_changed_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                ); 
            },
            failure: function(batch,options){
                Ext.ux.Toaster.msg(
                    i18n('sProblems_changing_right'),
                    i18n('sThere_were_some_problems_experienced_during_changing_of_the_right'),
                    Ext.ux.Constants.clsWarn,
                    Ext.ux.Constants.msgWarn
                );
            }
        });
    },
    apRealmsReload: function(button){
        var me = this;
        var grid = button.up('gridApRealms');
        grid.getStore().load();
    },
    onStoreApLoaded: function() {
        var me      = this;
        var count   = me.getStore('sAccessProvidersGrid').getTotalCount();
        me.getGrid().down('#count').update({count: count}); //FIXME WHAT IS THIS???
    },
    csvExport: function(button,format) {
        var me          = this;
        var columns     = me.getTree().columnManager.columns;
        var col_list    = [];
        Ext.Array.each(columns, function(item,index){
            if(item.dataIndex != ''){
                var chk = {boxLabel: item.text, name: item.dataIndex, checked: true};
                col_list[index] = chk;
            }
        }); 

        if(!Ext.WindowManager.get('winCsvColumnSelectAp')){
            var w = Ext.widget('winCsvColumnSelect',{id:'winCsvColumnSelectAp',columns: col_list});
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
                 
            var filter_collection = me.getTree().getStore().getFilters();     
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
        var sel_count = me.getTree().getSelectionModel().getCount();
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
                var sr = me.getTree().getSelectionModel().getLastSelected();
                
                if(!Ext.WindowManager.get('winNoteAp'+sr.getId())){
                    var w = Ext.widget('winNote',
                        {
                            id          : 'winNoteAp'+sr.getId(),
                            noteForId   : sr.getId(),
                            noteForGrid : 'access-providers',
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
                        if(!Ext.WindowManager.get('winNoteApAdd'+grid.noteForId)){
                            var w   = Ext.widget('winNoteAdd',
                            {
                                id          : 'winNoteApAdd'+grid.noteForId,
                                noteForId   : grid.noteForId,
                                noteForGrid : grid.noteForGrid,
                                refreshGrid : grid
                            });
                            w.show();       
                        }
                    }else{
                        if(!Ext.WindowManager.get('winNoteApAdd'+grid.noteForId)){
                            var w   = Ext.widget('winNoteAdd',
                            {
                                id          : 'winNoteApAdd'+grid.noteForId,
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
        var form    = tab.down('form');
        var ap_id  = tab.up('pnlAccessProvider').ap_id;
        form.load({
            url :me.getUrlViewAPDetail(), 
            method:'GET',
            params:{ap_id:ap_id},
            success    : function(a,b,c){
                if(b.result.data.wl_img != null){
                    var img = form.down("#imgWlLogo");
                    img.setSrc(b.result.data.wl_img);
                }
                //We're hiding those elements the Access Provider does not have rights to
                Ext.Array.forEach(Object.keys(b.result.metaData),function(item){
                    if(b.result.metaData[item] == true){
                        if(form.down('#'+item)){
                            form.down('#'+item).setDisabled(false);
                            form.down('#'+item).setHidden(false);
                        }
                    }else{
                        if(form.down('#'+item)){
                            form.down('#'+item).setDisabled(true);
                            form.down('#'+item).setHidden(true);
                        }                    
                    }
                });
                
                //Treetags
                if(b.result.data.enable_grouping == true){
                    //form.down('#fcPickGroup').show(); --11Jun 2021 remove it for now
                }else{
                    form.down('#fcPickGroup').hide();
                }     
            }
        });
    },
    changePassword: function(){
        var me = this;
         //Find out if there was something selected
        var sel_count = me.getTree().getSelectionModel().getCount();
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
                var sr = me.getTree().getSelectionModel().getLastSelected(); 
                if(!Ext.WindowManager.get('winAccessProviderPassword'+sr.getId())){
                    var w = Ext.widget('winAccessProviderPassword',
                        {
                            id          : 'winAccessProviderPassword'+sr.getId(),
                            user_id     : sr.getId(),
                            username    : sr.get('username'),
                            title       : i18n('sChange_password_for')+' '+sr.get('username')
                        });
                    w.show();      
                }
            }    
        }
    },
    changePasswordSubmit: function(button){
        var me      = this;
        var win     = button.up('window');
        var form    = win.down('form');

        var extra_params        = {};
        var sr                  = me.getTree().getSelectionModel().getLastSelected();
        extra_params['user_id'] = sr.getId();

        //Checks passed fine...      
        form.submit({
            clientValidation    : true,
            url                 : me.getUrlChangePassword(),
            params              : extra_params,
            success             : function(form, action) {
                win.close();
                me.reload();
                Ext.ux.Toaster.msg(
                    i18n('sPassword_changed'),
                    i18n('sPassword_changed_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },
            failure             : Ext.ux.formFail
        });
    },
    //***Some methods called will have the button as an argument. This is basically only used to get the grid that the button is part of
    //***We change it by using me.getGrid() instead
    /*
        -OLD CODE-
        enableDisable: function(button){
        var me      = this;
        var grid    = button.up('grid');
        
        -NEW CODE-
         enableDisable: function(){
        var me      = this;
        var grid    = me.getGrid();
    
    */
   //***END 
    
    enableDisable: function(){
        var me      = this;
        var grid    = me.getTree();
        //Find out if there was something selected
        if(grid.getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item_to_edit'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            if(!Ext.WindowManager.get('winEnableDisableUser')){
                var w = Ext.widget('winEnableDisable',{id:'winEnableDisableUser'});
                w.show();       
            }    
        }
    },
    enableDisableSubmit:function(button){

        var me      = this;
        var win     = button.up('window');
        var form    = win.down('form');

        var extra_params    = {};
        var s               = me.getTree().getSelectionModel().getSelection();
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
    tabRealmsActivate:  function(t){
        var me = this;
        t.getStore().load();
    },
    tabRightsActivate:  function(t){
        var me = this;
        t.getStore().load();
    },
    //***Add these to the end of the file
    onActionColumnItemClick: function(view, rowIndex, colIndex, item, e, record, row, action){
        //console.log("Action Item "+action+" Clicked");
        var me = this;
        var grid = view.up('treepanel');
        grid.setSelection(record);
        if(action == 'update'){
            me.edit(); 
            //***Call the actions that is called when the toolbar button is clicked
            //e.g. This is the event binding for the edit and delete button in the toolbar defined at the start of the file 
            /*'gridAccessProviders #edit': {
                click:      me.edit
            },
            'gridAccessProviders #delete': {
                click:      me.del
            }
            */
        }
        if(action == 'delete'){
            me.del(); //***Call the actions that is called when the toolbar button is clicked
        }
    },
    onActionColumnMenuItemClick: function(grid,action){
        var me = this;
        grid.setSelection(grid.selRecord);
        if(action == 'password'){
            me.changePassword(); //***Call the actions that is called when the toolbar button is clicked
        }
        if(action == 'disable'){
            me.enableDisable(); //***Call the actions that is called when the toolbar button is clicked
        }
    }
    ///***END  
});

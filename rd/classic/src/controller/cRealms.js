Ext.define('Rd.controller.cRealms', {
    extend: 'Ext.app.Controller',

    actionIndex: function(pnl,itemId){
        var me      = this;
        var item    = pnl.down('#'+itemId);
        var added   = false;
        if(!item){
            pnl.add({ 
                itemId  : itemId,
                xtype   : 'gridRealms',
                border  : false,
                plain   : true,
                padding : Rd.config.gridSlim
            });
            pnl.on({activate : me.gridActivate,scope: me});
            added = true;
        }
        return added;      
    },
    views:  [
        'realms.gridRealms',               
        'realms.winRealmAdd',
        'components.winCsvColumnSelect',
        'realms.pnlRealmDetail',
        'realms.pnlRealmLogo',
        'realms.pnlRealmGraphs',
        'components.pnlUsageGraph',
        'realms.pnlRealmPasspointProfile'
    ],
    stores: ['sRealms'],
    models: ['mRealm', 'mUserStat'],
    selectedRecord: null,
    config: {
        urlAdd:             '/cake4/rd_cake/realms/add.json',
        urlEdit:            '/cake4/rd_cake/realms/edit.json',
        urlDelete:          '/cake4/rd_cake/realms/delete.json',
        urlExportCsv:       '/cake4/rd_cake/realms/export-csv',
        urlViewRealmDetail: '/cake4/rd_cake/realms/view.json',
        urlLogoBase:        '/cake4/rd_cake/img/realms/',
        urlUploadLogo:      '/cake4/rd_cake/realms/upload_logo.json'
    },
    refs: [
         {  ref:    'gridRealms',           selector:   'gridRealms'},
         { ref:     'grid',                 selector:   'gridRealms'}
    ],
    init: function() {
        var me = this;
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
          
            'gridRealms #csv'  : {
                click:      me.csvExport
            },
            'gridRealms #logo'  : {
                click:      me.logo
            },
            'gridRealms #graph'   : {
                click:      me.graph
            },
            'gridRealms #vlans'   : {
                click:      me.vlans
            },
            'gridRealms #pmks'   : {
                click:      me.pmks
            },
            'gridRealms #passpoint'   : {
                click:      me.passpoint
            },
            'gridRealms'   : {
                itemclick       :  me.gridClick,
                menuItemClick   : me.onActionColumnMenuItemClick 
            },
            'gridRealms actioncolumn': { 
                 itemClick  : me.onActionColumnItemClick
            },
            'winRealmAdd #btnDataNext' : {
                click:  me.addSubmit
            },
            'pnlRealmDetail #save' : {
                click:  me.editSubmit
            },
            'pnlRealmDetail': {
                activate:       me.tabDetailActivate
            },
            'pnlRealmLogo': {
                activate:       me.tabLogoActivate
            },
            'pnlRealmLogo #save': {
                click:       me.logoSave
            },
            'pnlRealmLogo #cancel': {
                click:       me.logoCancel
            },
            '#winCsvColumnSelectRealms #save': {
                click:  me.csvExportSubmit
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
        var me 		= this;
        var c_name 	= Ext.getApplication().getCloudName();
        var c_id	= Ext.getApplication().getCloudId()
        if(!Ext.WindowManager.get('winRealmAddId')){
            var w = Ext.widget('winRealmAdd',{id:'winRealmAddId',cloudId: c_id, cloudName: c_name});
            w.show();         
        }
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

    tabDetailActivate : function(tab){
        var me      = this;
        var form    = tab;
        var realm_id= tab.realm_id;       
        form.load({
            url     : me.getUrlViewRealmDetail(), 
            method  : 'GET',
            params  : {realm_id:realm_id},
            success : function(a,b){

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
        var pnl_r   = form;
        var p_img   = form.down('#pnlImg');
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
            var dd              = Ext.getApplication().getDashboardData();
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
    vlans: function(button){
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
            var tab_id  = 'realmTabVlans_'+id;
            var nt      = tp.down('#'+tab_id);
            if(nt){
                tp.setActiveTab(tab_id); //Set focus on  Tab
                return;
            }
            var tab_name = me.selectedRecord.get('name');
            //Tab not there - add one
            tp.add({ 
                title   : 'VLANs For '+tab_name,
                itemId  : tab_id,
                closable: true,
                glyph   : Rd.config.icnTag, 
                xtype   : 'gridRealmVlans',
                realm_id: id,
                tabConfig : {
                    ui : me.ui
                }
            });
            tp.setActiveTab(tab_id); //Set focus on Add Tab 
        }
    },
    pmks: function(button){
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
            var tab_id  = 'realmTabPmks_'+id;
            var nt      = tp.down('#'+tab_id);
            if(nt){
                tp.setActiveTab(tab_id); //Set focus on  Tab
                return;
            }
            var tab_name = me.selectedRecord.get('name');
            //Tab not there - add one
            tp.add({ 
                title   : 'PMKs For '+tab_name,
                itemId  : tab_id,
                closable: true,
                glyph   : Rd.config.icnLock, 
                xtype   : 'gridRealmPmks',
                realm_id: id,
                tabConfig : {
                    ui : me.ui
                }
            });
            tp.setActiveTab(tab_id); //Set focus on Add Tab 
        }
    },
    passpoint: function(button){
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
            var tab_id  = 'realmTabPasspoint_'+id;
            var nt      = tp.down('#'+tab_id);
            if(nt){
                tp.setActiveTab(tab_id); //Set focus on  Tab
                return;
            }
            var tab_name = me.selectedRecord.get('name');
            //Tab not there - add one
            tp.add({ 
                title   : 'HS2.0 profile for '+tab_name,
                itemId  : tab_id,
                closable: true,
                glyph   : Rd.config.icnSsid, 
                xtype   : 'pnlRealmPasspointProfile',
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
        if(action == 'vlans'){
            me.vlans();
        }
        if(action == 'pmks'){
            me.pmks();
        }
    }
});

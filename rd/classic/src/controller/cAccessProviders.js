Ext.define('Rd.controller.cAccessProviders', {
    extend: 'Ext.app.Controller',
    actionIndex: function(pnl,itemId){
        var me      = this;
        me.ui       = Rd.config.tabAccPrvdrs; //This is set in the config file 
        var item    = pnl.down('#'+itemId);
        var added   = false;
        if(!item){              
            pnl.add({         
                xtype   : 'tabpanel',
                itemId  : itemId,
                cls     : 'subSubTab',
                border	: false,
                plain	: true,
                tabBar: {
                    items: [
                        { 
                            xtype   : 'btnOtherBack'
                        }              
                   ]
                },
                items   : [           
                    {
                        title   : 'Admins',
                        xtype   : 'gridAccessProviders',
                        border  : false,
                        plain   : true,
                        padding : Rd.config.gridSlim,
                        glyph   : 'xf084@FontAwesome',
                        tabConfig : {
                            ui  : 'tab-metal'
                        }
                    }
                ]
            });
            //pnl.on({activate : me.reload,scope: me});
            added = true;
        }
        return added;
    },
    views:  [
        'accessProviders.pnlAccessProviderDetail', 
        'accessProviders.gridAccessProviders',  'accessProviders.winApAdd',
        'components.winCsvColumnSelect', 
        'accessProviders.winAccessProviderPassword','components.winEnableDisable',      'components.vCmbLanguages'
    ],
    stores: [
        'sLanguages',
        'sAccessProvidersGrid'
    ],
    models: ['mAccessProviderGrid'],
    selectedRecord: undefined,
    config: {
        urlAdd          : '/cake4/rd_cake/access-providers/add.json', //Keep this still the original untill everything is ported for AROs
        urlEdit         : '/cake4/rd_cake/access-providers/edit.json',
        urlDelete       : '/cake4/rd_cake/access-providers/delete.json', //Keep this still the original untill everything is ported for AROs
        urlExportCsv    : '/cake4/rd_cake/access-providers/exportCsv',
        urlViewAPDetail : '/cake4/rd_cake/access-providers/view.json',
        urlEnableDisable: '/cake4/rd_cake/access-providers/enable-disable.json',
        urlChangePassword:'/cake4/rd_cake/access-providers/change-password.json'
    },
    refs: [
        { ref:  'grid',                 selector:   'gridAccessProviders'}
    ],
    init: function() {
        var me = this;
        if (me.inited) {
            return;
        }
        me.inited = true;

        me.control({
            'gridAccessProviders #reload': {
                click:      me.reload
            },
            'gridAccessProviders #add': {
                click:      me.add
            },
            'gridAccessProviders #edit': {
                click:      me.edit
            },
            'gridAccessProviders #delete': {
                click:      me.del
            },
            'gridAccessProviders #csv'  : {
                click:      me.csvExport
            },
            'gridAccessProviders #password'  : {
                click:      me.changePassword
            },
            'gridAccessProviders #enable_disable' : {
                click:      me.enableDisable
            },           
            'winApAdd #btnDataNext' : {
                click:  me.btnDataNext
            },
            'pnlAccessProviderDetail': {
              //  beforerender:   me.tabDetailActivate,
                activate:       me.tabDetailActivate
            },
            'pnlAccessProviderDetail #save': {
                click:      me.editSubmit
            },
            '#winCsvColumnSelectAp #save': {
                click:  me.csvExportSubmit
            },
            'winAccessProviderPassword #save': {
                click: me.changePasswordSubmit
            },
            '#winEnableDisableUser #save': {
                click: me.enableDisableSubmit
            }
        });
    },
    reload: function(){
        var me = this;
        me.getGrid().getSelectionModel().deselectAll(true);
        me.getGrid().getStore().load();
    },
    gridClick:  function(grid, record, item, index, event){
        var me                  = this;
        me.selectedRecord = record;
    },
    add:    function(){
        var me = this;       
        if(!Ext.WindowManager.get('winApAddId')){
            var w = Ext.widget('winApAdd',{id:'winApAddId'});
            w.show();         
        }  
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
                var ap_id       = sr.getId();
                var ap_tab_id   = 'apTab_'+ap_id;
                var nt          = tp.down('#'+ap_tab_id);
                if(nt){
                    tp.setActiveTab(ap_tab_id); //Set focus on  Tab
                    return;
                }

               var ap_tab_name = sr.get('username');
              
                tp.add({ 
                    title       : ap_tab_name,
                    itemId      : ap_tab_id,
                    closable    : true,
                    glyph       : Rd.config.icnEdit,
                    xtype       : 'pnlAccessProviderDetail',
                    ap_id       : ap_id,
                    tabConfig   : {
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
                            console.log("Could not delete!");
                            me.reload(); //Reload from server
                        }
                    });

                }
            });
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
    tabDetailActivate : function(tab){
        var me      = this;
        var form    = tab;
        var ap_id   = tab.ap_id;
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
    changePassword: function(){
        var me = this;
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
        var sr                  = me.getGrid().getSelectionModel().getLastSelected();
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
        var grid    = me.getGrid();
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

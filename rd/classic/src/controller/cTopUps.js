Ext.define('Rd.controller.cTopUps', {
    extend: 'Ext.app.Controller',
    actionIndex: function(pnl){

        var me = this;
        
        if (me.populated) {
            return; 
        }  
        
        pnl.add({
            xtype   : 'tabpanel',
            border  : false,
            itemId  : 'tabTopUps',
            plain	: true,
            cls     : 'subSubTab', //Make darker -> Maybe grey
            items   : [
                { 
                    'title' : i18n('sHome'), 
                     xtype  : 'gridTopUps',
                     border : false,
                     plain  : true,
                    'glyph' : Rd.config.icnHome
                },
                { 
                    title   : 'Transaction History', 
                    xtype   : 'gridTopUpTransactions',
                    glyph   : Rd.config.icnHistory
                }
            ]
        });
        me.populated = true; 
    },

    views:  [
        'topUps.gridTopUps',            'topUps.winTopUpAddWizard',
        'components.cmbPermanentUser',  'topUps.winTopUpEdit',
        'components.winCsvColumnSelect',
        'topUps.gridTopUpTransactions' 
    ],
    stores: ['sTopUps', 'sAccessProvidersTree', 'sPermanentUsers', 'sTopUpTransactions'],
    models: ['mTopUp',  'mAccessProviderTree',  'mPermanentUser',  'mTopUpTransaction' ],
    selectedRecord: null,
    config: {
        urlApChildCheck : '/cake3/rd_cake/access-providers/child-check.json',
        urlExportCsv    : '/cake3/rd_cake/top-ups/export_csv',
        urlAdd          : '/cake3/rd_cake/top-ups/add.json',
        urlExportCsv    : '/cake3/rd_cake/top-ups/export_csv', 
        urlDelete       : '/cake3/rd_cake/top-ups/delete.json',
        urlEdit         : '/cake3/rd_cake/top-ups/edit.json'
    },
    refs: [
        {  ref: 'grid',  selector: 'gridTopUps'}       
    ],
    init: function() {
        var me = this;
        if (me.inited) {
            return;
        }
        me.inited = true;

        me.control({
            '#tabTopUps' : {
                destroy   :      me.appClose   
            },
            'gridTopUps #reload': {
                click:      me.reload
            },
            'gridTopUps #reload menuitem[group=refresh]' : {
                click:      me.reloadOptionClick
            }, 
            'gridTopUps #add': {
                click:      me.add
            }, 
            'gridTopUps #edit': {
                click:      me.edit
            }, 
            'gridTopUps #delete': {
                click:      me.del
            }, 
            'gridTopUps #csv'  : {
                click:      me.csvExport
            },
            'gridTopUps'   : {
                select:      me.select
            },
            'winTopUpAddWizard #btnTreeNext' : {
                click:  me.btnTreeNext
            },
            'winTopUpAddWizard #btnDataPrev' : {
                click:  me.btnDataPrev
            },
            'winTopUpAddWizard #btnDataNext' : {
                click:  me.btnDataNext
            },
            'winTopUpAddWizard #cmbType' : {
                change:  me.cmbTopUpTypeChanged
            },
            '#winCsvColumnSelectTopUps #save': {
                click:  me.csvExportSubmit
            },
            'winTopUpEdit #dispType' : {
                change: me.editDispTypeChanged
            },
            'winTopUpEdit #save': {
                click: me.btnEditSave
            },
            '#tabTopUps gridTopUpTransactions' : {
                activate:      me.gridActivate
            },
            '#tabTopUps gridTopUps' : {
                activate:      me.gridActivate
            }
        });
    },
    gridActivate: function(g){
        var me = this;
        g.getStore().load();
    },
    appClose:   function(){
        var me = this;
        me.populated    = false;
        if(me.autoReload != undefined){
            clearInterval(me.autoReload);   //Always clear
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
    reload: function(){
        var me =this;
        me.getGrid().getSelectionModel().deselectAll(true);
        me.getGrid().getStore().load();
    },
    select: function(grid,record){
        var me = this;
        //Adjust the Edit and Delete buttons accordingly...
       
    },
    onStoreTopUpsLoaded: function() {
        var me      = this;
        var count   = me.getStore('sTopUps').getTotalCount();
        me.getGrid().down('#count').update({count: count});
    },
    add: function(button){   
        var me = this;
        Ext.Ajax.request({
            url: me.getUrlApChildCheck(),
            method: 'GET',
            success: function(response){
                var jsonData    = Ext.JSON.decode(response.responseText);
                if(jsonData.success){
                        
                    if(jsonData.items.tree == true){
                        if(!Ext.WindowManager.get('winTopUpAddWizardId')){
                            var w = Ext.widget('winTopUpAddWizard',{id:'winTopUpAddWizardId'});
                            w.show();         
                        }
                    }else{
                        if(!Ext.WindowManager.get('winTopUpAddWizardId')){
                            var w = Ext.widget('winTopUpAddWizard',
                                {id:'winTopUpAddWizardId',startScreen: 'scrnData',user_id:'0',owner: i18n('sLogged_in_user'), no_tree: true}
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
            var win = button.up('winTopUpAddWizard');
            win.down('#owner').setValue(sr.get('username'));
            win.down('#user_id').setValue(sr.getId());
            
            //We need to update the Store of the Realms and Profile select list to reflect the specific Access Provider
            win.down('#permanent_user_id').getStore().getProxy().setExtraParam('ap_id',sr.getId());
            win.down('#permanent_user_id').getStore().load();
            
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
        var win     = button.up('winTopUpAddWizard');
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
                me.getStore('sTopUps').load();
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
    cmbTopUpTypeChanged: function(cmb,new_value){
        var me          = this;
        var form        = cmb.up('form');
        var cmbDataUnit = form.down('#cmbDataUnit');
        var cmbTimeUnit = form.down('#cmbTimeUnit');
        var txtAmount   = form.down('#txtAmount');

        if(new_value == 'data'){
            cmbDataUnit.setVisible(true);
            cmbDataUnit.setDisabled(false);
            cmbTimeUnit.setVisible(false);
            cmbTimeUnit.setDisabled(true);
            txtAmount.setFieldLabel('Amount');
        }

        if(new_value == 'time'){
            cmbDataUnit.setVisible(false);
            cmbDataUnit.setDisabled(true);
            cmbTimeUnit.setVisible(true);
            cmbTimeUnit.setDisabled(false);
            txtAmount.setFieldLabel('Amount');
        }

        if(new_value == 'days_to_use'){
            cmbDataUnit.setVisible(false);
            cmbDataUnit.setDisabled(true);
            cmbTimeUnit.setVisible(false);
            cmbTimeUnit.setDisabled(true);
            txtAmount.setFieldLabel('Days');
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
                        success: function(batch,options){
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
    edit: function(button){
        var me      = this;   
        //Find out if there was something selected
        var selCount = me.getGrid().getSelectionModel().getCount();
        if(selCount == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            if(selCount > 1){
                Ext.ux.Toaster.msg(
                        i18n('sLimit_the_selection'),
                        i18n('sSelection_limited_to_one'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
                );
            }else{
                var sr  = me.getGrid().getSelectionModel().getLastSelected();
                
                if(!Ext.WindowManager.get('winTopUpEditId')){
                    var w = Ext.widget('winTopUpEdit',{ 
                        id      : 'winTopUpEditId',
                        record  : sr 
                    });
                    w.down('form').loadRecord(sr);
                    w.show();         
                }
            }
        }
    },
    editDispTypeChanged: function(dispField, newValue, oldValue){
        var me      = this;
        var form    = dispField.up('form');
        var win     = dispField.up('window');
        new_value   = dispField.getValue();
         
        var cmbDataUnit = form.down('#cmbDataUnit');
        var cmbTimeUnit = form.down('#cmbTimeUnit');
        var txtAmount   = form.down('#txtAmount');

        if(new_value == 'data'){
            cmbDataUnit.setVisible(true);
            cmbDataUnit.setDisabled(false);
            cmbTimeUnit.setVisible(false);
            cmbTimeUnit.setDisabled(true);
            txtAmount.setFieldLabel('Amount'); 
            
            var amount          = win.record.get('data');
            var result_for_gig  = amount / (1024 * 1024 * 1024);
            var result_for_meg  = amount / (1024 * 1024);
            if(result_for_gig < 1){
                cmbDataUnit.setValue('mb');
                txtAmount.setValue(result_for_meg);
            }else{
                cmbDataUnit.setValue('gb');
                txtAmount.setValue(result_for_gig);
            }
        }

        if(new_value == 'time'){
            cmbDataUnit.setVisible(false);
            cmbDataUnit.setDisabled(true);
            cmbTimeUnit.setVisible(true);
            cmbTimeUnit.setDisabled(false);
            txtAmount.setFieldLabel('Amount');   
            var amount          = win.record.get('time');
            var result_for_min  = amount / (60);
            var result_for_hour = amount / (60 * 60);
            var result_for_day  = amount / (60 * 60 * 24);
            
            if(result_for_hour < 1){
                cmbTimeUnit.setValue('minutes');
                txtAmount.setValue(result_for_min);
            }
            if(result_for_day < 1){
                cmbTimeUnit.setValue('hours');
                txtAmount.setValue(result_for_hour);
            }else{
                cmbTimeUnit.setValue('days');
                txtAmount.setValue(result_for_day);
            }
        }

        if(new_value == 'days_to_use'){
            cmbDataUnit.setVisible(false);
            cmbDataUnit.setDisabled(true);
            cmbTimeUnit.setVisible(false);
            cmbTimeUnit.setDisabled(true);
            txtAmount.setFieldLabel('Days');
            var amount = win.record.get('days_to_use');
            txtAmount.setValue(amount);
        }
    },
    btnEditSave:  function(button){
        var me      = this;
        var win     = button.up("window");
        var form    = win.down('form');
        form.submit({
            clientValidation: true,
            url: me.getUrlEdit(),
            success: function(form, action) {
                win.close();
                me.reload(); //Reload from server
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
        if(!Ext.WindowManager.get('winCsvColumnSelectTopUps')){
            var w = Ext.widget('winCsvColumnSelect',{id:'winCsvColumnSelectTopUps',columns: col_list});
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
    }
});

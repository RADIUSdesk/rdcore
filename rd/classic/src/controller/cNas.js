Ext.define('Rd.controller.cNas', {
    extend: 'Ext.app.Controller',
    actionIndex: function(pnl,itemId){
        var me      = this;
        var item    = pnl.down('#'+itemId);
        var added   = false;
        if(!item){
            pnl.add({ 
                itemId : itemId,
                xtype  : 'gridNas',
                border : false,
                plain  : true,
                padding : Rd.config.gridSlim
            });
            pnl.on({activate : me.gridActivate,scope: me});
            added = true;
        }
        return added;      
    },
    views:  [
        'nas.gridNas','nas.winNasAdd','nas.gridRealmsForNas','nas.pnlNas',
        'components.winCsvColumnSelect', 'nas.pnlRealmsForNasCloud', 'nas.pnlNasNas',
        'nas.cmbNasTypes', 'nas.gridNasAvailability', 
        'components.pnlUsageGraph',
        'nas.pnlNasGraphs'
    ],
    stores: ['sNas', 'sNasTypes'],
    models: ['mNas' ],
    selectedRecord: null,
    config: {
        urlAdd          : '/cake4/rd_cake/nas/add.json',
        urlDelete       : '/cake4/rd_cake/nas/delete.json',
        urlExportCsv    : '/cake4/rd_cake/nas/export-csv',
        urlView         : '/cake4/rd_cake/nas/view.json',
        urlEdit         : '/cake4/rd_cake/nas/edit.json'
    },
    refs: [
        {  ref: 'gridNas',  selector:   'gridNas'},
        {  ref: 'grid',     selector:   'gridNas'}      
    ],
    init: function() {
        var me = this;
        if (me.inited) {
            return;
        }
        me.inited = true;
        me.control({
            'gridNas #reload': {
                click:      me.reload
            },
            'gridNas #add'  : {
                click:      me.add
            },
            'winNasAdd #btnDataNext' : {
                click:  me.btnDataNext
            },
            'gridNas #delete'   : {
                click:      me.del
            }, 
            'gridNas #edit' : {
                click:      me.edit
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


            'pnlNas #tabNasNas' : {
                activate: me.onTabNasActive
            },
            'pnlNas #tabNasNas #monitorType': {
                change: me.monitorTypeChange
            },
            'pnlNas #tabNasNas #chkSessionAutoClose': {
                change:     me.chkSessionAutoCloseChange
            },
            'pnlNas #tabNasNas #save' : {
                click: me.saveNas
            },
            'pnlNas #tabRealmsNas': {
                activate:   me.tabRealmsActivateNas
            },    
            'pnlRealmsForNasCloud #chkAvailForAll' :{
                change:     me.chkAvailForAllChangeTab
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
            },
            'winNasAdd #tabRealms': {
                activate:      me.gridRealmsForNasActivate
            }, 
            'winNasAdd #tabRealms #chkAvailForAll': {
                change:     me.chkAvailForAllChange
            },  
        });
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
        me.getGrid().getStore().load();
    },
    add: function(button){
        var me      = this;
        var tab     = button.up("tabpanel");
        var store   = tab.down("gridNas").getStore();
        var me 		= this;
        var c_name 	= Ext.getApplication().getCloudName();
        var c_id	= Ext.getApplication().getCloudId()
        if(!Ext.WindowManager.get('winNasAddId')){
            var w = Ext.widget('winNasAdd',{id:'winNasAddId',cloudId: c_id, cloudName: c_name,store: store});
            w.show();         
        }
    },
    chkAvailForAllChangeTab: function(chk){
        var me      = this;
        var pnl     = chk.up('panel');
        var grid    = pnl.down("gridRealmsForNas");
        if(chk.getValue() == true){
            grid.hide();
            grid.getStore().getProxy().setExtraParam('clear_flag',true);           
        }else{
            grid.show();
            grid.getStore().getProxy().setExtraParam('clear_flag',false);
        }
        grid.getStore().load();
    },
    gridRealmsForNasActivate: function(tab){
        var me      = this;
        var grid    = tab.down('gridRealmsForNas');
        grid.getStore().load();
    },
    btnDataNext: function(button){
        var me      = this;
        var win     = button.up('window');
        var form    = button.up('form');
        var tp      = form.down('tabpanel');
        var grid    = form.down('gridRealmsForNas');
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

    //_____ END ADD _______

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
                    title       : nas_tab_name,
                    itemId      : nas_tab_id,
                    closable    : true,
                    glyph       : Rd.config.icnEdit, 
                    layout      : 'fit',
                    tabConfig : {
                        ui : me.ui
                    }, 
                    items:      {'xtype' : 'pnlNas',nas_id: nas_id, record: sr}
                });
                tp.setActiveTab(nas_tab_id); //Set focus on Add Tab
            });
        }
    },
    onTabNasActive: function(t){
        var me      = this;
        var form    = t;
        //get the dynamic_client_id's id
        var nas_id = t.up('pnlNas').nas_id;     
        form.load({
            url     : me.getUrlView(), 
            method  : 'GET',
            params  : {nas_id:nas_id},
            success : function(a,b){
                
            }
        });
    },
    saveNas : function(button){

        var me      = this;
        var form    = button.up('form');
        var tab     = button.up('#tabNas');
        var nas_id  = button.up('pnlNas').nas_id;
        //Checks passed fine...      
        form.submit({
            clientValidation    : true,
            url                 : me.getUrlEdit(),
            params              : {id: nas_id},
            success             : function(form, action) {
                me.reload();
                Ext.ux.Toaster.msg(
                    i18n('sItems_modified'),
                    i18n('sItems_modified_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
                me.onTabNasActive(tab);
            },
            failure             : Ext.ux.formFail
        });
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
    gridNasAvailabilityReload: function(button){
        var me      = this;
        var grid    = button.up('gridNasAvailability');
        grid.getStore().load();
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
    },
    chkAvailForAllChange: function(chk){
        var me      = this;
        var pnl     = chk.up('panel');
        var grid    = pnl.down("gridRealmsForNas");
        if(chk.getValue() == true){
            grid.hide();
        }else{
            grid.show();
        }
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
    tabRealmsActivateNas : function(tab){
        var me      = this;
        var gridR   = tab.down('gridRealmsForNas');
        gridR.getStore().load();
    }
});

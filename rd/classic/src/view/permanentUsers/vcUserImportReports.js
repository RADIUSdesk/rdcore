Ext.define('Rd.view.permanentUsers.vcUserImportReports', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcUserImportReports',
    init    : function() {
    
    },
    config: {
    	UrlClearReport	: '/cake4/rd_cake/import-failures/delete.json',
    	UrlClearLock	: '/cake4/rd_cake/import-failures/clear-lock.json',
    	urlExportCsv    : '/cake4/rd_cake/import-failures/export-csv',
    },
    control: {
        'gridUserImportReports': {
            activate : 'onPnlActivate'
        },
        'gridUserImportReports #reload': {
            click :  'reload'
        },
        'gridUserImportReports #delete': {
            click :  'clearReport'
        },
        'gridUserImportReports #clear_lock': {
            click :  'clearLock'
        },
        'gridUserImportReports #csv': {
            click :  'csvExport'
        },
        '#winCsvUserImportReports #save': {
            click:  'csvExportSubmit'
        }
    },
    onPnlActivate: function(pnl){
        var me = this;
        me.reload();
    },
    reload: function(){
        var me      = this;
        me.getView().getSelectionModel().deselectAll(true);
        me.getView().getStore().load();
    },
    clearReport: function(btn){
        var me = this;
        Ext.MessageBox.confirm(i18n('sConfirm'), i18n('sAre_you_sure_you_want_to_do_that_qm'), function(val){
            if(val== 'yes'){
                var list        = [];
                Ext.Ajax.request({
                    url         : me.getUrlClearReport(),
                    method      : 'POST',          
                    jsonData    : {'model' : 'PermanentUsers'},
                    success     : function(batch,options){console.log('success');
                        Ext.ux.Toaster.msg(
                            'Report cleared',
                            'Report cleared fine',
                            Ext.ux.Constants.clsInfo,
                            Ext.ux.Constants.msgInfo
                        );
                        me.reload(); //Reload from server
                    },                                    
                    failure     : function (response, options) {
                        var jsonData = Ext.JSON.decode(response.responseText);
                        Ext.Msg.show({
                            title       : "Error",
                            msg         : response.request.url + '<br>' + response.status + ' ' + response.statusText+"<br>"+jsonData.message,
                            modal       : true,
                            buttons     : Ext.Msg.OK,
                            icon        : Ext.Msg.ERROR,
                            closeAction : 'destroy'
                        });
                        me.reload(); //Reload from server
                    }
                });
            }
        });
    },
    clearLock: function(btn){
        var me = this;
        Ext.MessageBox.confirm(i18n('sConfirm'), 'The lock file typically indicates an import is running in the background.<br>Removing it can break things!<br>Are you sure about this action?', function(val){
            if(val== 'yes'){
                var list        = [];
                Ext.Ajax.request({
                    url         : me.getUrlClearLock(),
                    method      : 'POST',          
                    jsonData    : {'model' : 'PermanentUsers'},
                    success     : function(batch,options){console.log('success');
                        Ext.ux.Toaster.msg(
                            'Lock file cleared',
                            'Lock file cleared fine',
                            Ext.ux.Constants.clsInfo,
                            Ext.ux.Constants.msgInfo
                        );
                        btn.setDisabled(true);
                    },                                    
                    failure     : function (response, options) {
                        var jsonData = Ext.JSON.decode(response.responseText);
                        Ext.Msg.show({
                            title       : "Error",
                            msg         : response.request.url + '<br>' + response.status + ' ' + response.statusText+"<br>"+jsonData.message,
                            modal       : true,
                            buttons     : Ext.Msg.OK,
                            icon        : Ext.Msg.ERROR,
                            closeAction : 'destroy'
                        });
                        me.reload(); //Reload from server
                    }
                });
            }
        });
    },
    csvExport: function(button,format) {
        var me          = this;
        var columns     = me.getView().down('headercontainer').getGridColumns();
        var col_list    = [];
        Ext.Array.each(columns, function(item,index){
            if(item.dataIndex != ''){
                var chk = {boxLabel: item.text, name: item.dataIndex, checked: true};
                col_list.push(chk);
            }
        });
         
        if(!Ext.WindowManager.get('winCsvUserImportReports')){
            var w = Ext.widget('winCsvColumnSelect',{itemId:'winCsvUserImportReports', id:'winCsvUserImportReports',columns: col_list});
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

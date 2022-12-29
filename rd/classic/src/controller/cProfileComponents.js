Ext.define('Rd.controller.cProfileComponents', {
    extend: 'Ext.app.Controller',
    actionIndex: function(tp){
        var me      = this;  
        var tab     = tp.items.findBy(function (tab){
            return tab.getXType() === 'gridProfileComponents';
        });
        
        if (!tab){
            tab = tp.insert(3,{
                xtype   : 'gridProfileComponents',
                padding : Rd.config.gridSlim,
                border  : false,
               // itemId  : 'tabDevices',
                glyph   : Rd.config.icnComponent,
                title   : 'Profile Components',
                plain	: true,
                closable: true, 
                tabConfig: {
                    ui: Rd.config.tabDevices
                }
            });
            tab.on({activate : me.gridActivate,scope: me});
        }        
        tp.setActiveTab(tab);
    },

    views:  [
        'profileComponents.gridProfileComponents',  'profileComponents.winProfileComponentAdd',
        'profileComponents.gridProfileComponent',   'components.cmbVendor',     'components.cmbAttribute'
    ],
    stores: ['sProfileComponents', 'sAttributes', 'sVendors'],
    models: ['mProfileComponent',  'mAttribute',   'mVendor',  'mProfileComponentEdit' ],
    selectedRecord: null,
    config: {
        urlAdd:             '/cake4/rd_cake/profile-components/add.json',
        urlDelete:          '/cake4/rd_cake/profile-components/delete.json',
        urlExportCsv:       '/cake4/rd_cake/profile-components/export-csv'
    },
    refs: [
        {  ref: 'grid',  selector:   'gridProfileComponents'}       
    ],
    init: function() {
        var me = this;
        if (me.inited) {
            return;
        }
        me.inited = true;

        me.control({
            '#tabProfileComponents'    : {
                destroy   :      me.appClose
            },
            'gridProfileComponents #reload': {
                click:      me.reload
            }, 
            'gridProfileComponents #add'   : {
                click:      me.add
            },
            'gridProfileComponents #delete'   : {
                click:      me.del
            },
            'gridProfileComponents #edit'   : {
                click:      me.edit
            },
            'gridProfileComponents #csv'  : {
                click:      me.csvExport
            },
            'gridProfileComponents'   : {
                select:      me.select
            },
            'gridProfileComponents actioncolumn': { 
                 itemClick  : me.onActionColumnItemClick
            },
            'winProfileComponentAdd #btnDataNext' : {
                click:  me.btnDataNext
            },
            'gridProfileComponent  #cmbVendor': {
                change:      me.cmbVendorChange
            },
            'gridProfileComponent  #add': {
                click:      me.attrAdd
            },
            'gridProfileComponent  #reload': {
                click:      me.attrReload
            },
            'gridProfileComponent  #delete': {
                click:      me.attrDelete
            }
        });
    },
    appClose:   function(){
        var me          = this;
        me.populated    = false;
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
    add: function(button){
        var me 		= this;
        var c_name 	= Ext.getApplication().getCloudName();
        var c_id	= Ext.getApplication().getCloudId()
        if(!Ext.WindowManager.get('winProfileComponentAddId')){
            var w = Ext.widget('winProfileComponentAdd',{id:'winProfileComponentAddId',cloudId: c_id, cloudName: c_name});
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
                me.getStore('sProfileComponents').load();
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
                var comp_id     = sr.getId();
                var comp_tab_id = 'compTab_'+comp_id;
                var nt          = tp.down('#'+comp_tab_id);
                if(nt){
                    tp.setActiveTab(comp_tab_id); //Set focus on  Tab
                    return;
                }

                var comp_tab_name = sr.get('name');
                //Tab not there - add one
                tp.add({ 
                    title :     comp_tab_name,
                    itemId:     comp_tab_id,
                    closable:   true,
                    glyph       : Rd.config.icnEdit, 
                    layout:     'fit',
                    tabConfig: {
                         ui: Rd.config.tabProfileComp
                    }, 
                    items:      {'xtype' : 'gridProfileComponent',comp_id: comp_id}
                });
                tp.setActiveTab(comp_tab_id); //Set focus on Edit Tab
            });
        }
    },
    onStoreProfileComponentsLoaded: function() {
        var me      = this;
        var count   = me.getStore('sProfileComponents').getTotalCount();
        me.getGrid().down('#count').update({count: count});
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

        if(!Ext.WindowManager.get('winCsvColumnSelectProfileComponents')){
            var w = Ext.widget('winCsvColumnSelect',{id:'winCsvColumnSelectProfileComponents',columns: col_list});
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
    cmbVendorChange: function(cmb){
        var me = this;
        console.log("Combo thing changed");
        var value   = cmb.getValue();
        var grid    = cmb.up('gridProfileComponent');
        var attr    = grid.down('cmbAttribute');
        //Cause this to result in a reload of the Attribute combo
        attr.getStore().getProxy().setExtraParam('vendor',value);
        attr.getStore().load();   
    },
    attrAdd: function(b){
        var me = this;
        console.log("Add to specific template");
        var grid    = b.up('gridProfileComponent');
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
                grid.getStore().add(Ext.create('Rd.model.mProfileComponentEdit',
                    {
                        type            : 'check',
                        attribute       : a_val,
                        op              : ':=',
                        value           : i18n('sReplace_this_value')
                    }
                ));
                grid.getStore().sync();
            }else{
                //We allow second entried for multiple values
                grid.getStore().add(Ext.create('Rd.model.mProfileComponentEdit',
                    {
                        type            : 'check',
                        attribute       : a_val,
                        op              : '+=',
                        value           : i18n('sReplace_this_value')
                    }
                ));
                grid.getStore().sync();
            }
        }
    },

    attrReload: function(b){
        var me = this;
        var grid = b.up('gridProfileComponent');
        grid.getStore().load();
    },
    attrDelete: function(button){

        var me      = this;
        var grid    = button.up('gridProfileComponent');
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
    }
});

Ext.define('Rd.controller.cIspSpecifics', {
    extend: 'Ext.app.Controller',
     actionIndex: function(pnl,itemId){
        var me      = this;
        var item    = pnl.down('#'+itemId);
        var added   = false;
        if(!item){
            pnl.add({ 
                itemId  : itemId,
                xtype   : 'gridIspSpecifics',
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
        'ispSpecifics.gridIspSpecifics',               
        'ispSpecifics.winIspSpecificAdd',
        'ispSpecifics.winIspSpecificEdit'
    ],
    stores: ['sIspSpecifics'],
    models: ['mIspSpecific'],
    selectedRecord: null,
    config: {
        urlAdd:             '/cake4/rd_cake/isp-specifics/add.json',
        urlEdit:            '/cake4/rd_cake/isp-specifics/edit.json',
        urlDelete:          '/cake4/rd_cake/isp-specifics/delete.json'
    },
    refs: [
         { ref:     'grid',                 selector:   'gridIspSpecifics'}
    ],
    init: function() {
        var me = this;
        if (me.inited) {
            return;
        }
        me.inited = true;
  	},
  	control : {
        'gridIspSpecifics #reload': {
            click:      'reload'
        },
        'gridIspSpecifics #add': {
            click:      'add'
        },
        'gridIspSpecifics #delete': {
            click:      'del'
        },
        'gridIspSpecifics #edit': {
            click:      'edit'
        },
        'gridIspSpecifics'   : {
            itemclick       :  'gridClick'
        },
        'gridIspSpecifics actioncolumn': { 
             itemClick  : 'onActionColumnItemClick'
        },
        'winIspSpecificAdd #btnSave' : {
            click:  'addSubmit'
        },
        'winIspSpecificEdit #btnSave' : {
            click:  'editSubmit'
        }        
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
        var me 				= this;
        me.selectedRecord 	= record;    
    },
    add: function(button){
        var me 		= this;
        var c_name 	= Ext.getApplication().getCloudName();
        var c_id	= Ext.getApplication().getCloudId()
        if(!Ext.WindowManager.get('winIspSpecificAddId')){
            var w = Ext.widget('winIspSpecificAdd',{id:'winIspSpecificAddId',cloudId: c_id, cloudName: c_name});
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
                me.getStore('sIspSpecifics').load();
                Ext.ux.Toaster.msg(
                    i18n('sNew_item_created'),
                    i18n('sItem_created_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },
            //Focus on the first tab as this is the most likely cause of error 
            failure: function(form,action){
                Ext.ux.formFail(form,action);
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
            if(!Ext.WindowManager.get('winIspSpecificEditId')){
		        var w = Ext.widget('winIspSpecificEdit',{id:'winIspSpecificEditId'});
		        w.down('form').loadRecord(me.getGrid().getSelectionModel().getLastSelected());
		        w.show();         
		    }else{
		    	w.down('form').loadRecord(me.getGrid().getSelectionModel().getLastSelected());
		    }
        }
    },
    editSubmit: function(button){
        var me      = this;
        var win     = button.up('window');
        var form    = win.down('form');
        form.submit({
            clientValidation: true,
            url: me.getUrlEdit(),
            success: function(form, action) {
                win.close();
                me.getStore('sIspSpecifics').load();
                Ext.ux.Toaster.msg(
                    i18n('sNew_item_created'),
                    i18n('sItem_created_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },
            //Focus on the first tab as this is the most likely cause of error 
            failure: function(form,action){
                Ext.ux.formFail(form,action);
            }
        });
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
    }
});

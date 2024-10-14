Ext.define('Rd.controller.cHomeServerPools', {
    extend: 'Ext.app.Controller',
    actionIndex: function(pnl,itemId){
        var me      = this;
        var item    = pnl.down('#'+itemId);
        var added   = false;
        if(!item){
            var tp = Ext.create('Ext.tab.Panel',
            	{          
	            	border  : false,
	                itemId  : itemId,
	                plain	: true,
	                cls     : 'subSubTab', //Make darker -> Maybe grey
	                tabBar: {
                        items: [
                            { 
                                xtype   : 'btnOtherBack'
                            }              
                       ]
                    },
	                items   : [
	                    { 
	                        title   : 'FreeRADIUS Home Servers', 
	                        xtype   : 'gridHomeServerPools',
	                        border  : false,
                            plain   : true,
                            padding : '0 5 0 5',
	                        glyph   : 'xf1ce@FontAwesome',
	                        listeners: {
                                activate: me.reload,
                                scope   : me
                            }
	                    }
	                ]
	            });      
            pnl.add(tp);
            added = true;
        }
        return added;      
    },
    views:  [
        'homeServerPools.gridHomeServerPools',           
        'homeServerPools.winHomeServerPoolAdd',
        'homeServerPools.pnlHomeServerPoolAddEdit',        
        'homeServerPools.pnlHomeServer'
    ],
    stores: ['sHomeServerPools'],
    models: ['mHomeServerPool'],
    selectedRecord: null,
    config: {
        urlAdd          : '/cake4/rd_cake/home-server-pools/add.json',
        urlDelete       : '/cake4/rd_cake/home-server-pools/delete.json',
		urlEdit         : '/cake4/rd_cake/home-server-pools/edit.json',
		urlView         : '/cake4/rd_cake/home-server-pools/view.json'
    },
    refs: [
        {  ref: 'grid',  selector: 'gridHomeServerPools'}       
    ],
    init: function() {
        var me = this;
        if (me.inited) {
            return;
        }
        me.inited = true;
        me.control({
            'gridHomeServerPools #reload': {
                click:      me.reload
            }, 
            'gridHomeServerPools #add'   : {
                click:      me.add
            },
            'gridHomeServerPools #delete'	: {
                click:      me.del
            },
            'gridHomeServerPools #edit'   : {
                click:      me.edit
            },
            'gridHomeServerPools'   : {
                select:      me.select
            },
            'winHomeServerPoolAdd #btnDataNext' : {
                click:  me.btnDataNext
            },
			'pnlHomeServerPoolAddEdit #save': {
                click: me.btnEditSave
            },
            'gridHomeServerPools actioncolumn': { 
                 itemClick  : me.onActionColumnItemClick
            }
        });
    },    
    reload: function(){
        var me =this;
        me.getGrid().getSelectionModel().deselectAll(true);
        me.getGrid().getStore().load();
    },
    add: function(button){
        var me      = this;
        var tab     = button.up("tabpanel");
        var store   = tab.down("gridHomeServerPools").getStore();
        var me 		= this;
        var c_name 	= Ext.getApplication().getCloudName();
        var c_id	= Ext.getApplication().getCloudId();
        var dd      = Ext.getApplication().getDashboardData();
        var root    = false;
        if(dd.isRootUser){
            root = true   
        }
        if(!Ext.WindowManager.get('winHomeServerPoolAddId')){
            var w = Ext.widget('winHomeServerPoolAdd',{id:'winHomeServerPoolAddId',cloudId: c_id, cloudName: c_name,store: store,root:root});
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
                me.getStore('sHomeServerPools').load();
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
            if(tb.down('#photo') != null){
                tb.down('#photo').setDisabled(false);
            }                     
        }else{
            if(tb.down('#edit') != null){
                tb.down('#edit').setDisabled(true);
            }
            if(tb.down('#photo') != null){
                tb.down('#photo').setDisabled(true);
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
                            console.log("Could not delete!");
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
                var hsp_id      = sr.getId();
                var hsp_tab_id  = 'hspTab_'+hsp_id;
                var nt          = tp.down('#'+hsp_tab_id);
                if(nt){
                    tp.setActiveTab(hsp_tab_id); //Set focus on  Tab
                    return;
                }

                var hsp_tab_name = sr.get('name');
                //Tab not there - add one
                tp.add({ 
                    title       : hsp_tab_name,
                    itemId      : hsp_tab_id,
                    closable    : true,
                    glyph       : Rd.config.icnEdit,
                    layout      : 'fit', 
                    items       : {'xtype' : 'pnlHomeServerPoolAddEdit',hsp_id: hsp_id, hsp_name: hsp_tab_name, record: sr}
                });
                tp.setActiveTab(hsp_tab_id); //Set focus on Add Tab*/
            });
        }
    },
	btnEditSave:  function(button){
        var me      = this;
        var form    = button.up("pnlHomeServerPoolAddEdit");
        var tab     = form.up('panel');
        
        form.submit({
            clientValidation: true,
            url: me.getUrlEdit(),
            success: function(form, action) {
                tab.close();
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

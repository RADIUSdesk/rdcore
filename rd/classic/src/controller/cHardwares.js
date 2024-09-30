Ext.define('Rd.controller.cHardwares', {
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
	                        title   : 'Hardware', 
	                        xtype   : 'gridHardwares',
	                        border  : false,
	                        plain   : true,
	                        glyph   : 'xf0a0@FontAwesome',
                            padding : Rd.config.gridSlim,
	                    }
	                ]
	            });      
            pnl.add(tp);
            pnl.on({activate : me.gridActivate,scope: me});
            added = true;
        }
        return added;      
    },
    views:  [
        'hardwares.gridHardwares',           
        'hardwares.winHardwareAdd',
        'hardwares.pnlHardwareAddEdit',        
        'hardwares.pnlRadioDetail',
        'hardwares.pnlHardwarePhoto'
    ],
    stores: ['sHardwares'],
    models: ['mHardware'],
    selectedRecord: null,
    config: {
        urlAdd          : '/cake4/rd_cake/hardwares/add.json',
        urlDelete       : '/cake4/rd_cake/hardwares/delete.json',
		urlEdit         : '/cake4/rd_cake/hardwares/edit.json',
		urlView         : '/cake4/rd_cake/hardwares/view.json',
		urlPhotoBase    : '/cake4/rd_cake/img/hardwares/',
		urlUploadPhoto  : '/cake4/rd_cake/hardwares/upload-photo.json'
    },
    refs: [
        {  ref: 'grid',  selector: 'gridHardwares'}       
    ],
    init: function() {
        var me = this;

        var me = this;
        if (me.inited) {
            return;
        }
        me.inited = true;

        me.control({
            'gridHardwares #reload': {
                click:      me.reload
            }, 
            'gridHardwares #add'   : {
                click:      me.add
            },
            'gridHardwares #delete'	: {
                click:      me.del
            },
            'gridHardwares #edit'   : {
                click:      me.edit
            },
            'gridHardwares #photo'  : {
                click:      me.photo
            },
            'gridHardwares'   		: {
                select:      me.select
            },
            'gridHardwares actioncolumn': { 
                 itemClick  : me.onActionColumnItemClick
            },
            'winHardwareAdd #btnSave' : {
                click:  me.btnSave
            },
			'pnlHardwareAddEdit #save': {
                click: me.btnEditSave
            },
            //Photo    
            'pnlHardwarePhoto': {
                activate:    me.tabPhotoActivate
            },
            'pnlHardwarePhoto #save': {
                click:       me.photoSave
            },
            'pnlHardwarePhoto #cancel': {
                click:       me.photoCancel
            }
        });
    },    
    gridActivate: function(p){     
        var g = p.down('grid');
        g.getStore().load();
    },
	reload: function(){
        var me =this;
        me.getGrid().getSelectionModel().deselectAll(true);
        me.getGrid().getStore().load();
    },
    add: function(button){   
    	var me 		= this;
        console.log("Add Called");
        var c_name 	= Ext.getApplication().getCloudName();
        var c_id	= Ext.getApplication().getCloudId();
        var dd      = Ext.getApplication().getDashboardData();
        var root    = false;
        if(dd.isRootUser){
            root = true   
        }

        if(!Ext.WindowManager.get('winHardwareAddId')){
            var w = Ext.widget('winHardwareAdd',{id:'winHardwareAddId',cloudId: c_id, cloudName: c_name, root: root});
            w.show();         
        }   
    },
    btnSave:  function(button){
        var me      = this;
        var win     = button.up('window');
        var form    = win.down('form');
        form.submit({
            clientValidation: true,
            url: me.getUrlAdd(),
            success: function(form, action) {
                win.close();
                me.getStore('sHardwares').load();
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
                var hw_id       = sr.getId();
                var hw_tab_id   = 'hwTab_'+hw_id;
                var nt          = tp.down('#'+hw_tab_id);
                if(nt){
                    tp.setActiveTab(hw_tab_id); //Set focus on  Tab
                    return;
                }

                var hw_tab_name = sr.get('name');
                var dd      = Ext.getApplication().getDashboardData();
                var root    = false;
                if(dd.isRootUser){
                    root = true   
                }
                //Tab not there - add one
                tp.add({ 
                    title       : hw_tab_name,
                    itemId      : hw_tab_id,
                    closable    : true,
                    glyph       : Rd.config.icnEdit,
                    layout      : 'fit', 
                    items       : {'xtype' : 'pnlHardwareAddEdit',hw_id: hw_id, hw_name: hw_tab_name, record: sr, root: root}
                });
                tp.setActiveTab(hw_tab_id); //Set focus on Add Tab*/
            });
        }
    },
	btnEditSave:  function(button){
        var me      = this;
        var form    = button.up("pnlHardwareAddEdit");
        
        form.submit({
            clientValidation: true,
            url: me.getUrlEdit(),
            success: function(form, action) {
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
    photo : function(button){
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
            var tab_id  = 'hardwareTabPhoto_'+id;
            var nt      = tp.down('#'+tab_id);
            if(nt){
                tp.setActiveTab(tab_id); //Set focus on  Tab
                return;
            }
            var tab_name = sr.get('name');
            //Tab not there - add one
            tp.add({ 
                title   : tab_name,
                itemId  : tab_id,
                closable: true,
                glyph   : Rd.config.icnCamera, 
                xtype   : 'pnlHardwarePhoto',
                hardware_id: id,
                tabConfig : {
                    ui : me.ui
                }
            });
            tp.setActiveTab(tab_id); //Set focus on Add Tab 
        }
    },
    tabPhotoActivate: function(tab){
        var me          = this;
        var hardware_id = tab.hardware_id;
        var p_img       = tab.down('#pnlImg');
        Ext.Ajax.request({
            url     : me.getUrlView(),
            method  : 'GET',
            params  : { hardware_id : hardware_id },
            success: function(response){
                var jsonData    = Ext.JSON.decode(response.responseText);
                if(jsonData.success){
                    var img_url = me.getUrlPhotoBase()+jsonData.data.photo_file_name;
                    p_img.update({image:img_url});
                }   
            },
            scope: me
        });
    },
    photoSave: function(button){
        var me      = this;
        var form    = button.up('form');
        var p_img   = form.down('#pnlImg');
        form.submit({
            clientValidation: true,
            waitMsg: 'Uploading your photo...',
            url: me.getUrlUploadPhoto(),
            params: {'id' : form.hardware_id },
            success: function(form, action) {              
                if(action.result.success){ 
                    var new_img = action.result.photo_file_name;    
                    var img_url = me.getUrlPhotoBase()+new_img;
                    var rn = Ext.Number.randomInt(10,10000);
                    p_img.update({image:img_url+'?_dc='+rn});
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
    photoCancel: function(button){
        var me      = this;
        var form    = button.up('form');
        form.getForm().reset();
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

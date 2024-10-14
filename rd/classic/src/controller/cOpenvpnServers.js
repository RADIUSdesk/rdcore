Ext.define('Rd.controller.cOpenvpnServers', {
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
	                        title   : 'OpenVPN Servers', 
	                        xtype   : 'gridOpenvpnServers',
	                        border  : false,
                            plain   : true,
                            padding : '0 5 0 5',
	                        glyph   : 'xf10e@FontAwesome',
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
        'openvpnServers.gridOpenvpnServers',           
        'openvpnServers.winOpenvpnServerEdit', 		'openvpnServers.winOpenvpnServerAdd'
    ],
    stores: ['sOpenvpnServers'],
    models: ['mOpenvpnServer'],
    selectedRecord: null,
    config: {
        urlApChildCheck : '/cake4/rd_cake/access-providers/child-check.json',
        urlExportCsv    : '/cake4/rd_cake/openvpn-servers/export_csv',
        urlAdd          : '/cake4/rd_cake/openvpn-servers/add.json',
        urlDelete       : '/cake4/rd_cake/openvpn-servers/delete.json',
		urlEdit         : '/cake4/rd_cake/openvpn-servers/edit.json'
    },
    refs: [
        {  ref: 'grid',  selector: 'gridOpenvpnServers'}       
    ],
    init: function() {

        var me = this;
        if (me.inited) {
            return;
        }
        me.inited = true;

        me.control({
            '#tabOpenvpnServers' : {
                destroy   :      me.appClose   
            },
            'gridOpenvpnServers #reload': {
                click:      me.reload
            }, 
            'gridOpenvpnServers #add'   : {
                click:      me.add
            },
            'gridOpenvpnServers #delete'	: {
                click:      me.del
            },
            'gridOpenvpnServers #edit'   : {
                click:      me.edit
            },
            'gridOpenvpnServers'   		: {
                select:      me.select
            },
            'winOpenvpnServerAdd #btnDataNext' : {
                click:  me.btnDataNext
            },
			'winOpenvpnServerEdit #save': {
                click: me.btnEditSave
            },
            'gridOpenvpnServers actioncolumn': { 
                 itemClick  : me.onActionColumnItemClick
            }
        });
    },
    appClose:   function(){
        var me          = this;
        me.populated    = false;
    },
	reload: function(){
        var me =this;
        me.getGrid().getSelectionModel().deselectAll(true);
        me.getGrid().getStore().load();
    },
    add: function(button){        
        var me      = this;
        var c_name 	= Ext.getApplication().getCloudName();
        var c_id	= Ext.getApplication().getCloudId();
        var dd      = Ext.getApplication().getDashboardData();
        var root    = false;
        if(dd.isRootUser){
            root = true   
        } 
        if(!Ext.WindowManager.get('winOpenvpnServerAddId')){
            var w = Ext.widget('winOpenvpnServerAdd',{id:'winOpenvpnServerAddId',cloudId: c_id, cloudName: c_name,root:root});
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
                me.getStore('sOpenvpnServers').load();
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
    edit: function(){
        var me      = this;
        var grid    = me.getGrid()
        //Find out if there was something selected
        if(grid.getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item_to_edit'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
			var sr      =  me.getGrid().getSelectionModel().getLastSelected();
			if(!Ext.WindowManager.get('winOpenvpnServerEditId')){
			    var dd      = Ext.getApplication().getDashboardData();
                var root    = false;
                if(dd.isRootUser){
                    root = true;  
                } 
                var w = Ext.widget('winOpenvpnServerEdit',{id:'winOpenvpnServerEditId',record: sr, root:root });
                w.show();      
            }    
        }
    },
	btnEditSave:  function(button){
        var me      = this;
        var win     = button.up("winOpenvpnServerEdit");
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

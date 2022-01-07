Ext.define('Rd.controller.cAccessPointViews', {
    extend: 'Ext.app.Controller',
    views:  [
        'aps.pnlAccessPointView',
        'components.winHardwareAddAction'
    ],
    config: {
        urlApProfileAddApAction :  '/cake3/rd_cake/ap-actions/add.json',
        urlRestartAps           : '/cake3/rd_cake/ap-actions/restart_aps.json',
        urlHardware             : '/cake3/rd_cake/ap-reports/view_overview.json',
    },
    refs: [
        {  ref: 'tabAccessPoints',    selector: '#tabAccessPoints' },
        {  ref: 'gridApViewActions',  selector: 'gridApViewActions' } 
    ],
    control: {
        'pnlAccessPointView gridApViewActions #reload' : {
			click	    : 'reloadApActions'
		},
		'pnlAccessPointView gridApViewActions #add' : {
			click	    : 'addApActions'
		},
		'winHardwareAddAction #save' : {
			click	    : 'commitExecute'
		},
		'pnlAccessPointView gridApViewActions #delete' : {
			click	    : 'deleteApActions'
		},
		'pnlAccessPointView gridApViewActions' : {
			activate    : 'activateApActions'
		},
		'pnlAccessPointView pnlApViewHardware' : {
			activate    : 'activateApHardware'
		}
    },
    init: function() {
        var me = this; 
        if (me.inited) {
            return;
        }
        me.inited = true;
    },
    actionIndex: function(ap_id,name){
		var me      = this;
        var id		= 'tabAccessPointView'+ ap_id;
        var tabAps  = me.getTabAccessPoints();      
        var newTab  = tabAps.items.findBy(
            function (tab){
                return tab.getItemId() === id;
            });
         
        if (!newTab){
            newTab = tabAps.add({
                glyph   : Rd.config.icnView, 
                title   : name,
                closable: true,
                layout  : 'fit',
                xtype   : 'pnlAccessPointView',
                itemId  : id,
                ap_id   : ap_id
            });
        }    
        tabAps.setActiveTab(newTab); 
           
    },
    activateApActions: function(grid){
		var me = this;
		grid.getStore().reload();
	},
	reloadApActions: function(b){
		var me 		= this;
		var grid 	= b.up('gridApViewActions');
		grid.getStore().reload();
	},
	addApActions: function(b){
		var me 		= this;
		var grid 	= b.up('gridApViewActions');
		var apId	= grid.apId;
        if(!Ext.WindowManager.get('winHardwareAddAction_'+apId)){
            var w = Ext.widget('winHardwareAddAction',{id:'winHardwareAddAction_'+apId,grid : grid,apId: apId,'scope' : 'ApView'});
            w.show();       
        }
	},
	deleteApActions:   function(b){
        var me 		= this;
		var grid 	= b.up('gridApViewActions');
		var apId	= grid.apId;
   
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
    commitExecute:  function(button){
        var me      = this;
        var win     = button.up('winHardwareAddAction');
        var form    = win.down('form');
        if(win.scope == 'ApView'){ //Only if it originates from the AccessPointView
            form.submit({
                clientValidation	: true,
                url					: me.getUrlApProfileAddApAction(),
			    params				: {ap_id:win.apId},
                success: function(form, action) {   
				    win.close();
				    me.getGridApViewActions().getStore().reload();
				    Ext.ux.Toaster.msg(
                        i18n("sItem_created"),
                        i18n("sItem_created_fine"),
                        Ext.ux.Constants.clsInfo,
                        Ext.ux.Constants.msgInfo
                    );
                },
                scope       : me,
                failure     : Ext.ux.formFail
            });
        }
    },
    activateApHardware: function(pnl){
        var me      = this;
        var ap_id   = pnl.apId;
        pnl.setLoading(true);
        Ext.Ajax.request({
            url: me.getUrlHardware(),
            params: {
                ap_id : ap_id
            },
            method: 'GET',
            success: function(response){
                var jsonData = Ext.JSON.decode(response.responseText);
                pnl.setLoading(false);  
                if(jsonData.success){    
                   pnl.setData(jsonData.data);
                }else{
    
                }
            }
        });  
    }
});

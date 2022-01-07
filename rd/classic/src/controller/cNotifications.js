Ext.define('Rd.controller.cNotifications', {
    extend: 'Ext.app.Controller',
    actionIndex: function(pnl){
        var me      = this;
     
        if (me.populated) {
            return; 
        }     
        pnl.add({
            xtype   : 'tabpanel',
            border  : false,
            itemId  : 'tabNotifications',
            plain   : false,
            items   : [
                { 
                    title : 'Alerts', 	    
                    xtype : 'gridNotifications',
                    glyph : Rd.config.icnBell,
                    tabConfig   : {
                        ui : 'tab-blue'
                    } 
                }
            ]
        });
        me.populated = true;
    },

    views:  [
        'notifications.gridNotifications'
    ],
    stores      : [
		'sNotificationLists'
	],
    models      : ['mNotificationList'
    ],
    selectedRecord: null,
    config: {
        urlAddNode: '/cake3/rd_cake/notification-lists/notification_add.json',
        urlViewNotification: '/cake3/rd_cake/notification-lists/notification_view.json'
    },
    refs: [
        {  ref: 'grid',         selector: 'gridNotifications'}
    ],
    init: function() {
        var me = this;
        if (me.inited) {
            return;
        }
        me.inited = true;

        me.control({
            '#tabNotifications' : {
                destroy   :      me.appClose   
            },
			'#tabNotifications gridNotifications' : {
				activate	: me.gridActivate
			},
            'gridNotifications #reload': {
                click:      me.reload
            },
            'gridNotifications #view'   : {
                click:      me.view
            },
            'gridNotifications #note'   : {
                click:      me.note
            },
            'gridNotifications'   		: {
                select:      me.select,
                rowclick    : me.rowclick
            }
        });
    },
    rowSelected: true,
    appClose:   function(){
        var me          = this;
        me.populated    = false;
        if(me.autoReload != undefined){
            clearInterval(me.autoReload);   //Always clear
        }
        
    },
	gridActivate: function(g){
        var me = this;
        g.getStore().load();
    },
    reload: function(){
        var me =this;
        me.getGrid().getSelectionModel().deselectAll(true);
        me.getGrid().getStore().load();
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
    rowclick: function (grid, record) {

        if (this.rowSelected == false && grid.selection != null && grid.selection.id == record.id) {
            //grid.deselectAll();
            grid.getSelectionModel().deselectAll()
            me.rowSelected = false;
        } else {
            this.rowSelected = false;
        }

    },
    select: function (grid, record) {
        var me = this;
        //Adjust the Edit and Delete buttons accordingly...
        me.rowSelected = true;
        //Dynamically update the top toolbar
        tb = me.getGrid().down('toolbar[dock=top]');

        var view = record.get('view');
        if (view == true) {
            if (tb.down('#view') != null) {
                tb.down('#view').setDisabled(false);
            }
        } else {
            if (tb.down('#view') != null) {
                tb.down('#view').setDisabled(true);
            }
        }
    },
    view: function(button){
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
                var sr      = me.getGrid().getSelectionModel().getLastSelected();
                var id      = sr.getId();
                var name    = sr.get('name');  
				me.application.runAction('cNotificationViews','Index',id,name); 
            }
        }
    },
    //Notes for MESHes
    note: function(button,format) {
        var me      = this;    
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
                
                if(!Ext.WindowManager.get('winNoteMeshes'+sr.getId())){
                    var w = Ext.widget('winNote',
                        {
                            id          : 'winNoteMeshes'+sr.getId(),
                            noteForId   : sr.getId(),
                            noteForGrid : 'meshes',
                            noteForName : sr.get('name')
                        });
                    w.show();       
                }
            }    
        }
    },
    noteDelete: function(button){
        var me      = this;
        var grid    = button.up('gridNote');
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
                            grid.getStore().load();   //Update the count
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
    }

});

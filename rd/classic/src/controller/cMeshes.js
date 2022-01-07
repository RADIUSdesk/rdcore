Ext.define('Rd.controller.cMeshes', {
    extend: 'Ext.app.Controller',
    actionIndex: function(pnl){
        var me      = this;
     
        if (me.populated) {
            return; 
        }
        
       var items =   [
            { 
                title       : i18n('sMeshes'), 	    
                xtype       : 'gridMeshes',		
                glyph       : Rd.config.icnMesh,
                padding     : Rd.config.gridPadding,
                tabConfig   : {
                    ui : 'tab-blue'
                }               
            },
			{ 
			    title       : i18n('sKnown_Nodes'), 	
			    xtype       : 'gridNodeLists',	
			    glyph       : Rd.config.icnCheck,
			    padding     : Rd.config.gridPadding,
			    tabConfig   : {
                    ui : 'tab-orange'
                } 			
			}
        ];
                     
       if(me.application.getDashboardData().show_unknown_nodes){
       
            items = [
                { 
                    title       : i18n('sMeshes'), 	    
                    xtype       : 'gridMeshes',		
                    glyph       : Rd.config.icnMesh,
                    padding     : Rd.config.gridPadding,
                    tabConfig   : {
                        ui : 'tab-blue'
                    }    
                
                },
				{ 
				    title       : i18n('sKnown_Nodes'), 	
				    xtype       : 'gridNodeLists',	
				    glyph       : Rd.config.icnCheck,
				    padding     : Rd.config.gridPadding,
				    tabConfig   : {
                        ui : 'tab-orange'
                    } 
				
				},
				{ 
				    title       : i18n('sUnknown_Nodes'), 
				    xtype       :'gridUnknownNodes',
				    padding     : Rd.config.gridPadding,	
				    glyph       : Rd.config.icnQuestion,
				    tabConfig   : {
                        ui : 'tab-brown'
                    } 	
				}
            ];
        };
        
        //== 15May2021 Remove this for now
       /* if(me.application.getDashboardData().extensions){
            Ext.Array.push(items,{
                title       : 'Hardware Ownership', 
			    xtype       : 'gridHardwareOwners',
			    padding     : Rd.config.gridPadding,
			    glyph       : Rd.config.icnHands,
			    tabConfig   : {
                    ui : 'tab-teal'
                }
            });
        
        }*/
           
        pnl.add({
            xtype   : 'tabpanel',
            border  : false,
            itemId  : 'tabMeshes',
            //plain   : false,
            items   : items
        });
        me.populated = true;
    },

    views:  [
        'meshes.gridMeshes',        'meshes.winMeshAddWizard',
		'meshes.gridNodeLists',	    'meshes.gridUnknownNodes',
        'meshes.winMeshUnknownRedirect',
        'meshes.winMeshUnknownModeChange',
        'meshes.cmbHardwareOptions', 'meshes.tagStaticEntries', 'meshes.cmbStaticExits',
        'meshes.pnlMeshViewMapGoogle',
        'hardwareOwners.gridHardwareOwners',
        'meshes.pnlMeshViewMapLeaflet'   
    ],
    stores      : [
		'sMeshes',   'sAccessProvidersTree', 'sNodeLists', 				'sUnknownNodes',
		'sMeshEntries', 'sMeshExits', 	'sMeshEntryPoints',
		'sHardwareOwners',
		'sClouds'
	],
    models      : ['mMesh',     'mAccessProviderTree', 'mNodeList', 	'mUnknownNode', 
        'mHardwareOwner'
    ],
    selectedRecord: null,
    config: {
        urlAdd          : '/cake3/rd_cake/meshes/add.json',
        urlDelete       : '/cake3/rd_cake/meshes/delete.json',
        urlMapPrefView  : '/cake3/rd_cake/meshes/map_pref_view.json',
        urlApChildCheck : '/cake3/rd_cake/access-providers/child-check.json',
        urlNoteAdd      : '/cake3/rd_cake/meshes/note-add.json',
        urlAddNode      : '/cake3/rd_cake/meshes/mesh_node_add.json',
        urlViewNode     : '/cake3/rd_cake/meshes/mesh_node_view.json',
        urlEditNode     : '/cake3/rd_cake/meshes/mesh_node_edit.json',
        urlRedirectNode : '/cake3/rd_cake/nodes/redirect_unknown.json',
        urlRestartNodes : '/cake3/rd_cake/mesh-reports/restart_nodes.json',
        urlMeshAddNodeAction: '/cake3/rd_cake/node-actions/add.json',
        urlChangeDeviceMode: '/cake3/rd_cake/nodes/change_node_mode.json',
        urlAdvancedSettingsForModel: '/cake3/rd_cake/meshes/advanced_settings_for_model.json'
    },
    refs: [
        {  ref: 'grid',             selector: 'gridMeshes'},
        {  ref: 'gridNodeLists',    selector: 'gridNodeLists'},
        {  ref: 'tabMeshes',        selector: '#tabMeshes'},
        {  ref: 'gridUnknownNodes', selector: '#tabMeshes gridUnknownNodes'}
    ],
    init: function() {
        var me = this;
        if (me.inited) {
            return;
        }
        me.inited = true;

        me.control({
            '#tabMeshes' : {
                destroy   :      me.appClose   
            },
			'#tabMeshes gridMeshes' : {
				activate	: me.gridActivate
			},
			'#tabMeshes gridNodeLists' : {
				activate	: me.gridActivate
			},
			'#tabMeshes gridUnknownNodes' : {
				activate	: me.gridActivate
			},
            'gridMeshes #reload': {
                click:      me.reload
            },
            'gridMeshes #reload menuitem[group=refresh]'   : {
                click:      me.reloadOptionClick
            },  
            'gridMeshes #add'   : {
                click:      me.add
            },
            'gridMeshes #delete'   : {
                click:      me.del
            },
            'gridMeshes #edit'   : {
                click:      me.edit
            },
            'gridMeshes #view'   : {
                click:      me.view
            },
            'gridMeshes #map': {
                click: me.mapGetPref
            },
            'gridMeshes #xwf_filter': {
                change : me.xwfFilterToggle
            },
            'gridMeshes #note'   : {
                click:      me.note
            },
            'gridMeshes'   		: {
                select:      me.select,
                rowclick    : me.rowclick
            },
            'gridMeshes actioncolumn': { 
                 itemClick  : me.onActionColumnItemClick
            },
            'gridNote[noteForGrid=meshes] #reload' : {
                click:  me.noteReload
            },
            'gridNote[noteForGrid=meshes] #add' : {
                click:  me.noteAdd
            },
            'gridNote[noteForGrid=meshes] #delete' : {
                click:  me.noteDelete
            },
            'gridNote[noteForGrid=meshes]' : {
                itemclick: me.gridNoteClick
            },
            'winNoteAdd[noteForGrid=meshes] #btnTreeNext' : {
                click:  me.btnNoteTreeNext
            },
            'winNoteAdd[noteForGrid=meshes] #btnNoteAddPrev'  : {   
                click: me.btnNoteAddPrev
            },
            'winNoteAdd[noteForGrid=meshes] #btnNoteAddNext'  : {   
                click: me.btnNoteAddNext
            },
            //Add WiZard 
            'winMeshAddWizard #btnTreeNext' : {
                click:  me.btnTreeNext
            },
            'winMeshAddWizard #btnCloudPrev' : {
                click:  me.btnCloudPrev
            },
            'winMeshAddWizard #btnCloudNext' : {
                click:  me.btnCloudNext
            },
            'winMeshAddWizard #btnDataPrev' : {
                click:  me.btnDataPrev
            },
            'winMeshAddWizard #btnDataNext' : {
                click:  me.btnDataNext
            },

			//Known nodes
			'gridNodeLists #reload': {
                click:      me.gridNodeListsReload
            },
            'gridNodeLists #reload menuitem[group=refresh]'   : {
                click:      me.reloadNodeListsOptionClick
            }, 
			'gridNodeLists #add': {
                click:  me.addNode
            }, 
            'gridNodeLists #delete': {
                click: me.delNode
            },
            'gridNodeLists #edit': {
                click:  me.editNode
            },  
            'gridNodeLists #restart': {
                click:  me.restartNode
            },
            'gridNodeLists #xwf_filter': {
                change : me.xwfFilterToggleNode
            },
            'gridNodeLists actioncolumn' : {
                 itemClick  : me.onNodeListsActionColumnItemClick
            },            
			'#tabMeshes gridUnknownNodes #reload': {
                click:      me.gridUnknownNodesReload
            },
            '#tabMeshes gridUnknownNodes #reload menuitem[group=refresh]'   : {
                click:      me.reloadUnknownNodesOptionClick
            },
			'#tabMeshes gridUnknownNodes #attach': {
                click:  me.attachNode
            },
			'#tabMeshes gridUnknownNodes #delete': {
                click: me.delUnknownNode
            },
            '#tabMeshes gridUnknownNodes #redirect' : {
                click: me.redirectNode
            },
            '#tabMeshes gridUnknownNodes actioncolumn' : {
                 itemClick  : me.onUnknownActionColumnItemClick
            }, 
                      
            'winMeshUnknownRedirect #save' : {
				click: me.btnRedirectNodeSave
			},
			'#tabMeshes gridUnknownNodes #change_device_mode' : {
                click: me.changeDeviceMode
            },
            'winMeshUnknownModeChange #save' : {
				click: me.btnChangeDeviceModeSave
			},
			'pnlMeshView #editMesh' : {
			    click: me.btnEditMeshClicked
			},
			'pnlMeshEdit #viewMesh' : {
			    click: me.btnViewMeshClicked
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
        
        if(me.autoReloadNodeLists != undefined){
            clearInterval(me.autoReloadNodeLists);   //Always clear
        }
        
        if(me.autoReloadUnknownNodes != undefined){
            clearInterval(me.autoReloadUnknownNodes);   //Always clear
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
    add: function(button){
        
        var me = this;
        //We need to do a check to determine if this user (be it admin or acess provider has the ability to add to children)
        //admin/root will always have, an AP must be checked if it is the parent to some sub-providers. If not we will 
        //simply show the nas connection typer selection 
        //if it does have, we will show the tree to select an access provider.
        Ext.Ajax.request({
            url: me.getUrlApChildCheck(),
            method: 'GET',
            success: function(response){
                var jsonData    = Ext.JSON.decode(response.responseText);
                if(jsonData.success){
                        
                    if(jsonData.items.tree == true){
                        if(!Ext.WindowManager.get('winMeshAddWizardId')){
                            var w = Ext.widget('winMeshAddWizard',{id:'winMeshAddWizardId',enable_grouping: jsonData.items.enable_grouping});
                            w.show();         
                        }
                    }else{
                        if(!Ext.WindowManager.get('winMeshAddWizardId')){
                            var w = Ext.widget('winMeshAddWizard',
                                {
                                    id          :'winMeshAddWizardId',
                                    startScreen : 'scrnData',
                                    user_id     :'0',
                                    owner       : i18n('sLogged_in_user'),
                                    no_tree     : true,
                                    enable_grouping: jsonData.items.enable_grouping
                                }
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
            var win = button.up('winMeshAddWizard');
            var owner = "<div class=\"fieldGrey\"><b>"+sr.get('username')+"</b></div>"
            win.down('#owner').setValue(owner);
            win.down('#user_id').setValue(sr.getId());
            if(win.enable_grouping){
                win.getLayout().setActiveItem('scrnClouds');
            }else{
                win.getLayout().setActiveItem('scrnData');
            }
        }else{
            Ext.ux.Toaster.msg(
                        i18n('sSelect_an_owner'),
                        i18n('sFirst_select_an_Access_Provider_who_will_be_the_owner'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }
    },
    btnCloudNext: function(button){
        var me      = this;
        var win     = button.up('winMeshAddWizard');  
        var tree    = button.up('treepanel');
        //Get selection:
        var sr = tree.getSelectionModel().getLastSelected();
        var tree_level = sr.get('tree_level');
        if(sr){  
            var tree_level = sr.get('tree_level');
            if(tree_level == 'Networks'){
                var network_string = sr.getPath('name', ">");
                network_string     = network_string.replace(">Grouping>", "");
                network_string     = "<div class=\"fieldBlue\"><b>"+network_string+"</b></div>";
                win.down('#network_string').setValue(network_string);
                win.down('#network_id').setValue(sr.getId());
                win.getLayout().setActiveItem('scrnData');
            }else{
                 Ext.ux.Toaster.msg(
                    'Select Network',
                    'Select A Network (Not Site or Cloud)',
                    Ext.ux.Constants.clsWarn,
                    Ext.ux.Constants.msgWarn
                );
            } 
        }else{
            Ext.ux.Toaster.msg(
                'Select an item',
                'Select a grouping end point',
                Ext.ux.Constants.clsWarn,
                Ext.ux.Constants.msgWarn
            );
        }
    },
    btnCloudPrev: function(button){
        var me      = this;
        var win     = button.up('winMeshAddWizard');
        win.getLayout().setActiveItem('scrnApTree');
    },   
    btnDataPrev:  function(button){
        var me      = this;
        var win     = button.up('winMeshAddWizard');
        if(win.enable_grouping){
            win.getLayout().setActiveItem('scrnClouds');
        }else{
            win.getLayout().setActiveItem('scrnApTree');
        }
    },
    btnDataNext:  function(button){
        var me      = this;
        var win     = button.up('window');
        var form    = win.down('form');
        var chkMultiple = win.down('#chkMultiple');
        form.submit({
            clientValidation: true,
            url: me.getUrlAdd(),
            success: function(form, action) {
                if(!chkMultiple.getValue()){
                    win.close();
                }
                me.reload();
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

        var edit = record.get('update');
        if (edit == true) {
            if (tb.down('#edit') != null) {
                tb.down('#edit').setDisabled(false);
            }
        } else {
            if (tb.down('#edit') != null) {
                tb.down('#edit').setDisabled(true);
            }
        }

        var del = record.get('delete');
        if (del == true) {
            if (tb.down('#delete') != null) {
                tb.down('#delete').setDisabled(false);
            }
        } else {
            if (tb.down('#delete') != null) {
                tb.down('#delete').setDisabled(true);
            }
        }

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
				me.application.runAction('cMeshViews','Index',id,name); 
            }
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
                var sr      = me.getGrid().getSelectionModel().getLastSelected();
                var id      = sr.getId();
                var name    = sr.get('name');  
				me.application.runAction('cMeshEdits','Index',id,name); 
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
    noteReload: function(button){
        var me      = this;
        var grid    = button.up('gridNote');
        grid.getStore().load();
    },
    noteAdd: function(button){
        var me      = this;
        var grid    = button.up('gridNote');

        //See how the wizard should be displayed:
        Ext.Ajax.request({
            url: me.getUrlApChildCheck(),
            method: 'GET',
            success: function(response){
                var jsonData    = Ext.JSON.decode(response.responseText);
                if(jsonData.success){                      
                    if(jsonData.items.tree == true){
                        if(!Ext.WindowManager.get('winNoteMeshesAdd'+grid.noteForId)){
                            var w   = Ext.widget('winNoteAdd',
                            {
                                id          : 'winNoteMeshesAdd'+grid.noteForId,
                                noteForId   : grid.noteForId,
                                noteForGrid : grid.noteForGrid,
                                refreshGrid : grid
                            });
                            w.show();       
                        }
                    }else{
                        if(!Ext.WindowManager.get('winNoteMeshesAdd'+grid.noteForId)){
                            var w   = Ext.widget('winNoteAdd',
                            {
                                id          : 'winNoteMeshesAdd'+grid.noteForId,
                                noteForId   : grid.noteForId,
                                noteForGrid : grid.noteForGrid,
                                refreshGrid : grid,
                                startScreen : 'scrnNote',
                                user_id     : '0',
                                owner       : i18n('sLogged_in_user'),
                                no_tree     : true
                            });
                            w.show()       
                        }
                    }
                }   
            },
            scope: me
        });
    },
    gridNoteClick: function(item,record){
        var me = this;
        //Dynamically update the top toolbar
        grid    = item.up('gridNote');
        tb      = grid.down('toolbar[dock=top]');
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
    btnNoteTreeNext: function(button){
        var me = this;
        var tree = button.up('treepanel');
        //Get selection:
        var sr = tree.getSelectionModel().getLastSelected();
        if(sr){    
            var win = button.up('winNoteAdd');
            win.down('#owner').setValue(sr.get('username'));
            win.down('#user_id').setValue(sr.getId());
            win.getLayout().setActiveItem('scrnNote');
        }else{
            Ext.ux.Toaster.msg(
                        i18n('sSelect_an_owner'),
                        i18n('sFirst_select_an_Access_Provider_who_will_be_the_owner'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }
    },
    btnNoteAddPrev: function(button){
        var me = this;
        var win = button.up('winNoteAdd');
        win.getLayout().setActiveItem('scrnApTree');
    },
    btnNoteAddNext: function(button){
        var me      = this;
        var win     = button.up('winNoteAdd');
        win.refreshGrid.getStore().load();
        var form    = win.down('form');
        form.submit({
            clientValidation: true,
            url: me.getUrlNoteAdd(),
            params: {for_id : win.noteForId},
            success: function(form, action) {
                win.close();
                win.refreshGrid.getStore().load();
                me.reload();
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
    },

	//___KownloadAdvancedWifiSettings nodes___
	gridNodeListsReload: function(button){
        var me  = this;
        var g = button.up('gridNodeLists');
        g.getStore().load();
    },
    reloadNodeListsOptionClick: function(menu_item){
        var me      = this;
        var n       = menu_item.getItemId();
        var b       = menu_item.up('button'); 
        var interval= 30000; //default
        clearInterval(me.autoReloadNodeLists);   //Always clear
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
        me.autoReloadNodeLists = setInterval(function(){        
            me.gridNodeListsReload(b);
        },  interval);  
    },
    addNode: function(button){
        var me      = this;     
        var tab     = button.up("#tabMeshes"); 
        var store   = tab.down("gridNodeLists").getStore();
        var id      = 0; // New Ap
        var name    = "New Node"; 
        me.application.runAction('cMeshNode','Index',id,{name:name,store:store});
    },
    delNode:   function(){
        var me      = this;
        var grid    = me.getGridNodeLists();
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
    editNode: function(){
    
        var me          = this;     
        var store       = me.getGridNodeLists().getStore();
		var selCount    = me.getGridNodeLists().getSelectionModel().getCount();
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
                    i18n('sSelect_one_only'),
                    i18n('sSelection_limited_to_one'),
                    Ext.ux.Constants.clsWarn,
                    Ext.ux.Constants.msgWarn
                );
            }else{
                var sr      = me.getGridNodeLists().getSelectionModel().getLastSelected();
                var id      = sr.getId();
                var name    = sr.get('name'); 
                var meshId  = sr.get('mesh_id');
			    var meshName= sr.get('mesh');
                me.application.runAction('cMeshNode','Index',id,{
                    name        : name,
                    meshId      : meshId,
					meshName	: meshName,
                    store       : store
                });
            }
        }   
    },
    restartNode: function(){
    
        var me          = this;     
        var store       = me.getGridNodeLists().getStore();
		var selCount    = me.getGridNodeLists().getSelectionModel().getCount();
		
		if(selCount == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        'First select an item to restart',
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            Ext.MessageBox.confirm(i18n('sConfirm'), i18n('sAre_you_sure_you_want_to_do_that_qm'), function(val){
                if(val== 'yes'){

                    var selected    = me.getGridNodeLists().getSelectionModel().getSelection();
                    var list        = [];
                    Ext.Array.forEach(selected,function(item){
                        var id = item.getId();
                        Ext.Array.push(list,{'id' : id});
                    });

                    Ext.Ajax.request({
                        url: me.getUrlRestartNodes(),
                        method: 'POST',          
                       // jsonData: {nodes: list, mesh_id: mesh_id},
                        jsonData: {nodes: list},
                        success: function(batch,options){
                            Ext.ux.Toaster.msg(
                                'Restart command queued',
                                'Command queued for execution',
                                Ext.ux.Constants.clsInfo,
                                Ext.ux.Constants.msgInfo
                            );
                            me.getGridNodeLists().getStore().reload();
                        },                                    
                        failure: function(batch,options){
                            Ext.ux.Toaster.msg(
                                'Problems restarting device',
                                batch.proxy.getReader().rawData.message.message,
                                Ext.ux.Constants.clsWarn,
                                Ext.ux.Constants.msgWarn
                            );
                            me.getGridNodeLists().getStore().reload();
                        }
                    });
                }
            });
        }
    },
    
    xwfFilterToggleNode: function(toggle){
        var me  = this;
        var val = toggle.getValue(); 
        me.getGridNodeLists().getStore().getProxy().setExtraParams({'xwf_filter':val});
        me.getGridNodeLists().getStore().load();   
    },
      
	gridUnknownNodesReload: function(button){
        var me  = this;
        var g = button.up('gridUnknownNodes');
        g.getStore().load();
    },
    reloadUnknownNodesOptionClick: function(menu_item){
        var me      = this;
        var n       = menu_item.getItemId();
        var b       = menu_item.up('button'); 
        var interval= 30000; //default
        clearInterval(me.autoReloadUnknownNodes);   //Always clear
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
        me.autoReloadUnknownNodes = setInterval(function(){        
            me.gridUnknownNodesReload(b);
        },  interval);  
    },

	//_______ Unknown Nodes ______
	attachNode: function(){
	    var me      = this;
        var store   = me.getGridUnknownNodes().getStore();
        if(me.getGridUnknownNodes().getSelectionModel().getCount() == 0){
            Ext.ux.Toaster.msg(
                i18n('sSelect_an_item'),
                i18n('sFirst_select_an_item'),
                Ext.ux.Constants.clsWarn,
                Ext.ux.Constants.msgWarn
            );  
        }else{
            var sr              = me.getGridUnknownNodes().getSelectionModel().getLastSelected();
            var id              = 0
			var mac		        = sr.get('mac');				
			me.application.runAction('cMeshNode','Index',id,{
			    name        : 'Attach Node',
			    id          : id,
			    mac			: mac,
				store       : store,
				record      : sr
		    });
        }
    },
	delUnknownNode:   function(){
        var me      = this;
        var grid    = me.getGridUnknownNodes();    
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
    
    //===MAPS START HERE===  
    mapLoadGoogleApi: function (key,callback) {
        var me = this;
        Ext.Loader.loadScript({
            url: 'https://www.google.com/jsapi',                    // URL of script
            scope: this,                   // scope of callbacks
            onLoad: function () {           // callback fn when script is loaded
                google.load("maps", "3", {
                    other_params: "key=" + key,
                    callback: function () {
                        // Google Maps are loaded. Place your code here
                        callback();
                    }
                });
            },
            onError: function () {          // callback fn if load fails 
                console.log("Error loading Google script");
            }
        });
    },
    mapGetPref  : function() {
        var me = this;
        Ext.ux.Toaster.msg(
            'Loading  Map API',
            'Please be patient....',
            Ext.ux.Constants.clsInfo,
            Ext.ux.Constants.msgInfo
        );    
        //We need to fetch the Preferences for this user's Google Maps API key
        Ext.Ajax.request({
            url     : me.getUrlMapPrefView(),
            method  : 'GET',
            success : function (response) {
                var jsonData = Ext.JSON.decode(response.responseText);
                if (jsonData.success) {
                  /*  if (jsonData.data.map_to_use == "google") {
                        me.mapLoadGoogleApi(jsonData.data.google_map_api_key, function () {
                            me.addMeshViewMapGoogle(jsonData);
                        })
                    }*/
                    me.addMeshViewMapLeaflet(jsonData);
                }
            },
            failure: function (batch, options) {
                Ext.ux.Toaster.msg(
                    'Problems getting the map preferences',
                    'Map preferences could not be fetched',
                    Ext.ux.Constants.clsWarn,
                    Ext.ux.Constants.msgWarn
                );
            },
            scope: me
        });
    },    
    addMeshViewMapGoogle : function(jsonData){ 
        var me  = this;
        var data= jsonData.data;
        var tp  = me.getTabMeshes();  
        var map_tab_id = 'mapTab'; 
        var new_tab = tp.down('#' + map_tab_id);
        if (new_tab) {
            tp.setActiveTab(map_tab_id); //Set focus on  Tab
            return;
        }    
        var map_tab_name = i18n("sGoogle_Maps"); 
        tp.add({
            title   : map_tab_name,
            itemId  : map_tab_id,
            closable: true,
            xtype   : 'pnlMeshViewMapGoogle',
            glyph   : Rd.config.icnMap,
            layout  : 'fit',
            center  : {
                lat     : data.lat,
                lng     : data.lng
            },
            mapOptions: {
                zoom        : data.zoom,
                mapTypeId   : google.maps.MapTypeId[data.type]                  
            }
        });
        tp.setActiveTab(map_tab_id);    
    },
    
    addMeshViewMapLeaflet : function(jsonData){
        var me  = this;
        var data= jsonData.data;
        var tp  = me.getTabMeshes();  
        var map_tab_id = 'mapTab'; 
        var new_tab = tp.down('#' + map_tab_id);
        if (new_tab) {
            tp.setActiveTab(map_tab_id); //Set focus on  Tab
            return;
        }    
        var map_tab_name = 'OpenStreetMap'; 
        tp.add({
            title   : map_tab_name,
            itemId  : map_tab_id,
            closable: true,
            xtype   : 'pnlMeshViewMapLeaflet',
            glyph   : Rd.config.icnMap,
            layout  : 'fit'
        });
        tp.setActiveTab(map_tab_id);
    },
    
    
    //===MAPS END HERE===
    
    //=== XWF filter ssarts here ===
    xwfFilterToggle: function(toggle){
        var me  = this;
        var val = toggle.getValue(); 
        me.getGrid().getStore().getProxy().setExtraParams({'xwf_filter':val});
        me.getGrid().getStore().load();
    },   
    //Redirecting
    redirectNode: function(){
        var me      = this;
        var store   = me.getGridUnknownNodes().getStore();
        if(me.getGridUnknownNodes().getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            var sr          = me.getGridUnknownNodes().getSelectionModel().getLastSelected();
            var id          = sr.getId();
            var new_server  = sr.get('new_server');
            var proto       = sr.get('new_server_protocol');
            if(!Ext.WindowManager.get('winMeshUnknownRedirectId')){
                var w = Ext.widget('winMeshUnknownRedirect',
                {
                    id              :'winMeshUnknownRedirectId',
                    unknownNodeId   : id,
					new_server	    : new_server,
					new_server_protocol : proto,
                    store           : store
                });
                w.show();         
            }
        }
    },
	btnRedirectNodeSave: function(button){
        var me      = this;
        var win     = button.up("winMeshUnknownRedirect");
        var form    = win.down('form');
        form.submit({
            clientValidation: true,
            url: me.getUrlRedirectNode(),
            success: function(form, action) {
                win.close();
                win.store.load();
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
    
    //Mode Change
    changeDeviceMode: function(button){
        var me      = this;
        var win     = button.up("#tabMeshes");
        var store   = win.down("gridUnknownNodes").getStore();
        if(win.down("gridUnknownNodes").getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            var sr          = win.down("gridUnknownNodes").getSelectionModel().getLastSelected();
            var id          = sr.getId();
            var new_mode    = sr.get('new_mode');
            if(!Ext.WindowManager.get('winMeshUnknownModeChangeId')){
                var w = Ext.widget('winMeshUnknownModeChange',
                {
                    id              :'winMeshUnknownModeChangeId',
                    unknownNodeId   : id,
					new_mode	    : new_mode,
                    store           : store
                });
                w.show();         
            }
        }
    },
	btnChangeDeviceModeSave: function(button){
        var me      = this;
        var win     = button.up("winMeshUnknownModeChange");
        var form    = win.down('form');
        form.submit({
            clientValidation: true,
            url: me.getUrlChangeDeviceMode(),
            success: function(form, action) {
                win.close();
                win.store.load();
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
        if(action == 'view'){
            me.view();
        }      
    },
    btnEditMeshClicked: function(b){
        var me = this;
        pnlMeshView = b.up('pnlMeshView');
        me.application.runAction('cMeshEdits','Index',pnlMeshView.mesh_id,pnlMeshView.getTitle());    
    },
    btnViewMeshClicked: function(b){
        var me = this;
        pnlMeshEdit = b.up('pnlMeshEdit');
        me.application.runAction('cMeshViews','Index',pnlMeshEdit.meshId,pnlMeshEdit.meshName);
    },
    onUnknownActionColumnItemClick: function(view, rowIndex, colIndex, item, e, record, row, action){
        //console.log("Action Item "+action+" Clicked");
        var me = this;
        var grid = view.up('grid');
        grid.setSelection(record);
        if(action == 'attach'){
            me.attachNode()
        }
        if(action == 'delete'){
            me.delUnknownNode();
        }
        if(action == 'redirect'){
            me.redirectNode();
        }      
    },
    onNodeListsActionColumnItemClick: function(view, rowIndex, colIndex, item, e, record, row, action){
        //console.log("Action Item "+action+" Clicked");
        var me = this;
        var grid = view.up('grid');
        grid.setSelection(record);
        if(action == 'update'){
            me.editNode()
        }
        if(action == 'delete'){
            me.delNode();
        }
        if(action == 'restart'){
            me.restartNode();
        }      
    }
});

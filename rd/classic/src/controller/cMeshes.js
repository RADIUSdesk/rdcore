Ext.define('Rd.controller.cMeshes', {
    extend: 'Ext.app.Controller',
    actionIndex: function(pnl){
        var me      = this;
        pnl.add({ 
            title   : 'Meshes', 
            xtype   : 'gridMeshes',
            border  : false,
            plain   : true,
            glyph   : Rd.config.icnMesh,
            padding : Rd.config.gridSlim,
            tabConfig   : {
                ui : 'tab-blue'
            }   
        });

        pnl.add({ 
            title   : 'Mesh Nodes', 	
            xtype   : 'gridNodeLists',	
            glyph   : Rd.config.icnNetwork,
            padding : Rd.config.gridSlim,
            tabConfig   : {
                ui : 'tab-orange'
            } 
        });    
    },
    views:  [
        'meshes.gridMeshes',        'meshes.winMeshAdd',
		'meshes.gridNodeLists',
        'meshes.cmbHardwareOptions', 'meshes.tagStaticEntries', 'meshes.cmbStaticExits',
        'meshes.pnlMeshViewMapGoogle',
        'meshes.pnlMeshViewMapLeaflet'  
    ],
    stores      : [
		'sMeshes',    'sNodeLists',
		'sMeshEntries', 'sMeshExits', 	'sMeshEntryPoints',
		'sClouds'
	],
    models : ['mMesh',  'mNodeList'],
    selectedRecord: null,
    config: {
        urlAdd          : '/cake4/rd_cake/meshes/add.json',
        urlDelete       : '/cake4/rd_cake/meshes/delete.json',
        urlMapPrefView  : '/cake4/rd_cake/meshes/map_pref_view.json',
        urlAddNode      : '/cake4/rd_cake/meshes/mesh_node_add.json',
        urlViewNode     : '/cake4/rd_cake/meshes/mesh_node_view.json',
        urlEditNode     : '/cake4/rd_cake/meshes/mesh_node_edit.json',
        urlRestartNodes : '/cake4/rd_cake/mesh-reports/restart_nodes.json',
        urlMeshAddNodeAction: '/cake4/rd_cake/node-actions/add.json',
        urlChangeDeviceMode: '/cake4/rd_cake/nodes/change_node_mode.json',
        urlAdvancedSettingsForModel: '/cake4/rd_cake/meshes/advanced_settings_for_model.json',
        urlConfig       : '/cake4/rd_cake/nodes/get-config-for-node.json',
        openWrtVersion  : '22.03',
        gateway         : true
    },
    refs: [
        {  ref: 'grid',             selector: 'gridMeshes'},
        {  ref: 'gridNodeLists',    selector: 'gridNodeLists'},
        {  ref: 'tabMeshes',        selector: '#tabMainNetworks'}
    ],
    init: function() {
        var me = this;
        if (me.inited) {
            return;
        }
        me.inited = true;

        me.control({
            '#tabMainNetworks' : {
                destroy   :      me.appClose   
            },
			'#tabMainNetworks gridMeshes' : {
				activate	: me.gridActivate
			},
			'#tabMainNetworks gridNodeLists' : {
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
            'gridMeshes #ban': {
                click: me.ban
            },
            'gridMeshes #xwf_filter': {
                change : me.xwfFilterToggle
            },
            'gridMeshes'   		: {
                select:      me.select,
                rowclick    : me.rowclick
            },
            'gridMeshes actioncolumn': { 
                 itemClick  : me.onActionColumnItemClick
            },
            'winMeshAdd #btnDataNext' : {
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
            'gridNodeLists #config': {
                click:  me.configNode
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
        var me 		= this;
        var c_name 	= Ext.getApplication().getCloudName();
        var c_id	= Ext.getApplication().getCloudId()
        if(!Ext.WindowManager.get('winMeshAddId')){
            var w = Ext.widget('winMeshAdd',{id:'winMeshAddId',cloudId: c_id, cloudName: c_name});
            w.show();         
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
				Ext.getApplication().runAction('cMeshViews','Index',id,name); 
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
                var tabPanel= me.getGrid().up('tabpanel')
				Ext.getApplication().runAction('cMeshEdits','Index',tabPanel,{name:name,id:id}); 
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
        var tab     = me.getTabMeshes();  
        var store   = tab.down("gridNodeLists").getStore();
        var id      = 0; // New Ap
        var name    = "New Node"; 
        Ext.getApplication().runAction('cMeshNode','Index',id,{name:name,store:store});
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
                Ext.getApplication().runAction('cMeshNode','Index',id,{
                    name        : name,
                    meshId      : meshId,
					meshName	: meshName,
                    store       : store
                });
            }
        }   
    },
    configNode: function(){
    
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
                me.getConfig(sr);              
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
        var tp  = me.getTabMehses();  
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
    
    ban	: function(b){
    	var me 			= this;
    	var tabPanel 	= me.getGrid().up('tabpanel')
		Ext.getApplication().runAction('cBans','Index',tabPanel,{});
	},
	
	getConfig: function(record){	
	    var me = this;
	    window.open(me.getUrlConfig()+"?mac="+record.get('mac')+'&version='+me.getOpenWrtVersion()+'&gateway='+me.getGateway()+'&sample=true');
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
        Ext.getApplication().runAction('cMeshEdits','Index',pnlMeshView,{name:pnlMeshView.getTitle(),id:pnlMeshView.mesh_id});   
    },
    btnViewMeshClicked: function(b){
        var me = this;
        pnlMeshEdit = b.up('pnlMeshEdit');
        Ext.getApplication().runAction('cMeshViews','Index',pnlMeshEdit.meshId,pnlMeshEdit.meshName);
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
        if(action == 'config'){
            me.getConfig(record);
        }       
    }
});

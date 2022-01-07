Ext.define('Rd.controller.cMeshViews', {
    extend: 'Ext.app.Controller',
    views:  [
        'meshes.pnlMeshView',
        'meshes.pnlMeshViewEntries',
        'meshes.pnlMeshViewNode',	
	    'meshes.pnlMeshViewNodes',	'meshes.gridMeshViewNodeNodes',
		'meshes.gridMeshViewNodeDetails',						'meshes.pnlMeshViewGMap',
		'meshes.gridMeshViewNodeActions',						'meshes.winMeshAddNodeAction',
		'meshes.pnlMeshViewLeafletMap'
    ],
    stores      : [	
		'sMeshViewEntries', 'sMeshViewNodeNodes', 'sMeshViewNodes', 'sNodeDetails'
    ],
    models      : [

    ],
    config      : {  
        urlApChildCheck				: '/cake3/rd_cake/access-providers/child-check.json',
		urlMapPrefView				: '/cake3/rd_cake/meshes/map_pref_view.json',
		urlOverviewGoogleMap		: '/cake3/rd_cake/mesh-reports/overview_google_map.json',
		urlOverview                 : '/cake3/rd_cake/mesh-reports/overview.json',
		urlRestartNodes				: '/cake3/rd_cake/mesh-reports/restart_nodes.json',
		urlMeshAddNodeAction		: '/cake3/rd_cake/node-actions/add.json',
		urlBlueMark 				: 'resources/images/map_markers/mesh_blue_node.png',
		urlRedNode 					: 'resources/images/map_markers/mesh_red_node.png',
		urlRedGw 					: 'resources/images/map_markers/mesh_red_gw.png',
		urlGreenNode 				: 'resources/images/map_markers/mesh_green_node.png',
		urlGreenGw	 				: 'resources/images/map_markers/mesh_green_gw.png', //Now also supporting phones!
		urlPhoneGreenGw				: 'resources/images/map_markers/phone_green_gw.png',
		urlPhoneGreenNode			: 'resources/images/map_markers/phone_green.png',
		urlPhoneRedGw				: 'resources/images/map_markers/phone_red_gw.png',
		urlPhoneRedNode			    : 'resources/images/map_markers/phone_red.png',
		urlPhoneBlueGw				: 'resources/images/map_markers/phone_blue_gw.png',
		urlPhoneBlueNode			: 'resources/images/map_markers/phone_blue.png'
    },
    refs: [
        {  ref: 'tabMeshes',        selector: '#tabMeshes'     }    
    ],
    init: function() {
        var me = this;
        if (me.inited) {
            return;
        }
        me.inited = true;

        me.control({
			//==== MESHdesk View related ====
			'pnlMeshView #tabMeshViewNodeNodes': {
                activate:       me.tabMeshViewNodeNodesActivate
            },
			'pnlMeshView #tabMeshViewNodeDetails': {
                activate:       me.tabMeshViewNodeDetailsActivate
            },
            'pnlMeshView gridMeshViewNodes #reload menuitem[group=refresh]'   : {
                click:      function(menu){
                    me.autoRefresh(menu,'nodes');
                }
            },
			'pnlMeshView gridMeshViewNodeNodes #reload menuitem[group=refresh]'   : {
                click:      function(menu){
                    me.autoRefresh(menu,'node_nodes');
                }
            }, 
            'pnlMeshView': {
                beforeshow:      me.winViewClose,
                destroy   :      me.winViewClose
            },
			'pnlMeshView pnlMeshViewNodes':	{
				activate:		function(pnl){
					pnl.getData()
				}
			},
			'#pnlMapsNodeInfo #restart': {
				click:	me.mapRestart
			},
			'pnlMeshView pnlMeshViewNodes #reload':	{
				click:		function(button){
					var me 	= this;
					var pnl = button.up("pnlMeshViewNodes");
					pnl.getData()
				}
			},
			'pnlMeshView gridMeshViewNodeNodes #reload':	{
				click: me.reloadViewNodeNodes
			},
			'pnlMeshView gridMeshViewNodeNodes button' : {
                toggle: me.viewNodeNodesTimeToggle
            },
			'gridMeshViewNodeDetails #map' : {
                click: 	me.mapLoadApi
            },
			'pnlMeshView #mapTab'		: {
				activate: function(pnl){
					me.reloadMap(pnl);
				}
			},
			'pnlMeshViewGMap #reload'	: {
				click:	function(b){
					var me = this;
					me.reloadMap(b.up('pnlMeshViewGMap'));
				}
			},
			'pnlMeshView gridMeshViewNodeDetails #reload' : {
				click	: me.reloadViewNodeDetails
			},
			'pnlMeshView gridMeshViewNodeDetails #execute' : {
				click	: me.execute
			},
			'pnlMeshView gridMeshViewNodeDetails #history' : {
				click	: me.history
			},
			'pnlMeshView gridMeshViewNodeDetails #restart' : {
				click	: me.restart
			},
			'pnlMeshView gridMeshViewNodeDetails #rogue_detect' : {
				click	: me.rogueDetect
			},
			'winMeshAddNodeAction #save' : {
				click	: me.commitExecute
			},
			'pnlMeshView gridMeshViewNodeActions #reload' : {
				click	: me.reloadNodeActions
			},
			'pnlMeshView gridMeshViewNodeActions #add' : {
				click	: me.addNodeActions
			},
			'pnlMeshView gridMeshViewNodeActions #delete' : {
				click	: me.deleteNodeActions
			},
			'pnlMeshView gridMeshViewNodeActions' : {
				activate: me.activateNodeActions
			}
        });
    },
    actionIndex: function(mesh_id,name){
        var me          = this;
        var id		    = 'tabMeshView'+ mesh_id;
        var tabMeshes   = me.getTabMeshes();
        var newTab      = tabMeshes.items.findBy(
            function (tab){
                return tab.getItemId() === id;
            });
         
        if (!newTab){
            newTab = tabMeshes.add({
                glyph   : Rd.config.icnView, 
                title   : name,
                closable: true,
                layout  : 'fit',
                xtype   : 'pnlMeshView',
                itemId  : id,
                mesh_id : mesh_id,
                meshId  : mesh_id
            });
        }    
        tabMeshes.setActiveTab(newTab);     
    },
    actionOverviewIndex: function(mesh_id,name){
        var me          = this;
        var id		    = 'tabMeshView'+ mesh_id;
        var tpOverview  = Ext.first('#tpOverview');
        var newTab      = tpOverview.items.findBy(
            function (tab){
                return tab.getItemId() === id;
            });   
        if (!newTab){
            newTab = tpOverview.add({
                glyph   : Rd.config.icnView, 
                title   : name,
                closable: true,
                layout  : 'fit',
                xtype   : 'pnlMeshView',
                itemId  : id,
                mesh_id : mesh_id,
                meshId  : mesh_id,
                showEdit: false
            });
        }    
        tpOverview.setActiveTab(newTab);    
    },
	viewNodeNodesTimeToggle: function(button,pressed){
        var me = this;
        if(pressed){
            me.reloadViewNodeNodes(button);  
        }
    },
	reloadViewNodeNodes: function(button){
        var me      = this;
        var tab     = button.up("pnlMeshView");
        var entGrid = tab.down("gridMeshViewNodeNodes");
        var day     = entGrid.down('#day');
        var week    = entGrid.down('#week');
        var span    = 'hour';
        if(day.pressed){
            span='day';
        }
        if(week.pressed){
            span='week';
        }
        entGrid.getStore().getProxy().setExtraParam('timespan',span);
        entGrid.getStore().reload();
    },
	tabMeshViewNodeNodesActivate: function(tab){
        var me = this;
        var b = tab.down('#reload');
        me.reloadViewNodeNodes(b);
    },
	tabMeshViewNodeDetailsActivate: function(tab){
        var me = this;
        var b = tab.down('#reload');
        me.reloadViewNodeDetails(b);
    },
    autoRefresh: function(menu_item,item){
        var me      = this;
        var n       = menu_item.getItemId();
        var b       = menu_item.up('button'); 
        var interval= 30000; //default
        clearInterval(me.autoRefresInterval);   //Always clear
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
        me.autoRefresInterval = setInterval(function(){ 
			 if(item == 'node_nodes'){
                me.reloadViewNodeNodes(b);
            }  
      
        },  interval);  

    },
    winViewClose:   function(){
        var me = this;
        if(me.autoRefresInterval != undefined){
            clearInterval(me.autoRefresInterval);   //Always clear
        }
    },
    getOverviewData: function (callBack) {
        var me = this
        // me.setLoading(true);
        var tab = tp = me.getTabMeshes().down("pnlMeshView")
        var grid = tab.down('gridMeshViewNodeDetails');
        var mesh_id = grid.meshId;
        
        Ext.Ajax.request({
            url: me.config.urlOverview,
            method: 'GET',
            params: {
                mesh_id: mesh_id
            },
            success: function (response) {
                var jsonData = Ext.JSON.decode(response.responseText);
                if (jsonData.success) {
                    callBack(jsonData);
                }
            },
            scope: me
        });
    },
	//____ MAP ____
	
	
	
    mapLoadGoogleApi: function (key, callback) {
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
    mapLoadBaiduApi: function (key, callback) {
        var me = this;
        Ext.Loader.loadScript({
            url: 'http://api.map.baidu.com/getscript?v=2.0&ak=' + key + '&services=&t=20170703123905',                    // URL of script
            scope: this,                   // scope of callbacks
            onLoad: function (result) {           // callback fn when script is loaded
                callback();
            },
            onError: function (result) {          // callback fn if load fails 
                console.log("Error loading Google script");
            }
        });
    },
    
    mapLoadApi: function (button) {
        var me = this;
        Ext.ux.Toaster.msg(
            'Loading Map API',
            'Please be patient....',
            Ext.ux.Constants.clsInfo,
            Ext.ux.Constants.msgInfo
        );
        
        var tp          = button.up('tabpanel');
        var mesh_id		= tp.meshId;

        me.mapGetPref(mesh_id, function (data) {
            me.prefData = data;
            //FIXME LATER FIX THE SETTINGS FOR MAP TO USE
            me.mapCreateLeafletPanel(button, me.prefData);
            /*   
            if (data.map_to_use == "google") {
                me.mapLoadGoogleApi(me.prefData.google_map_api_key, function () {   
                    console.log("Google Maps Loaded Callback");
                    me.mapCreateGMPanel(button, me.prefData);
                })
            }

            if (data.map_to_use == "baidu") {
                me.mapLoadBaiduApi(me.prefData.baidu_map_api_key, function () {
                   //// me.mapCreatBaiduPanel(button, me.meshID, me.prefData);
                })
            }
            */
        })

    },   
    mapGetPref: function (mesh_id,callback) {
        var me = this;
        //We need to fetch the Preferences for this user's Google Maps map
        Ext.Ajax.request({
            url: me.getUrlMapPrefView(),
            method: 'GET',
            params: {
                mesh_id: mesh_id
            },
            success: function (response) {
                var jsonData = Ext.JSON.decode(response.responseText);
                if (jsonData.success) {
                    callback(jsonData.data);
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
    
    mapCreateLeafletPanel: function(button,data){
        var me          = this
        var tp          = button.up('tabpanel');
        var map_tab_id  = 'OpenStreetMapTab';
        var nt          = tp.down('#'+map_tab_id);
        if(nt){
            tp.setActiveTab(map_tab_id); //Set focus on  Tab
            return;
        }
        var map_tab_name    = 'OpenStreetMap';
		var tabEdit 		= tp.up('pnlMeshEdit');
		var mesh_id		    = tp.meshId;
		tp.add({ 
            title 		: map_tab_name,
            itemId		: map_tab_id,
            closable	: true,
            glyph		: Rd.config.icnMap, 
            layout		: 'fit',
            meshId		: mesh_id,
            xtype       : 'pnlMeshViewLeafletMap',
            metaData    : data
        });
        tp.setActiveTab(map_tab_id); //Set focus on Add Tab      
    }, 
      
    mapCreateGMPanel: function(button,data){
        var me = this
        var tp;
        if (button == undefined) {
            tp = me.getTabMeshes().down("pnlMeshView");
        } else {
            tp = button.up('tabpanel');
        }
        var pnl = tp.up('pnlMeshView');
        var mesh_id = tp.mesh_id;


        var map_tab_id = 'mapTab';
        var nt = tp.down('#' + map_tab_id);
        if (nt) {
            // tp.setActiveTab(map_tab_id); //Set focus on  Tab
            // return;
        }
        var map_tab_name = i18n("sGoogle_Maps");
        if (button == undefined) {
            map_tab_name = i18n("sOverview");
        }

        tp.insert(0, {
            title       : map_tab_name,
            itemId      : map_tab_id,
            closable    : true,
            glyph       : Rd.config.icnMap,
            layout      : 'fit',
            xtype       : 'pnlMeshViewGMap',
            mapOptions  : { zoom: data.zoom, mapTypeId: google.maps.MapTypeId[data.type] },	//Required for map
            centerLatLng: { lat: data.lat, lng: data.lng },										//Required for map
            markers     : [],
            polyLines   : [],
            meshId      : mesh_id
        });
        tp.setActiveTab(map_tab_id); //Set focus on Add Tab
        //me.reloadMap(tp.down("pnlMeshViewGMap"));
    },
	
    mapCreatePanel: function (button, mappref) {
        var me = this
        var tp;
        if (button == undefined) {
            tp = me.getTabMeshes().down("pnlMeshView");
        } else {
            tp = button.up('tabpanel');
        }
        var pnl = tp.up('pnlMeshView');
        var mesh_id = tp.mesh_id;


        var map_tab_id = 'mapTab';
        var nt = tp.down('#' + map_tab_id);
        if (nt) {
            // tp.setActiveTab(map_tab_id); //Set focus on  Tab
            // return;
        }
        var map_tab_name = i18n("sGoogle_Maps");
        if (button == undefined) {
            map_tab_name = i18n("sOverview");
        }

        tp.insert(0, {
            title: map_tab_name,
            itemId: map_tab_id,
            closable: true,
            glyph: Rd.config.icnMap,
            layout: 'fit',
            xtype: 'pnlMeshViewGMap',
            mapOptions: { zoom: mappref.zoom, mapTypeId: google.maps.MapTypeId[mappref.type] },	//Required for map
            centerLatLng: { lat: jsonData.data.lat, lng: jsonData.data.lng },										//Required for map
            markers: [],
            polyLines: [],
            meshId: mesh_id
        });
        tp.setActiveTab(map_tab_id); //Set focus on Add Tab
        me.reloadMap(tp.down("pnlMeshViewGMap"));

        //____________________________________________________   

    },
    findNodeByID: function (nodes, id) {
        var returnNode = {};
        Ext.Array.forEach(nodes, function (node) {
            if (node.id == id) {
                returnNode = node;
            }
        })
        return returnNode;
    },
	reloadMap: function (map_panel) {
        var me = this;
        map_panel.setLoading(true);
        map_panel.clearMarkers();
        map_panel.clearPolyLines();
        var mesh_id = map_panel.meshId;
        var bounds = new google.maps.LatLngBounds();

        Ext.Ajax.request({
            url: me.getUrlOverviewGoogleMap(),
            method: 'GET',
            params: {
                mesh_id: mesh_id
            },
            success: function (response) {
                var jsonData = Ext.JSON.decode(response.responseText);
                if (jsonData.success) {
                    var bounds_changed = false;
                    Ext.each(jsonData.items, function (i) {
                        if(i.lat !== null){ //Only if it has a value
                            var icon = me.getUrlBlueMark();
                            bounds.extend(new google.maps.LatLng(i.lat, i.lng))
                            bounds_changed = true;
                            //Phones
                            var phone_flag = false;
                            if ((i.hardware == 'mp2_basic') || (i.hardware == 'mp2_phone')) {
                                phone_flag = true;
                            }

                            if (phone_flag) {
                                icon = me.getUrlPhoneBlueNode();
                            }

                            if (i.state == 'down') {
                                if (phone_flag) {
                                    icon = me.getUrlPhoneRedNode();
                                } else {
                                    icon = me.getUrlRedNode()
                                }
                            }

                            if ((i.state == 'down') & (i.gateway == 'yes')) {
                                if (phone_flag) {
                                    icon = me.getUrlPhoneRedGw();
                                } else {
                                    icon = me.getUrlRedGw()
                                }
                            }

                            if (i.state == 'up') {
                                if (phone_flag) {
                                    icon = me.getUrlPhoneGreenNode();
                                } else {
                                    icon = me.getUrlGreenNode()
                                }
                            }

                            if ((i.state == 'up') & (i.gateway == 'yes')) {
                                if (phone_flag) {
                                    icon = me.getUrlPhoneGreenGw();
                                } else {
                                    icon = me.getUrlGreenGw()
                                }
                            }

                            var sel_marker = map_panel.addMarker({
                                lat: i.lat,
                                lng: i.lng,
                                icon: icon,
                                title: i.name,
                                listeners: {
                                    click: function (e, f) {
                                        //console.log(record);
                                        me.markerClick(i, map_panel, sel_marker);
                                    }
                                }
                            })
                        }
                    });
                    //Add the poly lines
                    Ext.each(jsonData.connections, function (c) {
                        var pl = map_panel.addPolyLine(c);
                    });
                    map_panel.setLoading(false);
					if(bounds_changed == true){
                        map_panel.gmap.fitBounds(bounds);
                    }
                }
            },
            scope: me
        });
    },
	reloadViewNodeDetails: function(button){
        var me      = this;
        var tab     = button.up("pnlMeshView");
        var grid    = tab.down("gridMeshViewNodeDetails"); 
        grid.getStore().reload();
    },
	markerClick: function(item,map_panel,sel_marker){
    	var me = this;
        map_panel.marker_data = item;
        map_panel.infowindow.open(map_panel.gmap,sel_marker); 
    },
	execute:   function(button){
        var me      = this; 
		var tab		= button.up('pnlMeshView')
		var grid	= tab.down('gridMeshViewNodeDetails');
		var mesh_id = grid.meshId;   
        //Find out if there was something selected
        if(grid.getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        'Select an item on which to execute the command',
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
        	//console.log("Show window for command content")
        	if(!Ext.WindowManager.get('winMeshAddNodeActionId')){
                var w = Ext.widget('winMeshAddNodeAction',{id:'winMeshAddNodeActionId',grid : grid});
                w.show();         
            }
        }
    },
	commitExecute:  function(button){
        var me      = this;
        var win     = button.up('winMeshAddNodeAction');
        var form    = win.down('form');

		var selected    = win.grid.getSelectionModel().getSelection();
		var list        = [];
        Ext.Array.forEach(selected,function(item){
            var id = item.getId();
            Ext.Array.push(list,{'id' : id});
        });

        form.submit({
            clientValidation	: true,
            url					: me.getUrlMeshAddNodeAction(),
			params				: list,
            success: function(form, action) {       
                win.grid.getStore().reload();
				win.close();
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
	history:   function(button){

		var me 			= this
		var tab			= button.up('pnlMeshView');
        var tp          = button.up('tabpanel');
		var grid		= tab.down('gridMeshViewNodeDetails');
  
        //Find out if there was something selected
        if(grid.getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        'Select an item to view the history',
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
			var selected    	= grid.getSelectionModel().getSelection();
            Ext.Array.forEach(selected,function(item){
                var id 			= item.getId();
				var n			= item.get('name');
				var h_tab_id    = 'hTab_'+id;
				var h_tab_name  = 'History for '+n;
				var nt          = tp.down('#'+h_tab_id);
				if(nt){
				    tp.setActiveTab(h_tab_id); //Set focus on  Tab
				}else{
					tp.add({ 
                        title 		: h_tab_name,
                        itemId		: h_tab_id,
                        closable	: true,
                        glyph		: Rd.config.icnWatch, 
                        layout		: 'fit', 
         				xtype		: 'gridMeshViewNodeActions',
						nodeId		: id
                    });
                    tp.setActiveTab(h_tab_id); //Set focus on Add Tab
				}

            });
        }
    },
	restart:   function(button){
        var me      = this; 
		var tab		= button.up('pnlMeshView');
		var grid	= tab.down('gridMeshViewNodeDetails');
		var mesh_id = grid.meshId;
    
        //Find out if there was something selected
        if(grid.getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        'First select an item to restart',
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            Ext.MessageBox.confirm(i18n('sConfirm'), i18n('sAre_you_sure_you_want_to_do_that_qm'), function(val){
                if(val== 'yes'){

                    var selected    = grid.getSelectionModel().getSelection();
                    var list        = [];
                    Ext.Array.forEach(selected,function(item){
                        var id = item.getId();
                        Ext.Array.push(list,{'id' : id});
                    });

                    Ext.Ajax.request({
                        url: me.getUrlRestartNodes(),
                        method: 'POST',          
                        jsonData: {nodes: list, mesh_id: mesh_id},
                        success: function(batch,options){
                            Ext.ux.Toaster.msg(
                                'Restart command queued',
                                'Command queued for execution',
                                Ext.ux.Constants.clsInfo,
                                Ext.ux.Constants.msgInfo
                            );
                            grid.getStore().reload();
                        },                                    
                        failure: function(batch,options){
                            Ext.ux.Toaster.msg(
                                'Problems restarting device',
                                batch.proxy.getReader().rawData.message.message,
                                Ext.ux.Constants.clsWarn,
                                Ext.ux.Constants.msgWarn
                            );
                            grid.getStore().reload();
                        }
                    });
                }
            });
        }
    },
    rogueDetect:   function(button){ 
        var me      = this;
        var pnl     = button.up("pnlMeshView");
        var store   = pnl.down("gridMeshViewNodeDetails").getStore();
        if(pnl.down("gridMeshViewNodeDetails").getSelectionModel().getCount() == 0){
            Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );          
        }else{
            var sr      = pnl.down("gridMeshViewNodeDetails").getSelectionModel().getLastSelected();
            var id      = sr.getId();
            var name    = sr.get('name'); 
			var meshId  = sr.get('mesh_id');
			var mesh    = sr.get('mesh');
            me.application.runAction('cMeshNodeRogue','Index',id,{name:name,meshId:meshId,meshName:mesh,store:store});
        }
    },
	mapRestart: function(b){
		var me 		= this;
		var pnl		= b.up('#pnlMapsNodeInfo');
		var node_id	= pnl.nodeId;
		var mesh_id = pnl.meshId;
		Ext.Ajax.request({
            url: me.getUrlRestartNodes(),
            method: 'POST',          
            jsonData: {nodes: [{'id': node_id}], mesh_id: mesh_id},
            success: function(batch,options){
                Ext.ux.Toaster.msg(
                    'Restart command queued',
                    'Command queued for execution',
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },                                    
            failure: function(batch,options){
                Ext.ux.Toaster.msg(
                    'Problems restarting device',
                    batch.proxy.getReader().rawData.message.message,
                    Ext.ux.Constants.clsWarn,
                    Ext.ux.Constants.msgWarn
                );
            }
        });
	},
	activateNodeActions: function(grid){
		var me = this;
		grid.getStore().reload();
	},
	reloadNodeActions: function(b){
		var me 		= this;
		var grid 	= b.up('gridMeshViewNodeActions');
		grid.getStore().reload();

	},
	addNodeActions: function(b){
		var me 		= this;
		var grid 	= b.up('gridMeshViewNodeActions');
		var nodeId	= grid.nodeId;

        if(!Ext.WindowManager.get('winMeshAddNodeAction_'+nodeId)){
            var w = Ext.widget('winMeshAddNodeAction',{id:'winMeshAddNodeAction_'+nodeId,grid : grid,nodeId: nodeId});
            w.show();       
        }
	},
	deleteNodeActions:   function(b){
        var me 		= this;
		var grid 	= b.up('gridMeshViewNodeActions');
		var nodeId	= grid.nodeId;
   
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
    }

});

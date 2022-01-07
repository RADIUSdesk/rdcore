Ext.define('Rd.view.meshes.vcMeshViewMapGoogle', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcMeshViewMapGoogle',
    config : {
        urlOverviewGoogleMap    : '/cake3/rd_cake/mesh-reports/overview_google_map.json',
        urlOverviewMeshes       : '/cake3/rd_cake/mesh-reports/overview_meshes.json',
        urlBlueMark             : 'resources/images/map_markers/mesh_blue_node.png',
        urlRedNode              : 'resources/images/map_markers/mesh_red_node.png',
        urlRedGw                : 'resources/images/map_markers/mesh_red_gw.png',
        urlGreenNode            : 'resources/images/map_markers/mesh_green_node.png',
        urlGreenGw              : 'resources/images/map_markers/mesh_green_gw.png',
        overview                : true
    },
    init: function() {
        var me = this;
        
    },
    onBtnReload : function(btn){
        var me  = this;
        console.log("Reload Button Pressed");
        if(me.getOverview()){
            me.loadMapOverview();
        } 
    },
    clearMarkers: function(){
        var me = this;
        if(me.getView().markers != undefined){
            while(me.getView().markers[0]){
                me.getView().markers.pop().setMap(null);
            }
        }
    },
    clearPolyLines: function(){
		var me = this;
		if(me.getView().polyLines != undefined){
		    while(me.getView().polyLines[0]){
                me.getView().polyLines.pop().setMap(null);
            }
        }
	},
	loadMapOverview : function () {
        var me = this; 
        me.getView().setLoading(true);
        me.clearMarkers(); 
        me.clearPolyLines();
        var bounds = new google.maps.LatLngBounds(); 
        var mesh_id = '';  
        Ext.Ajax.request({
            url: me.getUrlOverviewMeshes(),
            method: 'GET',
            params: {
                mesh_id: mesh_id
            },
            success: function (response) {
                var jsonData = Ext.JSON.decode(response.responseText);
                if (jsonData.success){                
                    Ext.each(jsonData.meshes, function (i) {
                        var icon = me.getUrlBlueMark();
                        bounds.extend(new google.maps.LatLng(i.center.lat, i.center.lng))
                        var sel_marker = me.getView().addMarker({
                            lat     : i.center.lat,
                            lng     : i.center.lng,
                            icon    : icon,
                            title   : i.name,
                            listeners: {
                                click: function (e,f){
                                    me.loadMeshDetail(i.meshID);
                                }
                            }
                        })
                    });
                    me.getView().gmap.fitBounds(bounds);
                    me.getView().setLoading(false);
                }
            },
            scope: me
        });
    },
    loadMeshDetail: function (mesh_id){
        var me = this;
        me.lookupReference('btnOverview').setHidden(false);      
        me.getView().setLoading(true);
        me.clearMarkers(); 
        me.clearPolyLines();
        var bounds = new google.maps.LatLngBounds();       
        Ext.Ajax.request({
            url     : me.getUrlOverviewGoogleMap(),
            method  : 'GET',
            params  : {
                mesh_id: mesh_id
            },
            success: function (response) {
                var jsonData = Ext.JSON.decode(response.responseText);
                if (jsonData.success) {
                    var bounds_changed = false;
                    Ext.each(jsonData.items, function (i) {
                        if(i.lat !== null){ //Only if it has a value
                            bounds.extend(new google.maps.LatLng(i.lat, i.lng))
                            bounds_changed = true;
                      
                            var icon = me.getUrlBlueMark();  //Default

                            if (i.state == 'down') {    
                                 icon = me.getUrlRedNode()
                            }

                            if ((i.state == 'down') & (i.gateway == 'yes')) {                            
                                icon = me.getUrlRedGw();
                            }

                            if (i.state == 'up') {                         
                                icon = me.getUrlGreenNode();
                            }

                            if ((i.state == 'up') & (i.gateway == 'yes')) {
                                icon = me.getUrlGreenGw()
                            }
                            
                            //Create in info window PER marker
                            var i_div 		=  document.createElement('div');
                            i_div.className = i_div.className + "mapInfoDiv";
                            var infowindow = new google.maps.InfoWindow({
                                content: i_div
                            });
                            infowindow.filled = false;
                            
                            google.maps.event.addListener(infowindow, 'domready', function(){
                                if(infowindow.filled == false){                                
                                    var tpl = new Ext.Template([
                                       "<div class='divMapAction'>",
                                            "<label class='lblMap'>"+ i18n("sName")+"  </label><label class='lblValue'>{name}</label>",
					                        "<div style='clear:both;'></div>",
					                        "<label class='lblMap'>MAC </label><label class='lblValue'> {mac}</label>",
					                        "<div style='clear:both;'></div>",
                                            "<label class='lblMap'>IP Address</label><label class='lblValue'> {ip}</label>",
					                        "<div style='clear:both;'></div>",
                                            "<label class='lblMap'>Lat</label><label class='lblValue'> {lat}</label>",
					                        "<div style='clear:both;'></div>",
                                            "<label class='lblMap'>Lng</label><label class='lblValue'> {lng}</label>",
					                        "<div style='clear:both;'></div>",
                                            "<label class='lblMap'>Last contact</label><label class='lblValue'> {l_contact_human}</label><br>",
                                           "<div style='clear:both;'></div>",
                                            "<label class='lblMap'>Clients last hour</label><label class='lblValue'> {connections}</label><br>",
                                        "</div>"
                                        ]
                                    );
                                    
                                    var dis = false;
			                        if(i.state == 'down'){
				                        dis = true;
			                        }

                                    Ext.create('Ext.tab.Panel', {
                                        width		: 350,
                                        height		: 248,
				                        layout		: 'fit',
                                        activeTab	: 0,
                                        items: [
                                            {
                                                title: 'Info',
                                                itemId: 'tabMapsNodeInfo',
                                                bodyPadding: 2,
                                                tpl : tpl,
                                                autoScroll: true,
                                                data: i,
						                        buttonAlign: 'center'
                                            }
                                        ],
                                        renderTo : infowindow.getContent()
                                    });
                                    infowindow.filled = true;
                                }            
                                
                            });

                            var sel_marker = me.getView().addMarker({
                                lat: i.lat,
                                lng: i.lng,
                                icon: icon,
                                title: i.name,
                                listeners: {
                                    click: function (e, f) {
                                        me.markerClickNode(sel_marker);
                                    }
                                }
                            });
                            
                            sel_marker.infowindow = infowindow;
                            
                        }
                    });
                    Ext.each(jsonData.connections, function (c) {
                        var pl = me.getView().addPolyLine(c);

                    });                    
                    me.getView().setLoading(false);
                    if(bounds_changed == true){
                        me.getView().gmap.fitBounds(bounds);
                    }
                }
            },
            scope: me
        });     
    },
    onBtnOverview: function(){
        var me = this;
        me.lookupReference('btnOverview').setHidden(true);
        me.loadMapOverview();
    },
    markerClickNode : function(marker){
        var me = this;
        marker.infowindow.open(me.getView(),marker);
    }
});

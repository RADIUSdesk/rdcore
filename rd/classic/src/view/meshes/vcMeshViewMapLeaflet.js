Ext.define('Rd.view.meshes.vcMeshViewMapLeaflet', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcMeshViewMapLeaflet',
    config : {
        urlOverviewGoogleMap    : '/cake3/rd_cake/mesh-reports/overview_google_map.json',
        urlOverviewMeshes       : '/cake3/rd_cake/mesh-reports/overview_meshes.json',
        urlBlueMark             : 'resources/css/images/marker-icon-2x-blue.png',
        urlRedNode              : 'resources/css/images/marker-icon-2x-orange.png',
        urlRedGw                : 'resources/css/images/marker-icon-2x-red.png',
        urlGreenNode            : 'resources/css/images/marker-icon-2x-green.png',
        urlGreenGw              : 'resources/css/images/marker-icon-2x-dark-green.png',
        overview                : true
    },
    init: function() {
        var me = this;        
    },
    OnPnlAfterrender: function(){
        var me = this;
        me.getView().down('cmpLeafletMapView').getFgMarkers().on('popupopen', function (e) {       
            var i = e.sourceTarget.options.node_info;    
            var element = Ext.get(e.popup.getElement());
            var c = element.selectNode('.leaflet-popup-content');
            var populated = element.selectNode('.x-panel');
            if(populated){
                Ext.get(c).setWidth(370); 
                return;
            }
            Ext.get(c).setStyle({
                backgroundColor: 'gray',
                padding: '10px',
                margin: '10px'
            });
            
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
            
            Ext.create('Ext.panel.Panel', {
                width		: 350,
                height		: 248,
                layout		: 'fit',
                bodyPadding : 2,
                tpl         : tpl,
                autoScroll  : true,
                data        : i,
                renderTo    : c
            });
             
            e.popup.update();
            Ext.get(c).setWidth(370);   
                
        }); 
    },
    onBtnReload : function(btn){
        var me  = this;
        if(me.getOverview()){
            me.loadMapOverview();
        }else{
            me.onCmbMeshChange(); 
        }
    },
    onCmbMeshChange : function (){
        var me = this;
        mesh_id = me.getView().down('cmbMesh').getValue();
        if(mesh_id !== -1){
            me.loadMeshDetail(mesh_id)
        }
        if(mesh_id == -1){
            me.setOverview(true);
            me.loadMapOverview();
        } 
    },
	loadMapOverview : function () {
        var me = this; 
        me.getView().setLoading(true);
        me.clearLayers();
        mesh_id = me.getView().down('cmbMesh').getValue();    
        Ext.Ajax.request({
            url: me.getUrlOverviewMeshes(),
            method: 'GET',
            params: {
                mesh_id: mesh_id
            },
            success: function (response) {
                var jsonData = Ext.JSON.decode(response.responseText);
                if (jsonData.success){                
                    Ext.each(jsonData.meshes, function (i){
                        me.addMarker([i.center.lat,i.center.lng],{title: i.name,meshId:i.meshID,level:1});
                    });
                    
                    me.getView().down('cmpLeafletMapView').centerMarkers();
                    me.getView().setLoading(false);
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
    clearLayers: function(){
        var me = this;
        me.getView().down('cmpLeafletMapView').getFgMarkers().clearLayers();
        me.getView().down('cmpLeafletMapView').getFgPolygons().clearLayers();   
    },
    addMarker: function(pos,conf,withPopup=false){
	    var me = this;
	    var marker = L.marker(pos,conf);
	    if(withPopup){
	        marker.bindPopup();
	    }
	    marker.addTo(me.getView().down('cmpLeafletMapView').getFgMarkers());
	    marker.on('click',function(e){	        
	        if(e.target.options.level == 1){//We load the toplevel markers with level = 1 so we can know which level has been clicked
	            var meshId = e.target.options.meshId
	            me.loadMeshDetail(e.target.options.meshId);
	        }
	        if(e.target.options.level == 2){//We load the toplevel markers with level = 1 so we can know which level has been clicked
	            console.log("Nou gaan ons die popup pop")
	        }
	    })
	},
	loadMeshDetail: function (mesh_id){
        var me = this;
        me.lookupReference('btnOverview').setHidden(false);      
        me.getView().setLoading(true);
        me.clearLayers(); 
        Ext.Ajax.request({
            url     : me.getUrlOverviewGoogleMap(),
            method  : 'GET',
            params  : {
                mesh_id: mesh_id
            },
            success: function (response) {
                var jsonData = Ext.JSON.decode(response.responseText);
                if (jsonData.success) {
                    Ext.each(jsonData.items, function (i) {
                        if(i.lat !== null){ //Only if it has a value
                                              
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
                            var icon = new L.Icon({
	                            iconUrl     : icon,
	                            shadowUrl   : 'resources/css/images/marker-shadow.png',
	                            iconSize    : [25, 41],
	                            iconAnchor  : [12, 41],
	                            popupAnchor : [1, -34],
	                            shadowSize  : [41, 41]
                            });                                   
                            me.addMarker([i.lat,i.lng],{title: i.name,nodeId:i.id,level:2,icon:icon,node_info:i},true);            
                        
                        }
                    });
                    Ext.each(jsonData.connections, function (c) {
                        me.addPolyLine(c);
                    });                    
                    me.getView().setLoading(false);
                    me.getView().down('cmpLeafletMapView').centerMarkers();
                }
            },
            scope: me
        });     
    },
    addPolyLine: function(line){
		var me = this;
		var latlngs = [
            [line.from.lat, line.from.lng],
            [line.to.lat, line.to.lng]
        ];
        var polyline = L.polyline(latlngs, {
            color   : line.color, 
            weight  : line.weight,
            opacity : line.opacity
        });
        polyline.addTo(me.getView().down('cmpLeafletMapView').getFgPolygons());
	}  
});

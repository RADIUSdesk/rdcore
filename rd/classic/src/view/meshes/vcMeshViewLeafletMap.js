Ext.define('Rd.view.meshes.vcMeshViewLeafletMap', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcMeshViewLeafletMap',
    config : {
        urlBlue                 : 'resources/css/images/marker-icon-2x-blue.png',
        urlBlack                : 'resources/css/images/marker-icon-2x-black.png',
        urlRedNode              : 'resources/css/images/marker-icon-2x-orange.png',
        urlRedGw                : 'resources/css/images/marker-icon-2x-red.png',
        urlGreenNode            : 'resources/css/images/marker-icon-2x-green.png',
        urlGreenGw              : 'resources/css/images/marker-icon-2x-dark-green.png',
        urlViolet               : 'resources/css/images/marker-icon-2x-violet.png',
        urlOverviewGoogleMap    : '/cake3/rd_cake/mesh-reports/overview_google_map.json',
        urlRestartNodes			: '/cake3/rd_cake/mesh-reports/restart_nodes.json',
		mapType                 : 'Leaflet' //Default	
    },
    control: {
        '#reload': {
             click: 'reload'
        }
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
            
            var dis = false;
			if(i.state == 'down'){
				dis = true;
			}
            
            Ext.create('Ext.panel.Panel', {
                width		: 350,
                height		: 248,
                layout		: 'fit',
                bodyPadding : 2,
                tpl         : tpl,
                autoScroll  : true,
                data        : i,
                buttonAlign : 'center',
                nodeId      : i.id,
		        meshId      : i.mesh_id,
		        buttons	    : [
		            {
		                xtype   : 'button',
		                text    : 'Restart',
		                scale   : 'large',
		                glyph   : Rd.config.icnPower,
						disabled: dis,
						listeners   : {
                            click : me.mapRestart,
                            scope : me
                        } 
		            }
		        ],
                renderTo : c
            });             
            e.popup.update();
            Ext.get(c).setWidth(370);               
        }); 
    },
    reload: function(btn){
        var me = this;
        me.clearLayers();
        me.reloadMap();
    },
    clearLayers: function(){
        var me = this;
        me.getView().down('cmpLeafletMapView').getFgMarkers().clearLayers();
        me.getView().down('cmpLeafletMapView').getFgPolygons().clearLayers();   
    },
    reloadMap: function(){
		var me = this;
		me.getView().setLoading(true); 
		Ext.Ajax.request({
            url     : me.getUrlOverviewGoogleMap(),
            method  : 'GET',
			params  : {
				mesh_id: me.getView().meshId
			},
            success: function(response){
                var jsonData = Ext.JSON.decode(response.responseText);
                if (jsonData.success) {
                    Ext.each(jsonData.items, function (i) {
                        if(i.lat !== null){ //Only if it has a value
                                              
                            var icon = me.getUrlBlue();  //Default
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
                            me.addMarker([i.lat,i.lng],{title: i.name,nodeId:i.id,icon:icon,node_info:i},true);                     
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
	},
	mapRestart: function(b){
		var me 		= this;
		var pnl		= b.up('panel');
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
                )
                me.reload();
            },                                    
            failure: function(batch,options){
                Ext.ux.Toaster.msg(
                    'Problems restarting device',
                    batch.proxy.getReader().rawData.message.message,
                    Ext.ux.Constants.clsWarn,
                    Ext.ux.Constants.msgWarn
                );
                me.reload();
            }
        });
	}  
});

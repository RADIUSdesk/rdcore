Ext.define('Rd.view.components.cmpLeafletMapView', {
    extend  : 'Ext.Component',
	alias   : 'widget.cmpLeafletMapView',
	config:{
		initialLocation     : null,
		initialZoomLevel    : null,
		map                 : null,
		fgMarkers           : null,
		fgPolygons          : null,
		useCurrentLocation  : false,
		tileLayerUrl        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
		tileLayerKey        : null,
		tileLayerStyle      : 997,
		tileMaxZoom         : 18,
		attribution         : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	},
	afterRender: function(t, eOpts){
        /*	
	        var map = L.map('map').setView([51.505, -0.09], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        L.marker([51.5, -0.09]).addTo(map)
            .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
            .openPopup();
	*/
	
	    var me = this;
		me.callParent(arguments);
		var leafletRef = window.L;
		if (leafletRef == null){		
			me.update("No leaflet library loaded");	
		} else {
			var map = L.map(this.getId());
			me.setMap(map);

			var initialLocation     = me.getInitialLocation();
			var initialZoomLevel    = me.getInitialZoomLevel();
			if (initialLocation && initialZoomLevel){
				map.setView(initialLocation, initialZoomLevel);
			} else {
				map.fitWorld();
			}

			L.tileLayer(this.getTileLayerUrl(), {
				key         : me.getTileLayerKey(),
				styleId     : me.getTileLayerStyle(),
				maxZoom     : me.getTileMaxZoom(),
				attribution : me.getAttribution()
			}).addTo(map);
			
			//Add the layerGroups
			me.fgMarkers   = L.featureGroup().addTo(map);
			me.fgPolygons  = L.featureGroup().addTo(map);

			if (me.getUseCurrentLocation() == true){
				map.locate({
					setView: true
				});
			}
		}
	},
	onResize: function(w, h, oW, oH){
		this.callParent(arguments);
		var map = this.getMap();
		if (map){
			map.invalidateSize();
		}
	},
	centerMarkers: function(options={}){
	    var me = this;
	    me.getMap().fitBounds(me.fgMarkers.getBounds(),options);
	},
	getMarkerCount: function(){
	    var me      = this;
	    var count   = 0;
	    me.fgMarkers.eachLayer(function (layer) {
            count = count+1
        },me);
        return count;
	}
});

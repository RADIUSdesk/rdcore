Ext.define('Rd.view.clouds.pnlCloudMap', {
    extend      : 'Ext.ux.GMapPanel',
    alias       : 'widget.pnlCloudMap',
    requires    : [
        'Rd.view.clouds.vcPnlCloudMap'
    ],
    controller  : 'vcPnlCloudMap',
	gmapType    : 'map',
	markers     : [],
    infoWindows : [],
	polyLines	: [],
	initComponent: function(){
        var me      = this;	
        me.mapItems = new Ext.util.MixedCollection();
              
		//This is required for the map even the most basic map!
        me.center 	= new google.maps.LatLng(22.0499116,78.9022018);
		me.mapOptions =  {
			zoom: 5,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			styles: [
				{
					"featureType": "administrative.country",
					"elementType": "labels",
					"stylers": [
						{
							"visibility": "off"
						}
					]
				}, 
				{
					"featureType": "administrative.neighborhood",
					"elementType": "labels",
					"stylers": [
						{
							"visibility": "off"
						}
					]
				}, 
				{
					"featureType": "administrative.land_parcel",
					"elementType": "labels",
					"stylers": [{
					  "visibility": "off"
					}]
				}, 
				{
					"featureType": "administrative.locality",
					"elementType": "labels",
					"stylers": [{
					  "visibility": "off"
					}]
				},
				{
					"featureType": "road.local",
					"elementType": "labels",
					"stylers": [{
					  "visibility": "off"
					}]
				},
				{
					"featureType": "road.highway",
					"elementType": "labels",
					"stylers": [{
					  "visibility": "off"
					}]
				}
			]
		};
		
	    me.addwindow = new google.maps.InfoWindow({
            content: "<div style='padding:5px;margin:5px; height:100px; width:200px;'><div class='lblRdReq'>"+
                        i18n("sAction_required")+
                     "</div><div class='lblRd'>"+
                        "Drag and drop marker to required position"+
                    "</div></div>"
        });
        me.infoWindows.push(me.addwindow);           
		
	    me.callParent(arguments);
    },
    addMarker: function(marker) {
        var me = this;
        marker = Ext.apply({
            map     : me.gmap,
            shadow  : me.shadow 
        }, marker);
        
        if (!marker.position) {
            marker.position = new google.maps.LatLng(marker.lat, marker.lng);
        }
        var o =  new google.maps.Marker(marker);
        Ext.Object.each(marker.listeners, function(name, fn){
            google.maps.event.addListener(o, name, fn);    
        });
        me.markers.push(o);       
        return o;
    },
    addPolyLine: function(line){
		var me = this;

		var from_to = [
			new google.maps.LatLng(line.from.lat, line.from.lng),
			new google.maps.LatLng(line.to.lat, line.to.lng)
		];

		var o = new google.maps.Polyline({
			path			: from_to,
			geodesic		: true,
			strokeColor		: line.color,
			strokeOpacity	: line.opacity,
			strokeWeight	: line.weight
		});
		o.setMap(me.gmap);	//Attach it to the map
		me.polyLines.push(o);
		return o;
	}  	
});

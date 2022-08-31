Ext.define('Rd.view.meshes.pnlMeshViewGMap', {
    extend:'Ext.ux.GMapPanel',
    alias :'widget.pnlMeshViewGMap',
    markers     : [],
    infoWindows : [],
	polyLines	: [],
    infowindow  : undefined,
    shadow      : undefined,
    store       : undefined,
    centerLatLng: undefined,
	meshId		: '',
	mapPanel	: '',
	e_pnl		: false,
	tbar: [
    	{xtype: 'buttongroup', title: null, items : [
		{xtype: 'button', ui : 'button-orange', glyph: Rd.config.icnReload, scale: 'large', itemId: 'reload', tooltip: i18n('sReload')}
        ]}    
    ],
    initComponent: function(){
        var me      = this;
        var cLat  	= me.centerLatLng.lat;
        var cLng  	= me.centerLatLng.lng;

		//This is required for the map even the most basic map!
        me.center 	= new google.maps.LatLng(cLat,cLng);

        //Create a shadow item:
        me.shadow = new google.maps.MarkerImage('resources/images/map_markers/shadow.png', null, null, new google.maps.Point(10, 34));

		//___Info infowindow___
        var i_div 		=  document.createElement('div');
        i_div.className = i_div.className + "mapInfoDiv";
        me.infowindow = new google.maps.InfoWindow({
            content: i_div
        });
        me.infoWindows.push(me.infowindow);

        google.maps.event.addListener(me.infowindow, 'domready', function(){
            //Note before firing this event; we would have clicked on a marker
            //During the click event we assign (in the controller) the clicked record to this instance(me)'s
            //marker_record property we will then subsequintly use it here
            
            var c= me.infowindow.getContent();
			if(me.i_pnl){	
				me.i_pnl.destroy();
			}     
          
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
                    "<label class='lblMap'>Last contact</label><label class='lblValue'> {last_contact}</label><br>",
                   "<div style='clear:both;'></div>",
                    "<label class='lblMap'>Clients last hour</label><label class='lblValue'> {connections}</label><br>",
                "</div>"
                ]
            );

			var dis = false;
			if(me.marker_data.state == 'down'){
				dis = true;
			}
           
			var node_id = me.marker_data.id;
            
            me.i_pnl = Ext.create('Ext.tab.Panel', {
                itemId		: 'pnlMapsNodeInfo',
                width		: 350,
                height		: 248,
				layout		: 'fit',
                activeTab	: 0,
				nodeId		: node_id,
				meshId		: me.meshId,	
                items: [
                    {
                        title: 'Info',
                        itemId: 'tabMapsNodeInfo',
                        bodyPadding: 2,
                        tpl : tpl,
                        autoScroll: true,
                        data: me.marker_data,
						buttonAlign: 'center',
				        buttons	: [
				            {
				                xtype   : 'button',
				                itemId  : 'restart',
				                text    : 'Restart',
				                scale   : 'large',
				                glyph   : Rd.config.icnPower,
								disabled: dis
				            }
				        ]
                    }
                ],
                renderTo : c
            });
          //  me.i_pnl.doLayout();
        });

		//------

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
	clearMarkers: function(){
        var me = this;
        while(me.markers[0]){
            me.markers.pop().setMap(null);
        }
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
	},
	clearPolyLines: function(){
		var me = this;
		while(me.polyLines[0]){
            me.polyLines.pop().setMap(null);
        }
	}
    
});


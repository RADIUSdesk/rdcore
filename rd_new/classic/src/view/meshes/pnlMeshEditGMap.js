Ext.define('Rd.view.meshes.pnlMeshEditGMap', {
    extend      : 'Ext.ux.GMapPanel',
    alias       : 'widget.pnlMeshEditGMap',
    markers     : [],
    infoWindows : [],
    meshId		: '',
	mapPanel	: '',
	e_pnl		: false,
	tbar    : [
    	{xtype: 'buttongroup', title: null, items : [
		{xtype: 'button', glyph: Rd.config.icnReload ,	ui : 'button-orange', scale: 'large', itemId: 'reload',   	tooltip: i18n('sReload')},
		{xtype: 'button', glyph: Rd.config.icnConfigure,ui : 'button-metal',scale: 'large', itemId: 'preferences', 	tooltip: i18n('sPreferences')},
        {xtype: 'button', glyph: Rd.config.icnAdd,      ui : 'button-green', scale: 'large', itemId: 'add',         	tooltip: i18n('sAdd')},
        {xtype: 'button', glyph: Rd.config.icnDelete,   ui : 'button-red',scale: 'large', itemId: 'delete',      	tooltip: i18n('sDelete')},
        {xtype: 'button', glyph: Rd.config.icnEdit,     ui : 'button-blue',scale: 'large', itemId: 'edit',        	tooltip: i18n('sEdit')}
        ]}    
    ],
    initComponent: function(){
        var me  = this;     
        //Create a shadow item:
        me.shadow = new google.maps.MarkerImage('resources/images/map_markers/shadow.png', null, null, new google.maps.Point(10, 34));
        
        //___Edit infowindow___
        var e_div 		=  document.createElement('div');
        e_div.className = e_div.className + "mapEditDiv";
        e_div.id        = "mapEditDiv";
        me.editwindow 	= new google.maps.InfoWindow({
            content: e_div
        });
        
        me.infoWindows.push(me.editwindow);
        
        google.maps.event.addListener(me.editwindow, 'closeclick', function(){       
                console.log("Info Window Close Button Clicked");
        });
            
        google.maps.event.addListener(me.editwindow, 'domready', function(){
            var c	= me.editwindow.getContent();	
            if(me.e_pnl == false){
            
                var tpl = new Ext.Template([
                    "<div class='divMapAction'>",
                        "<label class='lblMap'>"+i18n("sNew_position")+"</label>",
					    "<div style='clear:both;'></div>",
                        "<label class='lblMap'>"+ i18n("sLatitude")+"  </label><label class='lblValue'> {lat}</label>",
					    "<div style='clear:both;'></div>",
                        "<label class='lblMap'>"+i18n("sLongitude")+"  </label><label class='lblValue'> {lng}</label>",
					    "<div style='clear:both;'></div>",
                    "</div>"
                    ]
                );
            
			    //Create a new edit panel (every time on domready)
                me.e_pnl = Ext.create('Ext.panel.Panel', {
                    title	: i18n("sAction_required"),
                    itemId	: 'pnlMapsEdit',
                    height	: 170,
                    tpl		: tpl,
				    layout	: 'fit',
				    mapPanel: me,
				    buttonAlign: 'center',
                    buttons	: [
                        {
                            xtype   : 'button',
                            itemId  : 'save',
                            text    : i18n('sSave'),
                            scale   : 'large',
                            glyph   : Rd.config.icnYes
                        },
                        {
                            xtype   : 'button',
                            itemId  : 'cancel',
                            text    : i18n('sCancel'),
                            scale   : 'large',
                            glyph   : Rd.config.icnClose
                        },
                        {
                            xtype   : 'button',
                            itemId  : 'delete',
                            text    : i18n('sDelete'),
                            scale   : 'large',
                            glyph   : Rd.config.icnDelete
                        }  
                    ],
                    renderTo: c
                });
            }
            //FIXME THERE IS A PROBLEM THAT WILL CAUSE THE BUTTONS NOT TO ACCEPT CLICKS
            
            //me.e_pnl.update({"lng": me.new_lng,"lat": me.new_lat});
        });
        
        //___Add infowindow___
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
    clearMarkers: function(){
        var me = this;
        while(me.markers[0]){
            me.markers.pop().setMap(null);
        }
    }
});


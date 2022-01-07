Ext.define('Rd.view.meshOverview.vcMeshOverviewLeafletMap', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcMeshOverviewLeafletMap',
    config: {
        urlMapSave      : '/cake3/rd_cake/clouds/map-overview-save.json',
        urlMapDelete    : '/cake3/rd_cake/clouds/map-overview-delete.json',
        urlBlue         : 'resources/css/images/marker-icon-2x-blue.png',
        urlBlack        : 'resources/css/images/marker-icon-2x-black.png',
        urlRedNode      : 'resources/css/images/marker-icon-2x-orange.png',
        urlRedGw        : 'resources/css/images/marker-icon-2x-red.png',
        urlGreenNode    : 'resources/css/images/marker-icon-2x-green.png',
        urlGreenGw      : 'resources/css/images/marker-icon-2x-dark-green.png',
        urlViolet       : 'resources/css/images/marker-icon-2x-violet.png',
        urlMapRedRed    : 'resources/images/map_markers/red_red.png',
        lastMovedMarker : null,
		lastOrigPosition: null		
    },
    OnPnlAfterrender: function(){
        var me = this;
    }, 
    onMeshOverviewLightStoreLoad: function(){
        var me = this;
        var md = me.getView().store.getProxy().getReader().metaData;
        me.doMetaData(md);
        me.clearLayers();           
        me.getView().store.each(function(record){      
            if(record.get('lat') !== null){ //Only if it has a value	    
		        var icon    = new L.Icon({
                    iconUrl     : me.getUrlBlack(),
                    shadowUrl   : 'resources/css/images/marker-shadow.png',
                    iconSize    : [25, 41],
                    iconAnchor  : [12, 41],
                    popupAnchor : [1, -34],
                    shadowSize  : [41, 41]
                });        
                var m_options = {
                    icon        : icon,
                    draggable   : true, 
                    title       : record.get('name'),
                    dragged     : false,
                    id          : record.get('id')
                };                                                 
                var marker  = L.marker([record.get('lat'),record.get('lng')],m_options);
                marker.addTo(me.getView().down('cmpLeafletMapView').getFgMarkers());                           
                marker.on('click', me.markerClickNode, me); 
                marker.bindTooltip("Test Label", 
                    {
                        permanent: true, 
                        direction: 'bottom'
                    }
                );                          	                        
            }    
        });
        me.getView().down('cmpLeafletMapView').centerMarkers();    
    },    
    doMetaData: function(md){
        var me = this;    
        var main = me.getView().up('pnlMeshOverviewMapMain');
        
        if(md.level == -1){
            main.down('#cntBanner').setStyle('background','#adc2eb');
        }
             
        if(md.level == 0){
            main.down('#cntBanner').setStyle('background','#c2c2a3');
        }
        if(md.level == 1){
            main.down('#cntBanner').setStyle('background','#00cccc');
        }        
        if(md.level == 2){
            main.down('#cntBanner').setStyle('background','#adc2eb');
        }          
        main.down('#cntBanner').setData(md);
    },
    editNode: function(record){
        var me = this;
        //Clear the map 
        me.clearLayers();
        
        var lat = record.get('lat');
        var lng = record.get('lng');
        var reCenter = true;
        
        if((lat == null)||(lng == null)){
            var ll      = me.getView().down('cmpLeafletMapView').map.getCenter();
            
            reCenter = false;
        }else{
            ll = [lat,lng];
            
        } 
        
        var icon    = new L.Icon({
            iconUrl     : me.getUrlViolet(),
            shadowUrl   : 'resources/css/images/marker-shadow.png',
            iconSize    : [25, 41],
            iconAnchor  : [12, 41],
            popupAnchor : [1, -34],
            shadowSize  : [41, 41]
        });        
        var m_options = {
            icon        : icon,
            draggable   : true, 
            title       : record.get('text'),
            dragged     : false,
            id          : record.get('id')
        };                        
        var marker  = L.marker(ll,m_options);
        marker.addTo(me.getView().down('cmpLeafletMapView').getFgMarkers()); 
        var s_init = "<div style='padding:5px;margin:5px; height:100px; width:200px;'>"+
        "<div class='lblRdReq'>"+
            record.get('text')+
         "</div><div class='lblRd'>"+
            "Drag and drop marker to required position"+
        "</div></div>";       
        marker.on('dragstart',me.dragStart, me); //We bind these events to the scipe of this viewcontroller (me)
        marker.on('dragend',  me.dragEnd, me);   //We bind these events to the scipe of this viewcontroller (me)
        
        if(reCenter){      
            me.getView().down('cmpLeafletMapView').centerMarkers();
        }  
        marker.bindPopup(s_init).openPopup();    
    },
    markerClickNode: function(e){
	    var me      = this;
	    me.getView().store.getProxy().setExtraParams({tree_tag_id: e.target.options.id});  
	    var main    = me.getView().up('pnlMeshOverviewMapMain');
	    var tree    = main.down('treeMeshOverview');
	    var t_store = tree.getStore();
	    var node    = t_store.getNodeById(e.target.options.id);
	    if(node == undefined){
	        console.log("O Gatta Hierdie een is missing");
	    }else{
	        tree.expandNode(node);
	        me.getView().up('pnlMeshOverviewMapMain').getController().onMarkerClick(e.target.options.id);
	    }    
	},
    dragStart: function(e){
        var me = this;
        me.setLastMovedMarker(e.target);
        me.setLastOrigPosition(e.target.getLatLng());  
    },
    dragEnd: function(e){
        var me = this;
        if(e.target.options.dragged == false){
            //Mark it as moved and also remove initial popup
            e.target.options.dragged = true;
            e.target.unbindPopup();            
            //Create a new POP-UP
            var p = L.popup();
            e.target.bindPopup(p); //Bind IT    
            e.target.openPopup();  //Open IT
            p.update();
           
            var element = Ext.get(p.getElement());
            var c       = element.selectNode('.leaflet-popup-content');    
            Ext.get(c).setStyle({
                backgroundColor: 'gray',
                padding : '10px',
                margin  : '10px'
            });
            
            var new_pos = e.target.getLatLng();
            var i = {lat:new_pos.lat,lng:new_pos.lng,id:e.target.options.id};
            
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
                 
            var p = Ext.create('Ext.panel.Panel', {
                itemId	: 'pnlMapsEdit',
                height	: 170,
                width   : 350,
                tpl		: tpl,
		        layout	: 'fit',
		        data    : i,
		        buttonAlign: 'center',
                buttons	: [
                    {
                        xtype   : 'button',
                        text    : i18n('sSave'),
                        scale   : 'large',
                        glyph   : Rd.config.icnYes,
                        listeners   : {
                            click : me.OnSaveMarker,
                            scope : me
                        } 
                    },
                    {
                        xtype   : 'button',
                        text    : i18n('sCancel'),
                        scale   : 'large',
                        glyph   : Rd.config.icnClose,
                        listeners   : {
                            click : me.OnCancelMarker,
                            scope : me
                        } 
                    },
                    {
                        xtype   : 'button',
                        text    : i18n('sDelete'),
                        scale   : 'large',
                        glyph   : Rd.config.icnDelete,
                        listeners   : {
                            click : me.OnDeleteMarker,
                            scope : me
                        } 
                    }  
                ],
                renderTo: c
            }); 
            //me.getView().add(p);   
            e.target.getPopup().update();
            Ext.get(c).setWidth(370);          
            e.target.options.panel = p;
    
        }else{
            e.target.openPopup();  //Open IT
            var new_pos = e.target.getLatLng();
            var d = e.target.options.panel.getData();
            d.lat = new_pos.lat;
            d.lng = new_pos.lng;
            e.target.getPopup();
            var element = Ext.get(e.target.getPopup().getElement());
            var c       = element.selectNode('.leaflet-popup-content');
            Ext.get(c).setWidth(370);
            e.target.options.panel.setData(d);      
        }        
    },   
    //The  3 actions for the marker
    OnSaveMarker: function(btn){
        var me = this;
        var pnl = btn.up('panel');     
        Ext.Ajax.request({
            url: me.getUrlMapSave(),
            method  : 'GET',
            params  : pnl.getData(),
            success : function(response){
                var jsonData    = Ext.JSON.decode(response.responseText);
                if(jsonData.success){
                    Ext.ux.Toaster.msg(
                        i18n('sItem_updated'),
                        i18n('sItem_updated_fine'),
                        Ext.ux.Constants.clsInfo,
                        Ext.ux.Constants.msgInfo
                    );
					me.getView().up('pnlMeshOverviewMapMain').getController().onBtnReload();
                }   
            },
            scope: me
        });      
    },
    OnCancelMarker: function(btn){
        var me  = this;
        var pnl = btn.up('panel');
        me.getLastMovedMarker().setLatLng(me.getLastOrigPosition());
    },
    OnDeleteMarker: function(btn){
        var me  = this;
        var pnl = btn.up('panel');
        Ext.Ajax.request({
            url     : me.getUrlMapDelete(),
            method  : 'GET',
            params  : pnl.getData(),
            success : function(response){
                var jsonData    = Ext.JSON.decode(response.responseText);
                if(jsonData.success){
                    Ext.ux.Toaster.msg(
                        i18n('sItem_deleted'),
                        i18n('sItem_deleted_fine'),
                        Ext.ux.Constants.clsInfo,
                        Ext.ux.Constants.msgInfo
                    );
					me.getView().up('pnlMeshOverviewMapMain').getController().onBtnReload();
                }   
            },
            scope: me
        });      
    },
    clearLayers: function(){
        var me = this;
        me.getView().down('cmpLeafletMapView').getFgMarkers().clearLayers();
        me.getView().down('cmpLeafletMapView').getFgPolygons().clearLayers();   
    }
    /*
    onClickHourButton: function(button){
       var me = this;
	   var pnl = button.up('panel'),
			p_store = pnl.store,
			mo_pnl = Ext.ComponentQuery.query('pnlMeshOverview')[0];
			
		var t = pnl.down('pnlMeshOverviewTotals');
		if( t == undefined ){
			t = mo_pnl;
		}
	    t.setLoading(true);		
        p_store.getProxy().setExtraParams({'timespan': 'hourly','tree_tag_id': mo_pnl.current_node_id});
        p_store.load({
            scope: this,
            callback: function(records, operation, success) {     
                t.setLoading(false);
            }
        });
    },
    onBtnReload: function(button){
        var me = this;
        me.getView().setLoading(true);
        console.log("Reload Clicked"); 
        me.getView().store.load();  
    },
    onMeshOverviewLightStoreLoad: function(pnl){
        var me = this;
        //console.log("Store Loaded Fine");
        me.clearMarkers(); 
        me.clearPolyLines();
        var bounds = new google.maps.LatLngBounds();
        me.getView().setLoading(false);
        var md = pnl.store.getProxy().getReader().metaData;
        
        var fontSize = '18px';
        
        me.doMetaData(md);
        
        pnl.store.each(function(record){
            //Here we'll add some logic to determine what kind of marker to display
            var draggable   = false;
            var networks    = record.get('networks');
            var icon        =  me.getUrlMapPurpleW();
            var label       = {
                fontFamily  : 'Fontawesome',
                text        : '\uf1ad'+" "+networks,
                fontSize    : fontSize,
                color       : '#6600ff'
            }
            
            if(record.get('level') == 1){
                var icon        =  me.getUrlMapDeepBlueW();
                var label       = {
                    fontFamily  : 'Fontawesome',
                    text        : '\uf1b3'+" "+networks,
                    fontSize    : fontSize,
                    color       : '#003399'
               } 
            }
            
            if(record.get('level') == 2){
                var icon        =  me.getUrlMapSeaGreenW();
                var label       = {
                    fontFamily  : 'Fontawesome',
                    text        : '\uf1b2'+" "+networks,
                    fontSize    : fontSize,
                    color       : '#009999'
                }
            
            }
            
            bounds.extend(new google.maps.LatLng(record.get('center_lat'), record.get('center_lng')));
            
            if(record.get('status') == 'no_meshes'){
                icon = me.getUrlMapOrangeW(); // Default for state
                label       = {
                    fontFamily  : 'Fontawesome',
                    text        : '\uf059',
                    fontSize    : fontSize,
                    color       : '#cc3300'
                }
            }
            
            if(record.get('status') == 'no_nodes'){
                icon = me.getUrlMapOrangeW(); // Default for state
                label       = {
                    fontFamily  : 'Fontawesome',
                    text        : '\uf059 Nodes',
                    fontSize    : fontSize,
                    color       : '#cc3300'
                }
            }
            
            if(record.get('status') == 'not_placed'){
                icon = me.getUrlMapOrangeOrange();
                label = {
                    fontFamily  : 'Fontawesome',
                    text        : '\uf047',
                    fontSize    : fontSize,
                    color       : 'white'
                }
            }
            
            if(record.get('status') == 'placed'){
                icon = me.getUrlMapBlueBlue(); // Default for state
                label       = {
                    fontFamily  : 'Fontawesome',
                    text        : '\uf20e',
                    fontSize    : fontSize,
                    //color       : '#0066ff'
                    color       : 'white'
                }
            }
            
            if(record.get('status') == 'placed_offline'){
                icon = me.getUrlMapRedRed(); // Default for state
                label       = {
                    fontFamily  : 'Fontawesome',
                    text        : '\uf20e',
                    fontSize    : fontSize,
                    //color       : '#0066ff'
                    color       : 'white'
                }
            } 
            
            if(record.get('status') == 'placed_online'){
                icon = me.getUrlMapGreenGreen(); // Default for state
                label       = {
                    fontFamily  : 'Fontawesome',
                    text        : '\uf20e',
                    fontSize    : fontSize,
                    //color       : '#0066ff'
                    color       : 'white'
                }
            }               
                      
            if(record.get('draggable')){
                draggable   = true;
                
                //Create in info window PER marker
                var i_div 		=  document.createElement('div');
                i_div.className = i_div.className + "mapEditDiv";
                var infowindow  = new google.maps.InfoWindow({
                    content: i_div
                });
                infowindow.filled = false;      
                
                google.maps.event.addListener(infowindow, 'domready', function(){ 
                
                    if(infowindow.filled == false){ 
                        console.log("Dom ready NEW");       
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
                        
                        var e_pnl = Ext.create('Ext.panel.Panel', {
                            title	: i18n("sAction_required"),
                            height	: 190,
                            tpl		: tpl,
			                layout	: 'fit',
			                data    : {},
			                buttonAlign: 'center',
                            buttons	: [
                                {
                                    xtype   : 'button',
                                    itemId  : 'save',
                                    text    : i18n('sSave'),
                                    scale   : 'large',
                                    glyph   : Rd.config.icnYes,
                                    listeners       : {
			                            click : function(btn){
			                                me.onBtnSave(sel_marker)
			                            }
	                                }
                                },
                                {
                                    xtype   : 'button',
                                    itemId  : 'cancel',
                                    text    : i18n('sCancel'),
                                    scale   : 'large',
                                    glyph   : Rd.config.icnClose,
                                    listeners       : {
			                            click : function(btn){
			                                me.onBtnCancel(sel_marker)
			                            }
	                                }
                                }
                            ],
                            renderTo: infowindow.getContent()
                        });
                        infowindow.filled = true;
                        infowindow.panel = e_pnl;
                    } 
                    console.log("Dom ready OLD");                     
                }); 
                     
                
                var sel_marker = me.getView().addMarker({
                    lat         : record.get('center_lat'),
                    lng         : record.get('center_lng'),  
                    icon        : icon,     
                    record      : record, //FIXME Lets see if this will work
                    draggable   : draggable,
                    label       : label,
                    title       : record.get('text'),
                    infowindow : infowindow,
                    //Extras Specific
                    level       : record.get('level'),
                    id          : record.get('id'),
                    //END Extras Specific
                    listeners   : {
                        dragend: function(){
                            me.dragEnd(sel_marker);
                        },
                        dragstart: function(){
                            me.dragStart(sel_marker);
                        }
                    }
                });
                
            }else{
            
                 var sel_marker = me.getView().addMarker({
                    lat         : record.get('center_lat'),
                    lng         : record.get('center_lng'),
                    icon        : icon,
                    label       : label,
                    draggable	: draggable,
                    title       : record.get('text'),
                    //Extras Specific
                    level       : record.get('level'),
                    id          : record.get('id'),
                    //END Extras Specific
                    listeners: {
                        click: function (e, f) {
                            me.markerClickNode(sel_marker);
                        }
                    }
                });               
            }                    
        });
        
        if(pnl.store.getCount()<=1){
            me.getView().gmap.fitBounds(bounds);
            me.getView().gmap.setZoom(12); //Zoom out a bit
        }else{    
            me.getView().gmap.fitBounds(bounds);
        }
        //console.log(md);
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
	markerClickNode: function(marker){
	    var me      = this;
	    me.getView().store.getProxy().setExtraParams({tree_tag_id:marker.id});  
	    var main    = me.getView().up('pnlMeshOverviewMapMain');
	    var tree    = main.down('treeMeshOverview');
	    var t_store = tree.getStore();
	    var node    = t_store.getNodeById(marker.id);
	    if(node == undefined){
	        console.log("O Gatta Hierdie een is missing");
	    }else{
	        tree.expandNode(node);
	    }
	    me.onBtnReload();	
	},
	dragStart: function(marker){
	    var me = this;
	    var record = marker.record;
	    console.log(record.get('mesh_node_id'));
	    marker.infowindow.close(me.getView(),marker);
	    me.lastMovedMarker  = marker;
        me.lastOrigPosition = marker.getPosition();
	},
    dragEnd: function(marker){
        var me          = this;
        var record = marker.record;
	    console.log(record.get('mesh_node_id'));
        var l_l         = marker.getPosition();
        me.lastLng      = l_l.lng();
        me.lastLat      = l_l.lat();
        me.lastDragId   = marker.id;
        marker.infowindow.open(me.getView(),marker);
        Ext.defer(function () {    
            marker.infowindow.panel.setData({lat:l_l.lat(),lng:l_l.lng()});
        },500);    
    },
    doMetaData: function(md){
        var me = this;    
        var main = me.getView().up('pnlMeshOverviewMapMain');
        
        if(md.level == -1){
            main.down('#cntBanner').setStyle('background','#adc2eb');
        }
             
        if(md.level == 0){
            main.down('#cntBanner').setStyle('background','#c2c2a3');
        }
        if(md.level == 1){
            main.down('#cntBanner').setStyle('background','#00cccc');
        }        
        if(md.level == 2){
            main.down('#cntBanner').setStyle('background','#adc2eb');
        }          
        main.down('#cntBanner').setData(md);
    },
    onBtnSave: function(marker){
	    var me = this;
	    Ext.Ajax.request({
            url: me.getUrlMapSave(),
            method: 'POST',
            params: {
                id  : me.lastDragId,
                lat : me.lastLat,
                lon : me.lastLng
            },
            success: function(response){
                var jsonData    = Ext.JSON.decode(response.responseText);
                if(jsonData.success){     
                    marker.infowindow.close();
                    Ext.ux.Toaster.msg(
                        i18n('sItem_updated'),
                        i18n('sItem_updated_fine'),
                        Ext.ux.Constants.clsInfo,
                        Ext.ux.Constants.msgInfo
                    );
                    me.onBtnReload();
                }   
            },
            scope: me
        });
	},
	onBtnCancel: function(marker){
        var me = this;
        marker.infowindow.close();
        me.lastMovedMarker.setPosition(me.lastOrigPosition);
    }*/
});

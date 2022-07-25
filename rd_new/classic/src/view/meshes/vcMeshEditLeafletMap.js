Ext.define('Rd.view.meshes.vcMeshEditLeafletMap', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcMeshEditLeafletMap',
    config : {
        urlBlue                 : 'resources/css/images/marker-icon-2x-blue.png',
        urlBlack                : 'resources/css/images/marker-icon-2x-black.png',
        urlRedNode              : 'resources/css/images/marker-icon-2x-orange.png',
        urlRedGw                : 'resources/css/images/marker-icon-2x-red.png',
        urlGreenNode            : 'resources/css/images/marker-icon-2x-green.png',
        urlGreenGw              : 'resources/css/images/marker-icon-2x-dark-green.png',
        urlViolet               : 'resources/css/images/marker-icon-2x-violet.png',
        urlMapPrefView		    : '/cake3/rd_cake/meshes/map_pref_view.json',
		urlMapPrefEdit		    : '/cake3/rd_cake/meshes/map_pref_edit.json',
		urlMapSave			    : '/cake3/rd_cake/meshes/map_node_save.json',
		urlMapDelete		    : '/cake3/rd_cake/meshes/map_node_delete.json',
		urlMeshNodes		    : '/cake3/rd_cake/meshes/mesh_nodes_index.json',
		mapType                 : 'Leaflet', //Default
		lastMovedMarker         : null,
		lastOrigPosition        : null		
    },
    control: {
        '#reload': {
             click: 'reload'
        },
        '#preferences' : {
            click   : 'mapPreferences'
        },
		'winMeshMapPreferences #snapshot': {
            click   : 'mapPreferencesSnapshot'
        },
        'winMeshMapPreferences #save': {
            click:  'mapPreferencesSave'
        },
        '#add' : {
            click   : 'NodeAdd'
        },
        '#edit' : {
            click   : 'NodeEdit'
        },  
        '#edit': {
            click:  function(){
                Ext.Msg.alert(
                    i18n('sEdit_a_marker'), 
                    i18n('sSimply_drag_a_marker_to_a_different_postition_and_click_the_save_button_in_the_info_window')
                );
            }
        },
        '#delete': {
            click:  function(){
                Ext.Msg.alert(
                    i18n('sDelete_a_marker'), 
                    i18n('sSimply_drag_a_marker_to_a_different_postition_and_click_the_delete_button_in_the_info_window')
                );
            }
        }, 
        'winMeshMapNodeAdd #save': {
            click: 'NodeAddSubmit'
        }
    },
    init: function() {
        var me = this;        
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
            url: me.getUrlMeshNodes(),
            method: 'GET',
			params: {
				mesh_id: me.getView().meshId
			},
            success: function(response){
                var jsonData    = Ext.JSON.decode(response.responseText);
                if(jsonData.success){  
					Ext.each(jsonData.items, function(i){
					    if(i.lat !== null){ //Only if it has a value	    
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
                                title       : i.name,
                                dragged     : false,
                                id          : i.id
                            };                                                 
                            var marker  = L.marker([i.lat,i.lng],m_options);
                            marker.addTo(me.getView().down('cmpLeafletMapView').getFgMarkers());                           
                            marker.on('dragstart',me.dragStart, me); //We bind these events to the scipe of this viewcontroller (me)
                            marker.on('dragend',  me.dragEnd, me);   //We bind these events to the scipe of this viewcontroller (me)
					                        
		                }
					});
					me.getView().setLoading(false);
					me.getView().down('cmpLeafletMapView').centerMarkers();
                }   
            },
            scope: me
        });
	},   
    mapPreferences: function(button){
       	var me 		= this;
		var tabEdit = button.up('pnlMeshEdit');
		var mesh_id	= tabEdit.meshId;
		var pref_id = 'winMeshMapPreferences_'+mesh_id;
		var map_p	= tabEdit.down('pnlMeshEditLeafletMap');

        if(!Ext.WindowManager.get(pref_id)){
            var w = Ext.widget('winMeshMapPreferences',{id:pref_id,mapPanel: map_p,meshId: mesh_id,mapType:me.getMapType()});
            me.getView().add(w);
            w.show();
            //We need to load this widget's form with the latest data:
            w.down('form').load({
				url		: me.getUrlMapPrefView(),
            	method	: 'GET',
				params	: {
					mesh_id	: mesh_id
				}
			});
            
       }      
    },
    mapPreferencesSnapshot: function(button){
        var me      = this;
        var form    = button.up('form'); 
        var zoom    = me.getView().down('cmpLeafletMapView').map.getZoom();
        var ll      = me.getView().down('cmpLeafletMapView').map.getCenter();  
        form.down('#zoom').setValue(zoom);
        form.down('#lat').setValue(ll.lat);
        form.down('#lng').setValue(ll.lng);
    },
    mapPreferencesSave: function(button){
        var me      = this;
        var form    = button.up('form');
        var win     = button.up('winMeshMapPreferences');
		var mesh_id = win.meshId;       
        form.submit({
            clientValidation: true,
            url: me.getUrlMapPrefEdit(),
			params: {
				mesh_id: mesh_id
			},
            success: function(form, action) {
                win.close();
                Ext.ux.Toaster.msg(
                    i18n('sItem_updated'),
                    i18n('sItem_updated_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },
            failure: Ext.ux.formFail
        });
    },
    NodeAdd: function(button){
        var me 		= this;
		var tabEdit = button.up('pnlMeshEdit');
		var mesh_id	= tabEdit.meshId;
		var add_id  = 'winMeshMapNodeAdd_'+mesh_id;
		var map_p	= tabEdit.down('pnlMeshEditLeafletMap');

        if(!Ext.WindowManager.get(add_id)){
            var w = Ext.widget('winMeshMapNodeAdd',{id: add_id,mapPanel: map_p,meshId:mesh_id,mapType:me.getMapType()});
            me.getView().add(w);
            w.show()     
       }   
    },
    NodeAddSubmit: function(button){
        var me      = this;
        var win     = button.up('winMeshMapNodeAdd');
        var node    = win.down('cmbMeshAddMapNodes');
        var id      = node.getValue();
		var pnl		= win.mapPanel
        win.close();   
        var ll      = me.getView().down('cmpLeafletMapView').map.getCenter();
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
            title       : "New Marker",
            dragged     : false,
            id          : id
        };
                             
        var marker  = L.marker(ll,m_options);
        marker.addTo(me.getView().down('cmpLeafletMapView').getFgMarkers()); 
        var s_init = "<div style='padding:5px;margin:5px; height:100px; width:200px;'>"+
        "<div class='lblRdReq'>"+
            i18n("sAction_required")+
         "</div><div class='lblRd'>"+
            "Drag and drop marker to required position"+
        "</div></div>";       
        marker.on('dragstart',me.dragStart, me); //We bind these events to the scipe of this viewcontroller (me)
        marker.on('dragend',  me.dragEnd, me);   //We bind these events to the scipe of this viewcontroller (me)
        marker.bindPopup(s_init).openPopup();
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
					me.reload();
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
					me.reload();
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
});

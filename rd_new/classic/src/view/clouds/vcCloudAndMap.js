Ext.define('Rd.view.clouds.vcCloudAndMap', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcCloudAndMap',
    config: {
        UrlMapDelete            : '/cake3/rd_cake/clouds/map-delete.json',
        UrlMapSave              : '/cake3/rd_cake/clouds/map-save.json',   
        urlBlue                 : 'resources/css/images/marker-icon-2x-blue.png',
        urlBlack                : 'resources/css/images/marker-icon-2x-black.png',
        urlRedNode              : 'resources/css/images/marker-icon-2x-orange.png',
        urlRedGw                : 'resources/css/images/marker-icon-2x-red.png',
        urlGreenNode            : 'resources/css/images/marker-icon-2x-green.png',
        urlGreenGw              : 'resources/css/images/marker-icon-2x-dark-green.png',
        urlViolet               : 'resources/css/images/marker-icon-2x-violet.png',
		mapType                 : 'Leaflet', //Default
		lastMovedMarker         : null,
		lastOrigPosition        : null		        
    },
       
	placeMarker: function(record){
	    var me  = this;            	  
        var lat = record.get('lat');
        var lng = record.get('lng');
               
        //IF the item never been placed on a map before; we will just take a snapshot of the curren centre and use that
        if((lat == null)||(lng == null)){
            var ll = me.getView().down('cmpLeafletMapView').map.getCenter();     
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
            title       : record.get('name'),
            dragged     : false,
            id          : record.get('id')
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
        
        if(me.getView().down('cmpLeafletMapView').getMarkerCount() <= 1){
            me.getView().down('cmpLeafletMapView').centerMarkers({maxZoom:7}); //Only one zoom out a bit
        }else{
            me.getView().down('cmpLeafletMapView').centerMarkers(); //More than one we can soon in nicely
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
        var me      = this;
        var pnl     = btn.up('panel'); 
        var params  = pnl.getData();    
        Ext.Ajax.request({
            url: me.getUrlMapSave(),
            method  : 'GET',
            params  : params,
            success : function(response){
                var jsonData    = Ext.JSON.decode(response.responseText);
                if(jsonData.success){
                    Ext.ux.Toaster.msg(
                        i18n('sItem_updated'),
                        i18n('sItem_updated_fine'),
                        Ext.ux.Constants.clsInfo,
                        Ext.ux.Constants.msgInfo
                    );
					var tt = me.getView().down('treeClouds');
                    var record = tt.getStore().getById(params.id);
                    record.set('lat',params.lat);
                    record.set('lng',params.lng);
                    me.getView().down('cmpLeafletMapView').centerMarkers(); //More than one we can soon in nicely
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
        var me      = this;
        var pnl     = btn.up('panel');
        var params  = pnl.getData();
        Ext.Ajax.request({
            url     : me.getUrlMapDelete(),
            method  : 'GET',
            params  : params,
            success : function(response){
                var jsonData    = Ext.JSON.decode(response.responseText);
                if(jsonData.success){
                    Ext.ux.Toaster.msg(
                        i18n('sItem_deleted'),
                        i18n('sItem_deleted_fine'),
                        Ext.ux.Constants.clsInfo,
                        Ext.ux.Constants.msgInfo
                    );
                    var tt = me.getView().down('treeClouds');
                    var record = tt.getStore().getById(params.id);
                    record.set('lat',null);
                    record.set('lng',null);
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

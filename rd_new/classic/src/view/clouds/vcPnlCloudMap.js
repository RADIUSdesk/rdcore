Ext.define('Rd.view.clouds.vcPnlCloudMap', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcPnlCloudMap',
    config: {
        urlMapPrefView          : '/cake4/rd_cake/mesh-overviews-light/index-map.json',
        urlBlueMark             : 'resources/images/map_markers/mesh_blue_node.png',
        urlRedNode              : 'resources/images/map_markers/mesh_red_node.png',
        urlRedGw                : 'resources/images/map_markers/mesh_red_gw.png',
        urlGreenNode            : 'resources/images/map_markers/mesh_green_node.png',
        urlGreenGw              : 'resources/images/map_markers/mesh_green_gw.png',
        UrlMapDelete            : '/cake4/rd_cake/clouds/map-delete.json',
        UrlMapSave              : '/cake4/rd_cake/clouds/map-save.json',
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
	addMarker: function(record){
	    var me      = this;
	    var icon    = me.getUrlBlueMark(); // Default for state
	    
	    //Create in info window PER marker
        var i_div 		=  document.createElement('div');
        i_div.className = i_div.className + "mapEditDiv";
        var infowindow = new google.maps.InfoWindow({
            content: i_div
        });
        infowindow.filled = false;
        
        var lat = record.get('lat');
        var lng = record.get('lng');
        
        //IF the item never been placed on a map before; we will just take a snapshot of the curren centre and use that
        if((lat == 0)&&(lng == 0)){
            var m_center 	= me.getView().gmap.getCenter();
            lat = m_center.lat();
            lng = m_center.lng();
        }       
        google.maps.event.addListener(infowindow, 'domready', function(){ 
            if(infowindow.filled == false){        
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
				    data    : {lat:lat,lng:lng},
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
                        },
                        {
                            xtype   : 'button',
                            itemId  : 'delete',
                            text    : i18n('sDelete'),
                            scale   : 'large',
                            glyph   : Rd.config.icnDelete,
                            listeners       : {
				                click : function(btn){
				                    me.onBtnDelete(sel_marker)
				                }
		                    }
                        }  
                    ],
                    renderTo: infowindow.getContent()
                });
                infowindow.filled = true;
                infowindow.panel = e_pnl;
            }                      
        }); 
	    
	    var sel_marker = me.getView().addMarker({
            lat     : lat,
            lng     : lng,
            icon    : icon,
            draggable: true, 
            title   : record.get('name'),
            id      : record.get('id'),
            infowindow : infowindow,
            //END Extras Specific
            listeners: {
                dragend: function(){
                    me.dragEnd(sel_marker);
                },
                dragstart: function(){
                    me.dragStart(sel_marker);
                }
            }
        });       
        me.getView().addwindow.open(me.getView(), sel_marker);         
	},
	dragStart: function(marker){
	    var me = this;
	    marker.infowindow.close(me.getView(),marker);
	    me.lastMovedMarker  = marker;
        me.lastOrigPosition = marker.getPosition();
	},
	dragEnd: function(marker){
	    var me = this;
	    me.getView().addwindow.close();
	    var l_l         = marker.getPosition();
        me.lastLng      = l_l.lng();
        me.lastLat      = l_l.lat();
        me.lastDragId   = marker.id;
	    marker.infowindow.open(me.getView(),marker);
	    Ext.defer(function () {    
            marker.infowindow.panel.setData({lat:l_l.lat(),lng:l_l.lng()});
        },50);
	},
	onBtnSave: function(marker){
	    var me = this;
	    Ext.Ajax.request({
            url: me.getUrlMapSave(),
            method: 'GET',
            params: {
                id: me.lastDragId,
                lat: me.lastLat,
                lon: me.lastLng
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
                    var tt = me.getView().up('pnlCloudAndMap').down('treeClouds');
                    var record = tt.getStore().getById(me.lastDragId);
                    record.set('lat',me.lastLat);
                    record.set('lng',me.lastLng);
                }   
            },
            scope: me
        });
	},
	onBtnCancel: function(marker){
        var me = this;
        marker.infowindow.close();
        me.lastMovedMarker.setPosition(me.lastOrigPosition);
    },
	onBtnDelete: function(marker){
	    var me = this;
	    marker.setMap(null);  
	    Ext.Ajax.request({
            url: me.getUrlMapDelete(),
            method: 'GET',
            params: {
                id: me.lastDragId
            },
            success: function(response){
                var jsonData    = Ext.JSON.decode(response.responseText);
                if(jsonData.success){     
                    marker.infowindow.close();
                    Ext.ux.Toaster.msg(
                        i18n('sItem_deleted'),
                        i18n('sItem_deleted_fine'),
                        Ext.ux.Constants.clsInfo,
                        Ext.ux.Constants.msgInfo
                    );
					var tt = me.getView().up('pnlCloudAndMap').down('treeClouds');
                    var record = tt.getStore().getById(me.lastDragId);
                    record.set('lat',0);
                    record.set('lng',0);
                }   
            },
            scope: me
        });    
	}	
});

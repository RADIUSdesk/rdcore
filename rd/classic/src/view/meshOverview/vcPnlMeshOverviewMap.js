
Ext.define('Rd.view.meshOverview.vcPnlMeshOverviewMap', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcPnlMeshOverviewMap',
    config: {
        urlMapSave      : '/cake4/rd_cake/mesh-overview-maps/map-save.json',
        urlMapOrangeW   : 'resources/images/map_markers/orange_w.png',
        urlMapBlueW     : 'resources/images/map_markers/blue_w.png',
        urlMapPurpleW   : 'resources/images/map_markers/purple_w.png',
        urlMapGreenW    : 'resources/images/map_markers/green_w.png',
        urlMapSeaGreenW : 'resources/images/map_markers/sea_green_w.png',
        urlMapDeepBlueW : 'resources/images/map_markers/d_blue_w.png',
        urlMapOrangeOrange  : 'resources/images/map_markers/orange_orange.png',
        urlMapBlueBlue      : 'resources/images/map_markers/blue_blue.png',
        urlMapGreenGreen    : 'resources/images/map_markers/green_green.png',
        urlMapRedRed    : 'resources/images/map_markers/red_red.png'
    }, 
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
    }
});

Ext.define('Rd.view.networkOverview.vcNetworkOverviewMap', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcNetworkOverviewMap',
    config: {
        urlNetworkMap   : '/cake3/rd_cake/clouds/index_network_map.json',
        timespan        : 'now',
        nodeId          : 0,
        urlBlue         : 'resources/css/images/marker-icon-2x-blue.png',
        urlBlack        : 'resources/css/images/marker-icon-2x-black.png',
        urlRedNode      : 'resources/css/images/marker-icon-2x-orange.png',
        urlRedGw        : 'resources/css/images/marker-icon-2x-red.png',
        urlGreenNode    : 'resources/css/images/marker-icon-2x-green.png',
        urlGreenGw      : 'resources/css/images/marker-icon-2x-dark-green.png',
        urlViolet       : 'resources/css/images/marker-icon-2x-violet.png',
        urlOrange       : 'resources/css/images/marker-icon-2x-orange.png',
        urlMapSave	    : '/cake3/rd_cake/clouds/map_node_save.json',
        urlMapDelete    : '/cake3/rd_cake/clouds/map_node_delete.json',
        lastMovedMarker : null,
		lastOrigPosition: null		
    },
    control: {     
        '#toolEditNode': {
            click: 'toolEditNode'         
        },
        'treeNetworkOverview': {
            select      : 'onTreeNodeSelect'
        },
        'cmpLeafletMapView': {
            afterrender : 'OnCmpAfterrender'
        }
    },
    OnCmpAfterrender: function(cmp){
        var me = this;
        console.log("On afterrender");
        me.getView().down('cmpLeafletMapView').getFgMarkers().on('popupopen', function (e){
        
            console.log("Popup Open Pappie");
        
        },me);       
    },
    onMarkerClick: function(id){
        var me      = this;  
        me.setNodeId(id);
        me.reload();
    },   
    onBtnReload: function(button){
        var me = this;
        me.getView().down('treeNetworkOverview').getStore().reload();
        me.getView().down('pnlNetworkOverviewMapLeaflet').getController().clearLayers();    
    },   
    onTreeNodeSelect: function(tree,record,index){
        var me      = this;  
        me.setNodeId(record.id);
        me.reload();
    },
    onTreeNodeClick : function(tree,record,index){
        var me      = this;  
        me.setNodeId(record.id);
        me.reload();
    },
    onBtnHome: function(button){
        var me = this;
        me.setNodeId(0);
        me.reload();
        me.getView().down('treeNetworkOverview').collapseAll();
    },
    onClickNowButton: function(button){
        var me = this;  
        me.setTimespan('now');
        me.reload();
    }, 
    onClickDayButton: function(button){
        var me = this;  
        me.setTimespan('daily');
        me.reload();
    }, 
    onClickWeekButton: function(button){
        var me = this;  
        me.setTimespan('weekly');
        me.reload();     
    }, 
    onClickMonthButton: function(button){
        var me = this;  
        me.setTimespan('monthly');
        me.reload();
    },
    reload: function(){
        var me = this;     
        var me      = this;
        var dd      = Ext.getApplication().getDashboardData();
        var tz_id   = dd.user.timezone_id;
        me.getView().down('pnlNetworkOverviewMapLeaflet').setLoading(true);
        Ext.Ajax.request({
            url     : me.getUrlNetworkMap(),
            method  : 'GET',
            params  : {
                'node'          : me.getNodeId(),
                'timespan'      : me.getTimespan(),      
                'timezone_id'   : tz_id
            },
            success : function(response){
                me.getView().down('pnlNetworkOverviewMapLeaflet').setLoading(false);
                var jsonData    = Ext.JSON.decode(response.responseText);
                if(jsonData.success){
                    if(jsonData.metaData){
                        me.doMetaData(jsonData.metaData);
                    }
                    me.clearLayers(); 
                    Ext.Array.forEach(jsonData.items,function(item){
                        //console.log(item);
                        if(item.lat !== null){
                            me.addMarker(item);
                        }        
                    })
                    me.getView().down('cmpLeafletMapView').centerMarkers();
                    if(jsonData.connections){
                        Ext.Array.forEach(jsonData.connections, function (c) {
                            me.addPolyLine(c);
                        });    
                    }                    
                }   
            },
            scope: me
        });
    },
    toolEditNode: function(){
        var me = this;
        var sr = me.getView().down('treeNetworkOverview').getSelectionModel().getLastSelected();
        if(sr){    
            me.getView().down('pnlNetworkOverviewMapLeaflet').getController().editNode(sr);
        }else{
            Ext.ux.Toaster.msg(
                'Select an item',
                'Select An Item to Edit From the NAVIGATOR',
                Ext.ux.Constants.clsWarn,
                Ext.ux.Constants.msgWarn
            );
        } 
    },
    doMetaData: function(md){
        var me      = this;    
        var main    = me.getView();     
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
    clearLayers: function(){
        var me = this;
        me.getView().down('cmpLeafletMapView').getFgMarkers().clearLayers();
        me.getView().down('cmpLeafletMapView').getFgPolygons().clearLayers();   
    },
    addMarker: function(item){
        var me = this;
        
        /*'white', 'red','darkred', 'lightred', 'orange', 
        'beige', 'green', 'darkgreen', 'lightgreen', 'blue', 'darkblue', 
        'lightblue', 'purple', 'darkpurple', 'pink', 'cadetblue', 
        'white', 'gray', 'lightgray', 'black'*/
        
        var icon_img    = me.getUrlBlack();
        var markerColor = 'black'
        var draggable   = false;
        var font_icon   = 'coffee';
        
        if((item.level == 'NodeMarker')||(item.level == 'ApMarker')){
            draggable = true;
        }
        
        if(item.level == 'Clouds'){
            font_icon = 'cloud';
        }
        
        if(item.level == 'Sites'){
            font_icon = 'building';
        }
        
        if(item.level == 'Networks'){
            font_icon = 'sitemap';
        }
        
        if((item.level == 'NodeMarker')&(item.gateway == true)){
            font_icon = 'cubes';
        }
        
        if((item.level == 'NodeMarker')&(item.gateway == false)){
            font_icon = 'cube';
        }
        
        if(item.level == 'ApMarker'){
            font_icon = 'wifi';
        }
               
        if(item.down_flag == true){
            icon_img = me.getUrlOrange();
            markerColor = 'orange';
        }
        
        if ((item.down_flag == true) & (item.gateway == true)) {                            
            icon_img = me.getUrlRedGw();
            markerColor = 'darkred';
        }
        
        if(item.down_flag == false){
            icon_img = me.getUrlGreenNode();
            markerColor = 'green';
        }
        if((item.down_flag == false)&(item.gateway == true)){
            icon_img = me.getUrlGreenGw();
            markerColor = 'darkgreen';
        }
        
        if(item.not_placed == true){
            icon_img = me.getUrlViolet();
            markerColor = 'purple';
        }
        
        var icon    = new L.Icon({
            iconUrl     : icon_img,
            shadowUrl   : 'resources/css/images/marker-shadow.png',
            iconSize    : [25, 41],
            iconAnchor  : [12, 41],
            popupAnchor : [1, -34],
            shadowSize  : [41, 41]
        });
        
        var fontMarker = L.AwesomeMarkers.icon({
            icon        : font_icon,
            markerColor : markerColor
        });
                  
        var m_options = {
            icon        : fontMarker,
            title       : item.name,
            dragged     : false,
            draggable   : draggable,
            id          : item.id,
            level       : item.level,
            node_info   : item
        };                                                 
        var marker  = L.marker([ item.lat , item.lng ],m_options);
        marker.addTo(me.getView().down('cmpLeafletMapView').getFgMarkers());                           
        marker.on('click', me.markerClickNode, me);
        marker.on('dragstart',me.dragStart, me); //We bind these events to the scipe of this viewcontroller (me)
        marker.on('dragend',  me.dragEnd, me);   //We bind these events to the scipe of this viewcontroller (me) 
    },
    markerClickNode: function(e){
	    var me      = this;
	    var options = e.target.options;
	    if((options.level == 'Clouds')||(options.level == 'Sites')){
	        me.setNodeId(e.target.options.id);
	        me.reload(); 
	        var tree    = me.getView().down('treeNetworkOverview');
	        var t_store = tree.getStore();
	        var node    = t_store.getNodeById(me.getNodeId());
	        if(node == undefined){
	            console.log("O Gatta Hierdie een is missing");
	        }else{
	            tree.expandNode(node);
	        }
	    }
	        
	    if(options.level == 'Networks'){
	        //This is a special treatment
	        me.setNodeId('Marker'+e.target.options.id);
	        me.reload();
	    }
	    
	    if((options.level == 'NodeMarker')|(options.level == 'ApMarker')){
	        e.target.unbindPopup();
	        var p = L.popup();
            e.target.bindPopup(p); //Bind IT    
            e.target.openPopup();  //Open IT
            p.update();
            
            var i = e.sourceTarget.options.node_info; 
            var element = Ext.get(p.getElement());
            var c = element.selectNode('.leaflet-popup-content');
            var populated = element.selectNode('.x-panel');
            if(populated){
                Ext.get(c).setWidth(330); 
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
                    "<label class='lblMap'>Lat</label><label class='lblValue'> {lat}</label>",
                    "<div style='clear:both;'></div>",
                    "<label class='lblMap'>Lng</label><label class='lblValue'> {lng}</label>",
                "</div>"
                ]
            );
            
            Ext.create('Ext.panel.Panel', {
                width		: 310,
                height		: 130,
                layout		: 'fit',
                bodyPadding : 2,
                tpl         : tpl,
                autoScroll  : true,
                data        : i,
                renderTo    : c
            });
             
            p.update();
            Ext.get(c).setWidth(330);   
	    
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
	}  
	   
});

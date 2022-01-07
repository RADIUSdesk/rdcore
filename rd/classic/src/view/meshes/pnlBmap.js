

 Ext.define('Rd.view.meshes.BMapPanel', {
     extend: 'Ext.Panel', 
     alias: 'widget.pnlBmap', 
     requires: ['Ext.window.MessageBox'],
     mapReadyListener:function(){},

    initComponent: function () {
        Ext.applyIf(this.bmap, this.config);
         this.callParent();
     },
    markers:[],
    infowindow:undefined,
    showInfoWindow:function(marker,marker_data)
    {
        var me =this;
           

            var c = me.infowindow.content;

            c = new Ext.Element(document.createElement('div'));
            c.className = c.className + " minusz mapInfoDiv";
          
            Ext.get(this.bmap.Va.id).appendChild(c.dom)

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
			if(marker_data.state == 'down'){
				dis = true;
			}
           
			var node_id = marker_data.id;
            
            me.i_pnl = Ext.create('Ext.tab.Panel', {
                itemId		: 'pnlMapsNodeInfo',
                width		: 350,
                height		: 248,
				layout		: 'fit',
                activeTab	: 0,
				nodeId		: node_id,
				meshId		: marker_data.meshId,	
                items: [
                    {
                        title: 'Info',
                        itemId: 'tabMapsNodeInfo',
                        bodyPadding: 2,
                        tpl : tpl,
                        autoScroll: true,
                        data: marker_data,
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
                 renderTo :c
                
            });

         var info = new BMap.InfoWindow(c.dom.outerHTML);
  
         marker.openInfoWindow(info);
         c.hide();

    },
    afterRender: function () {
         //设置panel属性
         var me =this;

         var wh = this.ownerCt.getSize();
         Ext.applyIf(this, wh);
         this.callParent();

         
             
        if (me.bmapType === 'map') {
             me.bmap = new BMap.Map(me.body.dom);
         }
 
         if (me.bmapType === 'map') {
             //me.bmap.centerAndZoom(me.centerCity, me.zoomLevel); //设置初始化中心点
         }
 
        var i_div 		=  document.createElement('div');
        i_div.className = i_div.className + "mapInfoDiv";
        me.infowindow = new  BMap.InfoWindow(i_div);
       
    
         me.onMapReady(); //地图加载项
         
 
         //设置百度地图属性
        
     },
     setViewPort:function(points){
          this.bmap.setViewport(points); //设置初始化中心点
     },
     centerAndZoom:function(point,zoomLevel){
          this.bmap.centerAndZoom(point, zoomLevel);
     },
     onMapReady: function () {
         this.addMapConfigs(); //添加地图属性
         this.addMapControls(); //添加地图控件
         this.addMapMarkers(this.markers); //添加标记
         this.mapLoadedTrigger(this);
     },
     getMap: function () {
         return this.bmap;
     },
     addMapMarkers: function (markerArray) {
         if (Ext.isArray(markerArray)) {
             for (var i = 0; i < markerArray.length; i++) {
                 this.addMapMarker(markerArray[i]);
             }
         }
     },
     clearMarkers:function(){
          this.bmap.clearOverlays();
     },
     addMarker: function (markerParam) {
         var point = new BMap.Point(markerParam.lng, markerParam.lat); //创建图点
      
 
        var icon = new BMap.Icon(markerParam.icon, new BMap.Size(32, 37), {
            anchor: new BMap.Size(16, 35),
             infoWindowAnchor: new BMap.Size(10, 0)
        });
        var mkr = new BMap.Marker(point, {
            icon: icon,
            title: markerParam.title
        });

         if (markerParam.isDragging == true)
             mkr.enableDragging();
         else
             mkr.disableDragging();
 
         this.getMap().addOverlay(mkr); //标记覆盖入地图

     

        mkr.addEventListener('click',function(){markerParam.listeners.click(mkr)} );

     },  
      addPolyLine: function(line){		
		
       	var polyline = new BMap.Polygon(
        [
                new BMap.Point( line.from.lng,line.from.lat),
                new BMap.Point(line.to.lng,line.to.lat)
        ],
        {strokeColor: line.color, strokeWeight:line.weight, strokeOpacity:line.opacity}); 

            //增加折线

	  this.getMap().addOverlay(polyline); //标记覆盖入地图
	
     },
     addMapControls: function () {
         
         if (Ext.isArray(this.mapControls)) {
             for (var i = 0; i < this.mapControls.length; i++) {
                 this.addMapControl(this.mapControls[i]);
             }
         }
     },
     addMapControl: function (controlParam) {
         
         var controlBase = new BMap[controlParam.controlName](controlParam);
         this.getMap().addControl(controlBase);
     },
     addMapConfigs: function () {
         if (Ext.isArray(this.mapConfigs)) {
             for (var i = 0; i < this.mapConfigs.length; i++) {
                 this.addMapConfig(this.mapConfigs[i]);
             }
         } else if (typeof this.mapConfigs === 'string') {
             this.addMapConfig(this.mapConfigs);
         }

     },
     addMapConfig: function (configParam) {
         this.getMap()[configParam]();
     }
 });
Ext.define('Rd.view.meshes.pnlMeshViewMapGoogle', {
    extend  :'Ext.ux.GMapPanel',
    alias   :'widget.pnlMeshViewMapGoogle',
    markers : [],
    infoWindows : [],
	polyLines	: [],  
    dockedItems: [
        {
            xtype   : 'toolbar',
            dock    : 'top',
            items   : [
                {
                    ui      : 'button-orange', 
                    glyph   : Rd.config.icnReload, 
                    scale   : 'small', 
                    itemId  : 'reload', 
                    tooltip : i18n('sReload'),
                    listeners       : {
				        click : 'onBtnReload'
		            }
                },
                {
                    xtype       : 'cmbMesh',
                    width       : 430,
                    labelWidth  : 50, 
                    listeners   : {
                        change : 'onCmbMeshChange'           
                    }  
                },
                '->',
                {
                    ui      : 'button-pink',
                    scale   : 'small', 
                    glyph   : Rd.config.icnBack, 
                    text    : 'Back',
                    hidden  : true,
                    reference: 'btnOverview',
                    listeners : {
				        click : 'onBtnOverview'
		            }
                }
            ]
        },
        {
            itemId      : 'cntBanner',
            reference   : 'cntBanner',
            xtype       : 'container',
            dock        : 'top',
            style       : { 
                background  : '#adc2eb',
                textAlign   : 'center'
            },
            height      : 50,
            tpl     : new Ext.XTemplate(
                '<h2 style="color:#ffffff;font-weight:lighter;"><span style="color:#737373;font-size:smaller;">',
                '<tpl if="type==\'user\'">',
                    '<i class="fa fa-angle-right">',
                '</tpl>',
                '<tpl if="type==\'device\'">',
                    '<i class="fa fa-angle-double-right">',
                '</tpl>',
                '</i>  VIEWING   </span>',
                '<tpl if="type==\'realm\'">',
                    '<i class="fa fa-vector-square"></i> {item_name}',
                '</tpl>',
                '<tpl if="type==\'user\'">',
                    '<i class="fa fa-user"></i> {item_name}',
                '</tpl>',
                '<tpl if="type==\'device\'">',
                    '<i class="fa fa-tablet"></i> {mac}',
                '</tpl>',
                '<tpl if="historical== true">',
                    '  <span style="color:#737373;font-size:x-small;"><i class="fa fa-history"></i> {date_human}</span>',
                '<tpl else>',
                    '  <span style="color:green;font-size:x-small;"><i class="fa fa-circle"></i></span>',
                '</tpl>',
                '</h2>'
            ),
            data    : {
            }
        }
    ],
    requires	: [
        'Rd.view.meshes.vcMeshViewMapGoogle',
        'Rd.view.components.cmbMesh'
    ],
    controller  : 'vcMeshViewMapGoogle',
    listeners       : {
        show : 'loadMapOverview' //Trigger a load of the settings (This is only on the initial load)
    },
    initComponent: function(){
        var me = this;
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


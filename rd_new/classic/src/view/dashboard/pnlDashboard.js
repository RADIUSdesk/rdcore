Ext.define('Rd.view.dashboard.pnlDashboard', {
    extend  : 'Ext.panel.Panel',
    alias   : 'widget.pnlDashboard',
    layout  : 'border',
    dashboard_data  : undefined,
    requires: [
    	//'Rd.view.components.cmbClouds'
  	],
    initComponent: function () {
        var me 		= this;
        
        var lA      = Rd.config.levelAColor; 
        var stA     = 'color:'+lA+';font-weight:200; font-size: smaller;';
        var header  = me.dashboard_data.white_label.hName;
        var img  	= me.dashboard_data.white_label.imgFile;
        var fg      = me.dashboard_data.white_label.hFg;     
        var tpl = new Ext.XTemplate(
            '<img src="resources/images/logo.png" alt="Logo" style="float:left; padding-right: 20px;">',
            '<h3 style="color:{hFg};font-weight:800;">{hName}<span style="'+stA+'"></h3>');
        
        var hNav = {
            xtype   : 'tbtext',
            itemId  : 'tbtHeader', 
            tpl     : tpl,
            data    : { hName:header,imgFile:img,hFg:fg}
        };
        
        var tl = {
    		xtype: 'treelist',
    		ui	: 'nav2',
    		itemId : 'tlNav',
    		expanderFirst: false,
    		margin: '0 0 0 5',
    		micro: false,
			store: {
				root: {
				expanded: true,
					children: [{
						text: 'OVERVIEW',
						id	: 1,
						leaf: true,
						iconCls: 'x-fa  fa-th-large'
					}, 
					{
						text: 'RADIUS USERS',
						id	: 2,
						expanded: false,
						iconCls: 'x-fa fa-user',
						children: [
							{
								text: 'USERS',
								leaf: true,
								id	: 3,
								iconCls: 'x-fa fa-user'
							},
							{
								text: 'VOUCHERS',
								leaf: true,
								id	: 4,
								iconCls: 'x-fa fa-tag'
							},
							{
								text: 'TOP-UPS',
								leaf: true,
								id	: 5,
								iconCls: 'x-fa  fa-coffee'
							},
						]
					},
					{
						text: 'RADIUS COMPONENTS',
						expanded: false,
						id	: 6,
						iconCls: 'x-fa fa-dot-circle-o',
						children: [{
							text: 'PROFILES',
							leaf: true,
							id	: 7,
							iconCls: 'x-fa  fa-cubes'
						}, {
						    text: 'REALMS',
						    leaf: true,
						    id	: 8,
						    iconCls: 'x-fa fa-group'
						}]
					},
					{
						text: 'NETWORKS',
						id	: 8,
						expanded: false,
						leaf: true,
						iconCls: 'x-fa fa-wifi',						
					}
					 
					]

				}
			}
   		};
        
        var h1 = {
            xtype   : 'button',
            itemId	: 'btnExpand',
            glyph   : Rd.config.icnMenu,
            scale   : 'medium'
        };   
      	var h_items = [ h1,'->' ];
               
     	me.items 	= [
			{
				region	:'west',
				xtype	: 'panel',
				//width	: 55,
				dynamic  : true,
				width	: 220,
				itemId	: 'pnlWest',
				layout	: 'fit',
				border	: false,
				componentCls: 'border-right',
				dockedItems : [
				    {
				        xtype   : 'toolbar',
				        dock    : 'top',
				        height	: 70,
				        ui      : 'default',
				        items   : [
				        	hNav
				        ]
				    },
				],
				items : [
					tl
				]	
			},
			{
				region	: 'center',     // center region is required, no width/height specified
				xtype	: 'panel',
				layout	: 'fit',
				items	: [{
					xtype  : 'panel',
					margin : '0 0 0 0',
					layout : 'card',
					itemId : 'pnlCenter',
					items  : [
					
					]
				}],
				dockedItems : [
				    {
				        xtype   : 'toolbar',
				        height	: 70,
				        dock    : 'top',
				        ui      : 'default',
				        items   : h_items
				    }
				]
			}
		];     
      	this.callParent();  
    }
});



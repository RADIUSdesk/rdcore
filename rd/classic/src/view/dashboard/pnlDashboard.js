Ext.define('Rd.view.dashboard.pnlDashboard', {
    extend  : 'Ext.panel.Panel',
    //alias   : 'widget.pnlDashboard',
    xtype   : 'pnlDashboard',
    layout  : 'border',
    dashboard_data  : undefined,
    requires: [
    	'Rd.view.components.cmbClouds'
  	],
    initComponent: function () {
        var me 		 = this;     
        var username =  me.dashboard_data.user.username;      
        //Some initial values
        var header  = Rd.config.headerName;
        var lA      = Rd.config.levelAColor; 
        var stA     = 'color:'+lA+';font-weight:200; font-size: smaller;';
        var tpl     = new Ext.XTemplate('<h1>'+header+'<span style="'+stA+'"> | <span style="font-family:FontAwesome;">{fa_value}</span> {value}</span><h1>');
        
        var style   = {}; //Empty Style
        var imgActive = false; //No Image
        var imgFile   = '';
        var fg      = false;
        if(me.dashboard_data.white_label.active == true){
            header  = me.dashboard_data.white_label.hName;
            footer  = me.dashboard_data.white_label.fName;
            
            var bg  = me.dashboard_data.white_label.hBg;
            style   = {
                'background' : bg
            };
            
            fg              = me.dashboard_data.white_label.hFg;
            var img         = me.dashboard_data.white_label.imgFile;
            if(me.dashboard_data.white_label.imgActive == true){
                imgActive = true;
            }
            var tpl = new Ext.XTemplate(
            '<tpl if="imgActive == true">',
                '<img src="{imgFile}" alt="Logo" style="float:left; padding-right: 10px; padding-left: 10px;padding: 10px;">',
            '</tpl>',
            '<h1 style="color:{hFg};font-weight:100;padding-top: 10px;">{hName}<span style="'+stA+'"> | <span style="font-family:FontAwesome;">{fa_value}</span> {value}</span><h1>');           
        }
        
        var txtH = {
            xtype   : 'tbtext',
            itemId  : 'tbtHeader', 
            tpl     : tpl,
            data    : { hName:header,imgFile:img,hFg:fg,imgActive: imgActive}
        };

        var micro = false
        var west_width = 180;
        if(me.dashboard_data.compact){
            micro = true;
            west_width = 55;
        }
/*
        //---Work in progress---
        Ext.define('Rd.view.dashboard.dashboardTreeList', {
            extend  : 'Ext.list.Tree',
            xtype   : 'dashboardTreeList',
            ui	    : 'nav2',
            store   : {root:{'id':0}},
            margin  : '0 0 0 5',
            micro   : micro,
            expanderFirst: false,
            expanderOnly: true,
            element: {
                reference: 'element',
                listeners: {
                    click: 'onClick',
                    mouseenter: 'onMouseEnter',
                     mouseenter: Ext.emptyFn,
                     mouseover: Ext.emptyFn,
                    mouseleave: 'onMouseLeave',
                },
                children: [{
                    reference: 'toolsElement',
                    listeners: {
                        mouseover: Ext.emptyFn,
                        mouseover: 'onToolStripMouseOver'
                    }
                }]
            }
        });
 */             
        var tl = {
    		xtype   : 'treelist',
    		ui	    : 'nav2',
    		itemId  : 'tlNav',
    		margin  : '0 0 0 5',
			store   : {root:{'id':0}},
            micro   : micro,
            expanderFirst: false
   		};
        
        var h1 = {
            xtype   : 'button',
            itemId	: 'btnExpand',
            glyph   : Rd.config.icnMenu,
            scale   : 'medium'
        };
        var h3 = {
            xtype   : 'button',
            glyph   : Rd.config.icnUser,
            text    : username,
            scale   : 'medium',
            menu    : [
                {   text:i18n('sSettings'),    glyph : Rd.config.icnSpanner,itemId: 'mnuSettings'},
                {   text:i18n('sPassword'),    glyph : Rd.config.icnLock,   itemId: 'mnuPassword'},'-',
                {   text:i18n('sLogout'),      glyph : Rd.config.icnPower,  itemId: 'mnuLogout'}
            ] 
        };

        //Only set the width of the button on long usernames
        if(username.length > 10){
            h3.width = 150;
        }

        var h2 = {
            xtype   : 'button',
            itemId	: 'btnTreeLoad',
            glyph   : Rd.config.icnWizard,
            itemId  : 'btnSetupWizard',
            scale   : 'medium'
        };
      	
      	var cmbCloud = {
        	xtype	    : 'cmbClouds',
        	width       : 380,
            labelWidth  : 30,
            userCls     : 'rdCombo',
         //   labelClsExtra   : 'lblRd',
            fieldLabel  : '<span style="font-family:FontAwesome;font-size: 24px;">&#xf0c2</span>'
        }
        
        var h_items = [ txtH,'->',cmbCloud,'|',h2,'|',h3];
        
        if(me.dashboard_data.show_wizard){
            h_items = [ txtH,'->',cmbCloud,'|',h2,'|',h3];
        }
               
     	me.items 	= [
			{
				region	:'west',
				xtype	: 'panel',
				dynamic  : true,
				width	: west_width,
				itemId	: 'pnlWest',
				layout	: 'fit',
				border	: false,
                autoScroll	: true,
				componentCls: 'border-right',
				dockedItems : [
				    {
				        xtype   : 'toolbar',
				        dock    : 'top',
				        height	: 70,
				        ui      : 'default',
                        style   : { 'background' : '#323d4d' },
				        items   : [
				        	h1
				        ]
				    },
				],
				items : [{
                    xtype   : 'container',
                    style   : { 'background' : '#323d4d' },
                    layout	: {
                    	type: 'vbox'
                    },
                    items:	[
                    	{
                    		xtype 	: 'container',
                    		flex	: 1
                    	},                   	
                    	tl,
                    	{
                    		xtype 	: 'container',
                    		flex	: 1
                    	}  
                    ]
                   /* items : {
                            xtype   : 'dashboardTreeList',
                            itemId  : 'tlNav'
                        }*/
					}
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
				        style   : style,
				        items   : h_items
				    }
				]
			}
		];     
      	this.callParent();  
    }
});



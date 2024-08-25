Ext.define('Rd.view.networkOverview.pnlNetworkOverview', {
   extend      : 'Ext.panel.Panel',
    alias       : 'widget.pnlNetworkOverview',
    scrollable  : true,
	layout      : 'border',
	bodyBorder  : false,
    requires    : [
        'Rd.view.networkOverview.vcNetworkOverview',
        'Rd.view.networkOverview.treeNetworkOverview',
        'Rd.view.networkOverview.pnlNetworkOverviewDetail'
    ],
    listeners   : {
       show        : 'reload',
       afterrender : 'reload'
    },
    controller  : 'vcNetworkOverview',
    dockedItems : [   
        {
            xtype   : 'toolbar',
            dock    : 'top',
            items   : [        
                {
                    ui      : 'button-metal', 
                    glyph   : Rd.config.icnHome, 
                    scale   : 'small', 
                    itemId  : 'home', 
                    tooltip : i18n('sHome'),
                    listeners       : {
				        click : 'onBtnHome'
		            }
                },
                '|',
                { 
                    xtype       : 'button', 
                    scale       : 'small',
                    toggleGroup : 'timeSpan',
                    pressed     : true,			
                    text        : 'NOW',
                    ui          : 'button-metal',
                    listeners   : {
                        click: 'onClickNowButton'
                    }
                },                           
                { 
                    xtype       : 'button', 
                    scale       : 'small',
                    toggleGroup : 'timeSpan',		
                    text        : '24 Hours',
                    ui          : 'button-metal',
                    listeners   : {
                        click: 'onClickDayButton'
                    }
                },
                { 
                    xtype       : 'button',
                    ui          : 'button-metal', 
                    text        : '7 Days',
                    toggleGroup : 'timeSpan',   
                    scale       : 'small',
                    listeners   : {
                         click: 'onClickWeekButton'
                    }
                },
                '|',
                { 
                    xtype       : 'button', 
                    ui          : 'button-metal',
                    glyph       : Rd.config.icnNetwork,
                    itemId      : 'btnMeshView',
                    scale       : 'small',
                    pressed     : true,
                    tooltip     : 'Mesh Networks',
                    enableToggle: true,
                    listeners   : {
                         click: 'onClickMeshView'
                    }
                },
                { 
                    xtype       : 'button', 
                    ui          : 'button-metal',
                    glyph       : Rd.config.icnSsid,
                    itemId      : 'btnApView',
                    scale       : 'small',
                    pressed     : true,
                    tooltip     : 'Access Points',
                    enableToggle: true,
                    listeners   : {
                         click: 'onClickApView'
                    }
                },
                '|',              
                {
                    xtype       : 'button',
                    glyph       : Rd.config.icnMap,
                    scale       : 'small',
                    tooltip     : 'Map',
                    listeners   : {
                         click: 'onClickMap'
                    } 
                },
                '|',
                {   
                    xtype   : 'component', 
                    itemId  : 'cmpNavigation',  
                    tpl     : new Ext.XTemplate(
                        "<div style=\"color:#808080;\">",
                        "<tpl if='level_name == \"Networks\"'>",  
                            '<i class="fa fa-cloud"></i> {cloud} <i class="fa fa-building"></i> {site} ',      
                        "</tpl>",
                        "<tpl if='level_name == \"Sites\"'>",  
                            '<i class="fa fa-cloud"></i> {cloud} ',      
                        "</tpl>",
                            '<span style="color:#29465b;"><i class="fa fa-{fa_icon}"></i> {text}</span>',
                        "</div>"
                    ),
                    style  : 'margin-right:5px',
                    data   : [],
                    cls    : 'lblRd'
                }
            ]
        }
    ],
    initComponent: function() {
        var me      = this;        
        me.callParent(arguments);
    },
    items: [
        {
            region  :'west',
            xtype   : 'treeNetworkOverview',
            width   : 270,
            split   : true,
            layout  : 'fit',
            ui      : 'panel-green',
            title   : 'NAVIGATION',
            tools   : [
                {
                    tooltip : 'Reload Tree',
                    itemId  : 'toolReload',
                    glyph   : Rd.config.icnReload,
                    listeners       : {
				        click : 'onBtnReload'
		            }
                }
            ],
            padding : 10,
            border  : true
        },
        {
            region  : 'center',  
            xtype   : 'pnlNetworkOverviewDetail',
            metaData: {},
            padding : 10
        }
    ]
});

Ext.define('Rd.view.softflows.pnlSoftflows', {
   extend      : 'Ext.panel.Panel',
    alias       : 'widget.pnlSoftflows',
    scrollable  : true,
	layout      : 'border',
	bodyBorder  : false,
    requires    : [
        'Rd.view.softflows.vcSoftflows',
        'Rd.view.components.cmbDynamicClient',
        'Rd.view.softflows.gridSoftflows'
    ],
    listeners   : {
       show        : 'reload'
    },
    controller  : 'vcSoftflows',
    dockedItems : [   
        {
            xtype   : 'toolbar',
            dock    : 'top',
            items   : [        
              
                {
                    ui          : 'button-orange', 
                    glyph       : Rd.config.icnReload, 
                    scale       : 'small', 
                    itemId      : 'reload', 
                    tooltip     : i18n('sReload'),
                    listeners   : {
				        click : 'onBtnReload'
		            }
                },
                {
                    xtype       : 'cmbDynamicClient',
                    width       : 480,
                    listeners   : {
				        change : 'onComboChange'
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
                    toggleGroup : 'graph_list', 
                    enableToggle : true, 
                    scale       : 'small', 
                    itemId      : 'graph',
                    pressed     : true,
                    ui          : 'button-metal',
                    glyph       : Rd.config.icnGraph
                },
                { 
                    xtype       : 'button',   
                    toggleGroup : 'graph_list', 
                    enableToggle : true, 
                    scale       : 'small', 
                    itemId      : 'list',
                    ui          : 'button-metal',
                    hidden      : true, //DISABLE FOR NOW
                    glyph       : Rd.config.icnTable
                },
                { 
                    scale       : 'small',
                    itemId      : 'btnBack',
                    glyph       : Rd.config.icnBack,  
                    text        : 'Back',
                    hidden      : true,
                    ui          : 'button-pink'
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
            xtype   : 'gridSoftflows',
            margin  : '0 5 0 5',
            style   : {
                borderTopColor  : '#d1d1d1',
                borderTopStyle  : 'solid',
                borderTopWidth  : '1px'
            }
        }  
    ]
});

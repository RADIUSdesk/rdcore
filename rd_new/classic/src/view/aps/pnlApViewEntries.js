Ext.define('Rd.view.aps.pnlApViewEntries', {
    extend      : 'Ext.panel.Panel',
    alias       : 'widget.pnlApViewEntries',
    apId        : undefined,
    requires    : [
        'Rd.view.aps.cmbApViewSsids'
    ],
    layout      : 'card',
    requires: [
        'Rd.view.aps.vcApViewEntries',
        'Rd.view.aps.gridApViewEntries',
        'Rd.view.aps.pnlApViewEntriesGraph',
        'Rd.view.aps.winApEditMacAlias'  
    ],
    controller  : 'vcApViewEntries',
    initComponent: function() {
        var me   = this;            
        me.tbar  = [
            {   
                xtype   : 'button', 
                glyph   : Rd.config.icnReload , 
                scale   : 'small', 
                itemId  : 'reload',   
                tooltip : i18n('sReload'),
                ui      : 'button-orange'
            },
            {
                xtype       : 'cmbApViewSsids',
                width       : 250,
                labelWidth  : 50,
                apId        : me.apId
            },
            '|',
            {   
                xtype       : 'button', 
                text        : '1 Hour',    
                toggleGroup : 'time_n', 
                enableToggle : true,
                scale       : 'small', 
                itemId      : 'hour', 
                pressed     : true,
                ui          : 'button-metal'
            },
            { 
                xtype       : 'button', 
                text        : '24 Hours',   
                toggleGroup : 'time_n', 
                enableToggle : true, 
                scale       : 'small', 
                itemId      : 'day',
                ui          : 'button-metal' 
            },       
            { 
                xtype       : 'button', 
                text        : '7 Days',     
                toggleGroup : 'time_n', 
                enableToggle : true, 
                scale       : 'small', 
                itemId      : 'week',
                ui          : 'button-metal'
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
                glyph       : Rd.config.icnTable
            },
           // '->',
            { 
                scale       : 'small',
                itemId      : 'btnBack',
                glyph       : Rd.config.icnBack,  
                text        : 'Back',
                hidden      : true,
                ui          : 'button-pink'
            }       
        ];
             
        me.items = [
            { 
                xtype   : 'pnlApViewEntriesGraph',
                role    : 'entries',
                apId    : me.apId,
                margin  : '0 5 0 5'
            },
            { 
                xtype   : 'gridApViewEntries', 
                apId    : me.apId,
                margin  : '0 5 0 5',
                style   : {
                    borderTopColor  : '#d1d1d1',
                    borderTopStyle  : 'solid',
                    borderTopWidth  : '1px'
                }
            }
        ];     
        me.callParent(arguments);
    }
});

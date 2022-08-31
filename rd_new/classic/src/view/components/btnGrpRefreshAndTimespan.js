Ext.define('Rd.view.components.btnGrpRefreshAndTimespan', {
    extend      : 'Ext.container.ButtonGroup',
    xtype       : 'btnGrpRefreshAndTimespan',
    inclTblGraph: false,
    scale       : 'large',
    initComponent: function(){
        var me      = this;
        var scale   = me.scale;
        me.items    = [
            {   xtype   : 'splitbutton', 
                glyph   : Rd.config.icnReload , 
                scale   : scale, 
                itemId  : 'reload',   
                tooltip : i18n('sReload'),
                ui      : 'button-orange', 
                menu    : {
                    items: [
                        '<b class="menu-title">Reload every:</b>',
                        {'text': '30 seconds',  'itemId': 'mnuRefresh30s','group': 'refresh','checked': false },
                        {'text': '1 minute',    'itemId': 'mnuRefresh1m', 'group': 'refresh','checked': false },
                        {'text': '5 minutes',   'itemId': 'mnuRefresh5m', 'group': 'refresh','checked': false },
                        {'text':'Stop auto reload','itemId':'mnuRefreshCancel', 'group': 'refresh', 'checked':true}
                    ]
                }
            },
            {   
                xtype       : 'button', 
                text        : '1 Hour',    
                toggleGroup : 'time_n', 
                enableToggle : true,
                scale       : scale, 
                itemId      : 'hour', 
                pressed     : true,
                ui          : Rd.config.btnUiRefresh
            },
            { 
                xtype       : 'button', 
                text        : '24 Hours',   
                toggleGroup : 'time_n', 
                enableToggle : true, 
                scale       : scale, 
                itemId      : 'day',
                ui          : Rd.config.btnUiRefresh 
            },
            { 
                xtype       : 'button', 
                text        : '7 Days',     
                toggleGroup : 'time_n', 
                enableToggle : true, 
                scale       : scale, 
                itemId      : 'week',
                ui          : Rd.config.btnUiRefresh
            }         
        ];
        
        if(me.inclTblGraph){     
            Ext.Array.push(me.items, [
                 { 
                    xtype       : 'button',   
                    toggleGroup : 'graph_list', 
                    enableToggle : true, 
                    scale       : scale, 
                    itemId      : 'graph',
                    pressed     : true,
                    ui          : Rd.config.btnUiCommon,
                    glyph       : Rd.config.icnGraph
                },
                { 
                    xtype       : 'button',   
                    toggleGroup : 'graph_list', 
                    enableToggle : true, 
                    scale       : scale, 
                    itemId      : 'list',
                    ui          : Rd.config.btnUiCommon,
                    glyph       : Rd.config.icnTable
                }
            ]);       
        }
        
        me.callParent(arguments);    
    }
});


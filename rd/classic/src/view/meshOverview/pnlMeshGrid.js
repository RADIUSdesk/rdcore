
Ext.define('Rd.view.meshOverview.pnlMeshGrid', {
    extend      : 'Ext.panel.Panel',
    alias       : 'widget.pnlMeshGrid',
    scrollable  : true,
    layout      : {
      type  : 'vbox',
      align : 'stretch'  
    },
    requires: [
        'Rd.view.meshOverview.vcPnlMeshOverview'
    ],
    controller  : 'vcPnlMeshOverview',
    initComponent: function() {
        var me      = this;
        var size    = 'small';
		var mo_pnl = Ext.ComponentQuery.query('pnlMeshOverview')[0];
        me.store    = Ext.create(Rd.store.sMeshOverview,{
            autoLoad: false 
        });
		me.store.getProxy().setExtraParams({'tree_tag_id': mo_pnl.current_node_id});
		me.store.load();
		//me.store.getProxy().setExtraParams({'tree_tag_id': node_id});
        me.dockedItems= [{
            xtype   : 'toolbar',
            dock    : 'top',
          //  cls     : 'subSubTab', //Make darker -> Maybe grey
            frame   : true,
            border  : true,
            items   : [
                    { 
                        xtype   : 'splitbutton',
                        glyph   : Rd.config.icnReload ,
                        scale   : size, 
                        itemId  : 'reload',
                        tooltip : i18n('sReload'),
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
                    '|',
                     { 
                        xtype       : 'button', 
                        scale       : 'small',
                        toggleGroup : 'timeSpanDash',
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
                        toggleGroup : 'timeSpanDash',		
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
                        toggleGroup : 'timeSpanDash',   
                        scale       : 'small',
                        listeners   : {
                             click: 'onClickWeekButton'
                        }
                    },
                    { 
                        xtype       : 'button', 
                        text        : '30 Days',
                        toggleGroup : 'timeSpanDash',
                        ui          : 'button-metal',
                        scale       : 'small',
                        listeners   : {
                             click: 'onClickMonthButton'
                        }
                    },
                    '|',
                     {

                        xtype       : 'textfield',
                        emptyText   : 'Filter Results',
                     //   glyph       : Rd.config.icnHourStart,
                        itemId      : 'filterName',
                        listeners: {
                            change: 'onFilterNameChange'
                        }            
                    }, 
                    '|',
                     { 
                        xtype       : 'button', 
                        glyph       : Rd.config.icnView,
                        scale       : size,
                        tooltip     : 'View Mesh',
                        listeners   : {
                             click: 'onClickViewButton'
                        }
                    }  
                ]
            }
        ]; 
          
        me.items = [
            {
                xtype   : 'gridMeshOverview',
                flex    : 1
              
            }
        ];  
        me.callParent(arguments);
    }
});

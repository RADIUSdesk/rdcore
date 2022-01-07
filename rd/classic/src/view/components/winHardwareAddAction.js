Ext.define('Rd.view.components.winHardwareAddAction', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winHardwareAddAction',
    title       : i18n("sAdd_a_command"),
    layout      : 'fit',
    autoShow    : false,
    width       : 550,
    height      : 300,
    glyph       : Rd.config.icnAdd,
    grid        : null,
    requires: [
        'Rd.view.components.btnCommon',
        'Rd.view.components.cmbPredefinedCommand',
        'Rd.view.schedules.vcHardwareAddAction'
    ],
    controller  : 'vcHardwareAddAction',
    initComponent: function() {
        var me = this;
        me.items = [
            {
                xtype       : 'form',
                border      : false,
                layout      : 'anchor',
                autoScroll  : true,
                defaults    : {
                    anchor  : '100%'
                },
                fieldDefaults: {
                    msgTarget       : 'under',
                    labelClsExtra   : 'lblRd',
                    labelAlign      : 'left',
                    labelSeparator  : '',
                    margin          : 15
                },
                defaultType: 'textfield',
                items: [
                    {
                        xtype       : 'radiogroup',
                        columns     : 3,
                        vertical    : false,
                        labelClsExtra: 'lblRdReq',
                        items       : [
                            {
                                boxLabel  : 'Predefined Command',
                                name      : 'action',
                                inputValue: 'predefined_command',
                                margin    : '0 15 0 0',
                                checked   : true
                            },                         
                            {
                                boxLabel  : 'Execute Command',
                                name      : 'action',
                                inputValue: 'execute',
                                margin    : '0 15 0 0'
                            }, 
                            {
                                boxLabel  : 'Execute & Reply',
                                name      : 'action',
                                inputValue: 'execute_and_reply',
                                margin    : '0 0 0 15'
                            },
                            
                        ],
                        listeners   : {
                           change  : 'rgrpChange'
                        }
                    },
                    {
				        xtype       : 'panel',
                        layout      : 'hbox',
                        itemId      : 'hbPredefinedCommand',
                        bodyStyle   : 'background: #e0ebeb',
                        padding     : '0 10 0 10',
                        items       : [
                            {
                                xtype       : 'cmbPredefinedCommand',
                                width       : 495
                            }
                        ]       
                    }, 
                    {
				        xtype       : 'panel',
                        layout      : 'hbox',
                        itemId      : 'hbCommand',
                        hidden      : true,
                        disabled    : true,
                        bodyStyle   : 'background: #b5b5b5',
                        padding     : '0 10 0 10',
                        items       : [
                            {
                                xtype       : 'textfield',
                                name        : "command",
                                allowBlank  : false,
                                blankText   : i18n('sSupply_a_value'),
                                labelClsExtra: 'lblRdReq',
                                flex        : 1
                            }
                        ]
                    }
                ],
                buttons: [{xtype: 'btnCommon'}]
            }
        ];       
        me.callParent(arguments);
    }
});

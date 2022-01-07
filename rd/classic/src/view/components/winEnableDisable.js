Ext.define('Rd.view.components.winEnableDisable', {
    extend  : 'Ext.window.Window',
    alias   : 'widget.winEnableDisable',
    title   : i18n('sEnable_fs_Disable'),
    layout  : 'fit',
    autoShow: false,
    width   :    350,
    height  :   300,
    glyph   : Rd.config.icnLight,
    requires: [
        'Rd.view.components.btnCommon'
    ],
    initComponent: function() {
        var me = this;
        this.items = [
            {
                xtype: 'form',
                border:     false,
                layout:     'anchor',
                autoScroll: true,
                defaults: {
                    anchor: '100%'
                },
                fieldDefaults: {
                    msgTarget: 'under',
                    labelClsExtra: 'lblRd',
                    labelAlign: 'left',
                    labelSeparator: '',
                    margin: 15
                },
                defaultType: 'textfield',
                items: [
                    {
                        xtype       : 'radiogroup',
                        fieldLabel  : i18n('sAction'),
                        columns: 1,
                        vertical: true,
                        items: [
                            { boxLabel: i18n('sEnable'),    name: 'rb',     inputValue: 'enable', checked: true },
                            { boxLabel: i18n('sDisable'),   name: 'rb',     inputValue: 'disable'}
                        ]
                    }
                ],
                buttons: [{xtype: 'btnCommon'}]
            }
        ];
        this.callParent(arguments);
    }
});

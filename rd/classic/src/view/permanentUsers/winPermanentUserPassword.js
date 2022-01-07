Ext.define('Rd.view.permanentUsers.winPermanentUserPassword', {
    extend  : 'Ext.window.Window',
    alias   : 'widget.winPermanentUserPassword',
    title   : i18n('sChange_password'),
    layout  : 'fit',
    autoShow: false,
    width   :    350,
    height  :   250,
    glyph   : Rd.config.icnKey,
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
                        xtype       : 'textfield',
                        fieldLabel  : i18n('sPassword'),
                        allowBlank  : false,
                        labelClsExtra: 'lblRdReq',
                        name        : "password",
                        allowBlank  : false
                    }
                ],
                buttons: [{xtype: 'btnCommon'}]
            }
        ];
        this.callParent(arguments);
    }
});

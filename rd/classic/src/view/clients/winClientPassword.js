Ext.define('Rd.view.clients.winClientPassword', {
    extend  : 'Ext.window.Window',
    alias   : 'widget.winClientPassword',
    title   : i18n('sChange_password'),
    layout  : 'fit',
    autoShow: false,
    width   : 450,
    height  : 250,
    glyph   : Rd.config.icnKey,
    clientId: '',
    requires: [
        'Rd.view.components.btnCommon',
        'Rd.view.components.rdPasswordfield'
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
                        xtype   : 'rdPasswordfield'
                    },
                    {
                        name        : 'id',
                        xtype       : 'textfield',
                        hidden      : true,
                        value       : me.clientId
                    }
                ],
                buttons: [{xtype: 'btnCommon'}]
            }
        ];
        this.callParent(arguments);
    }
});

Ext.define('Rd.view.dynamicClients.winMapDynamicClientAdd', {
    extend  : 'Ext.window.Window',
    alias   : 'widget.winMapDynamicClientAdd',
    title   : i18n('sAdd_a_marker'),
    layout  : 'fit',
    autoShow: false,
    width   : 500,
    height  : 300,
    glyph   : Rd.config.icnNote,
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
                    margin      : Rd.config.fieldMargin
                },
                defaultType: 'textfield',
                tbar: [
                    { xtype: 'tbtext', text: 'Select a Dynamic Client', cls: 'lblWizard' }
                ],
                items: [
                    {
                        xtype       : 'cmbDynamicClientsAddMap'
                    }
                ],
                buttons: [
                    {
                        itemId  : 'save',
                        text    : i18n('sOK'),
                        scale   : 'large',
                        glyph   : Rd.config.icnYes,
                        formBind: true,
                        margin  : '0 20 40 0'
                    }
                ]
            }
        ];
        this.callParent(arguments);
    }
});

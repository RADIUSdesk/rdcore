Ext.define('Rd.view.nas.winMapNasAdd', {
    extend: 'Ext.window.Window',
    alias : 'widget.winMapNasAdd',
    title : i18n('sAdd_a_marker'),
    layout: 'fit',
    autoShow: false,
    width:    500,
    height:   300,
    iconCls: 'note',
    glyph: Rd.config.icnNote,
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
                tbar: [
                    { xtype: 'tbtext', text: i18n('sSelect_a_NAS_device'), cls: 'lblWizard' }
                ],
                items: [
                    {
                        xtype       : 'cmbNas'
                    }
                ],
                buttons: [
                    {
                        itemId: 'save',
                        text: i18n('sOK'),
                        scale: 'large',
                        iconCls: 'b-next',
                        glyph: Rd.config.icnYes,
                        formBind: true,
                        margin: '0 20 40 0'
                    }
                ]
            }
        ];
        this.callParent(arguments);
    }
});

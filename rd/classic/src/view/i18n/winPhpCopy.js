Ext.define('Rd.view.i18n.winPhpCopy', {
    extend: 'Ext.window.Window',
    alias : 'widget.winPhpCopy',
    title : i18n('sCopy_from_another_language'),
    layout: 'fit',
    autoShow: true,
    width: 300,
    iconCls: 'copy',
    glyph: Rd.config.icnCopy,
    initComponent: function() {
        var me = this;
        this.items = [
            {
                xtype: 'form',
                border: false,
                layout: 'anchor',
                width: '100%',
                flex: 1,
                defaults: {
                    anchor: '100%'
                },
                fieldDefaults: {
                    msgTarget: 'under',
                    labelClsExtra: 'lblRd',
                    labelAlign: 'top',
                    labelSeparator: '',
                    margin: 15
                },
                defaultType: 'textfield',
                items: [
                    { xtype: 'cmbLanguages', width: 350, fieldLabel: i18n('sSource'),      itemId: 'source',       name: 'source', allowBlank: false },
                    { xtype: 'cmbLanguages', width: 350, fieldLabel: i18n('sDestination'), itemId: 'destination',  name: 'destination',allowBlank: false},
                    {
                        xtype     : 'checkbox',      
                        boxLabel  : i18n('sMaintain_existing_translations'),
                        name      : 'maintain_existing',
                        inputValue: 'remove',
                        checked   : true
                    }],
                buttons: [
                    {
                        itemId: 'save',
                        text: i18n('sOK'),
                        scale: 'large',
                        iconCls: 'b-btn_ok',
                        glyph: Rd.config.icnYes,
                        formBind: true,
                        margin: '0 15 10 0'
                    }
                ]
            }
        ];
        this.callParent(arguments);
    }
});

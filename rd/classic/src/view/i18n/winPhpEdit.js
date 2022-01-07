Ext.define('Rd.view.i18n.winPhpEdit', {
    extend: 'Ext.window.Window',
    alias : 'widget.winPhpEdit',
    title : i18n('sEdit_Msgid'),
    layout: 'fit',
    autoShow: true,
    width: 300,
    iconCls: 'edit',
    glyph: Rd.config.icnEdit,
    old_msgid: '',
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
                     {
                        xtype:  'hiddenfield',
                        name:   'old_msgid',
                        value:  me.old_msgid,
                        hidden: true
                    },
                    {
                        xtype: 'displayfield',
                        fieldLabel: i18n('sPrevious_value'),
                        value: me.old_msgid
                    },
                    {
                        xtype: 'textfield',
                        fieldLabel: i18n('sMsgid'),
                        name : "msgid",
                        allowBlank:false,
                        blankText : i18n('sSpecify_a_valid_name_please')
                    }],
                buttons: [
                    {
                        itemId: 'save',
                        text: i18n('OK'),
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

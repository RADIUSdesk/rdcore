Ext.define('Rd.view.i18n.winPhpAdd', {
    extend: 'Ext.window.Window',
    alias : 'widget.winPhpAdd',
    title : i18n('sAdd_Msgid'),
    layout: 'fit',
    autoShow: true,
    width: 300,
    iconCls: 'add',
    glyph: Rd.config.icnAdd,
    initComponent: function() {
        var me = this;
        me.items = [
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
                        xtype: 'textfield',
                        fieldLabel: i18n('sMsgid'),
                        name : "msgid",
                        allowBlank:false,
                        blankText: i18n('sSpecify_a_valid_name_please')
                    },
                    {
                        xtype: 'textfield',
                        fieldLabel: i18n('sMsgstr'),
                        name : "msgstr",
                        allowBlank:true
                    },
                    {
                        xtype     : 'textfield',
                        name      : "comment",
                        fieldLabel: i18n('sOptional_Comment')
                    }],
                buttons: [
                    {
                        itemId: 'save',
                        text: i18n('sOK'),
                        scale: 'large',
                        iconCls: 'b-btn_ok',
                        glyph: Rd.config.icnYes,
                        formBind: true,
                        margin: '0 20 40 0'
                    }
                ]
            }
        ];
        me.callParent(arguments);
    }
});

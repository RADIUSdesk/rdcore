Ext.define('Rd.view.i18n.winPhpComment', {
    extend: 'Ext.window.Window',
    alias : 'widget.winPhpComment',
    title : i18n('sAdd_comment_to_msgid'),
    layout: 'fit',
    autoShow: true,
    width: 300,
    iconCls: 'edit',
    glyph: Rd.config.icnEdit,
    msgid: '',
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
                        name:   'msgid',
                        value:  me.msgid,
                        hidden: true
                    },
                    {
                        xtype     : 'checkbox',      
                        boxLabel  : i18n('sRemove_existing_comments'),
                        name      : 'remove_existing',
                        inputValue: 'remove',
                        checked   : true
                    }, 
                    {
                        xtype     : 'textfield',
                        name      : "comment",
                        allowBlank: false,
                        blankText : i18n('sSpecify_a_valid_name_please'),
                        fieldLabel: i18n('sComment')
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

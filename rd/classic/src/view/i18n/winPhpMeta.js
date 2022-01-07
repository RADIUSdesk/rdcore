Ext.define('Rd.view.i18n.winPhpMeta', {
    extend: 'Ext.window.Window',
    alias : 'widget.winPhpMeta',
    title : i18n('sSpecify_Meta_data'),
    layout: 'fit',
    autoShow: true,
    width: 400,
    height: 450,
    resizable:  false,
    iconCls: 'edit',
    glyph: Rd.config.icnEdit,
    initComponent: function() {
        var me = this;
        this.items = [
            {
                xtype: 'form',
                border: false,
                autoScroll:true,
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
                        fieldLabel: 'Project-Id-Version',
                        name : "Project-Id-Version",
                        allowBlank:false,
                        blankText: i18n("sEnter")+" Enter Project-Id-Version"
                    },
                    {
                        xtype: 'textfield',
                        fieldLabel: 'POT-Creation-Date',
                        name : "POT-Creation-Date",
                        allowBlank:false,
                        blankText: i18n("sEnter")+" POT-Creation-Date"
                    },
                    {
                        xtype: 'textfield',
                        fieldLabel: 'PO-Revision-Date',
                        name : "PO-Revision-Date",
                        allowBlank:false,
                        blankText: i18n("sEnter")+" PO-Revision-Date"
                    },
                    {
                        xtype: 'textfield',
                        fieldLabel: 'Last-Translator',
                        name : "Last-Translator",
                        allowBlank:false,
                        blankText: i18n("sEnter")+" Last-Translator"
                    },
                    {
                        xtype: 'textfield',
                        fieldLabel: 'Language-Team',
                        name : "Language-Team",
                        allowBlank:false,
                        blankText: i18n("sEnter")+" Language-Team"
                    },
                    {
                        xtype: 'textfield',
                        fieldLabel: 'MIME-Version',
                        name : "MIME-Version",
                        allowBlank:false,
                        blankText: i18n("sEnter")+"  MIME-Version"
                    },
                    {
                        xtype: 'textfield',
                        fieldLabel: 'Content-Type',
                        name : "Content-Type",
                        allowBlank:false,
                        blankText: i18n("sEnter")+" Content-Type"
                    },
                    {
                        xtype: 'textfield',
                        fieldLabel: 'Content-Transfer-Encoding',
                        name : "Content-Transfer-Encoding",
                        allowBlank:false,
                        blankText: i18n("sEnter")+" Content-Transfer-Encoding"
                    },
                    {
                        xtype: 'textfield',
                        fieldLabel: 'Plural-Forms',
                        name : "Plural-Forms",
                        allowBlank:false,
                        blankText: i18n("sEnter")+' Plural-Forms'
                    }
                    ],
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

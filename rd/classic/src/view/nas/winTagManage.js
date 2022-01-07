Ext.define('Rd.view.nas.winTagManage', {
    extend: 'Ext.window.Window',
    alias : 'widget.winTagManage',
    title : i18n('sAdd_or_remove_tags'),
    layout: 'fit',
    autoShow: false,
    width:    350,
    height:   300,
    iconCls: 'tags',
    glyph: Rd.config.icnTags,
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
                    { xtype: 'tbtext', text: i18n('sSelect_an_action_and_a_tag'), cls: 'lblWizard' }
                ],
                items: [
                    {
                        xtype       : 'radiogroup',
                        fieldLabel  : i18n('sAction'),
                        columns: 1,
                        vertical: true,
                        items: [
                            { boxLabel: i18n('sAdd'),      name: 'rb',     inputValue: 'add', checked: true },
                            { boxLabel: i18n('sRemove'),   name: 'rb',     inputValue: 'remove'}
                        ]
                    },
                    {
                        xtype: 'combo',
                        fieldLabel: i18n('sTags'),
                        store: 'sTags',
                        queryMode: 'local',
                        editable: false,
                        allowBlank: false,
                        name: 'tag_id',
                        displayField: 'name',
                        valueField: 'id'
                    }
                ],
                buttons: [
                    {
                        itemId: 'save',
                        text: i18n('sOK'),
                        scale: 'large',
                        iconCls: 'b-next',
                        glyph: Rd.config.icnNext,
                        formBind: true,
                        margin: '0 20 40 0'
                    }
                ]
            }
        ];
        this.callParent(arguments);
    }
});

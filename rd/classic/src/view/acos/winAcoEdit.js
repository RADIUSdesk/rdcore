Ext.define('Rd.view.acos.winAcoEdit', {
    extend: 'Ext.window.Window',
    alias : 'widget.winAcoEdit',
    title : i18n('sEdit_ACO_object'),
    closable    :  true,
    draggable   :  false,
    resizable   :  false,
    border      : false,
    layout      : 'fit',
    autoShow    : false,
    width       : 350,
    height      : 350,
    iconCls     : 'edit',
    glyph: Rd.config.icnEdit,
    initComponent: function() {
        var me = this;
        this.items = [
            {
                xtype: 'form',
                fieldDefaults: {
                    msgTarget: 'under',
                    labelClsExtra: 'lblRd',
                    labelAlign: 'left',
                    labelSeparator: '',
                    margin: 15
                },
                defaults: {
                    anchor: '100%'
                },
                defaultType: 'textfield',
                items: [
                     {
                        xtype:  'hiddenfield',
                        name:   'parent_id',
                        hidden: true
                    },
                    {
                        xtype:  'hiddenfield',
                        name:   'id',
                        hidden: true
                    },
                    {
                        xtype       : 'textfield',
                        fieldLabel  : i18n('sAlias'),
                        name        : "alias",
                        allowBlank  :false,
                        blankText   : i18n('sEnter_a_value'),
                        labelClsExtra: 'lblRdReq'
                    },
                    {
                        xtype     : 'textareafield',
                        grow      : true,
                        name      : "comment",
                        fieldLabel: i18n('sOptional_Description')
                    }],
                buttons: [
                    {
                        itemId: 'save',
                        text    : i18n('sSave'),
                        scale: 'large',
                        iconCls: 'b-next',
                        glyph: Rd.config.icnNext,
                        margin: '0 20 40 0'
                    }
                ]
            }
        ];
        this.callParent(arguments);
    }
});

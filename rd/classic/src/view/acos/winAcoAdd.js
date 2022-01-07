Ext.define('Rd.view.acos.winAcoAdd', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winAcoAdd',
    closable    :  true,
    draggable   :  false,
    resizable   :  false,
    border      : false,
    title       : i18n('sAdd_ACO_object'),
    layout      : 'fit',
    autoShow    : false,
    width       : 350,
    height      : 350,
    iconCls     : 'add',
    glyph: Rd.config.icnAdd,
    parentId    : undefined,
    parentDisplay: undefined,
    initComponent: function() {

        var me  = this;
        me.items = [
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
                items: [
                    {
                        itemId  : 'parent_id',
                        xtype   : 'textfield',
                        name    : 'parent_id',
                        hidden  : true,
                        value   : me.parentId
                    },
                    {
                        xtype       : 'displayfield',
                        fieldLabel  : i18n('sParent_node'),
                        value       : me.parentDisplay,
                        labelClsExtra: 'lblRdReq'
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
                 buttons : [
                    {
                        text    : i18n('sSave'),
                        scale   : 'large',
                        action  : 'save',
                        itemId  : 'save',
                        iconCls : 'b-next',
                        glyph: Rd.config.icnNext,
                        formBind: true,
                        margin  : '0 20 40 0'
                    }
                ]
            }
        ];
        this.callParent(arguments);
    }
});

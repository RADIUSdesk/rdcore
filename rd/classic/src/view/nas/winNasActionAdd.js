Ext.define('Rd.view.nas.winNasActionAdd', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winNasActionAdd',
    title       : i18n('sAdd_a_command'),
    layout      : 'fit',
    autoShow    : false,
    width       : 350,
    height      : 200,
    iconCls     : 'add',
    glyph       : Rd.config.icnAdd,
    nas_id      : null,
    grid        : null,
    initComponent: function() {
        var me = this;
        this.items = [
            {
                xtype       : 'form',
                border      : false,
                layout      : 'anchor',
                autoScroll  : true,
                defaults    : {
                    anchor  : '100%'
                },
                fieldDefaults: {
                    msgTarget       : 'under',
                    labelClsExtra   : 'lblRd',
                    labelAlign      : 'left',
                    labelSeparator  : '',
                    margin          : 15
                },
                defaultType: 'textfield',
                items: [
                     {
                        xtype       : 'textfield',
                        name        : "na_id",
                        hidden      : true,
                        value       : me.nas_id
                    },
                    {
                        fieldLabel  : i18n('sCommand'),
                        name        : "command",
                        allowBlank  : false,
                        blankText   : i18n('sSupply_a_value'),
                        labelClsExtra: 'lblRdReq'
                    }
                ],
                buttons: [
                    {
                        itemId  : 'save',
                        text    : i18n('sOK'),
                        scale   : 'large',
                        iconCls : 'b-next',
                        glyph   : Rd.config.icnNext,
                        formBind: true,
                        margin  : '0 20 40 0'
                    }
                ]
            }
        ];
        this.callParent(arguments);
    }
});

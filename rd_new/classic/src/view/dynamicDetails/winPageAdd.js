Ext.define('Rd.view.dynamicDetails.winPageAdd', {
    extend  : 'Ext.window.Window',
    alias   : 'widget.winPageAdd',
    title   : i18n('sAdd_own_page'),
    layout  : 'fit',
    autoShow: false,
    width   : 600,
    height  : 530,
    glyph   : Rd.config.icnAdd,
    dynamic_detail_id: undefined,
    grid    :  undefined,
    requires: [
        'Rd.view.dynamicDetails.cmbDynamicLanguages'
    ],
    items   :  {
        xtype   :  'form', 
        layout  : 'anchor',
        autoScroll:true,
        frame   : false,
        defaults    : {
            anchor: '100%'
        },
        fieldDefaults: {
            msgTarget       : 'under',
            labelClsExtra   : 'lblRd',
            labelAlign      : 'left',
            labelSeparator  : '',
            margin          : Rd.config.fieldMargin,
            labelWidth      : Rd.config.labelWidth
        },
        items       : [
            {
                xtype           : 'textfield',
                fieldLabel      : i18n('sName'),
                name            : "name",
                labelClsExtra   : 'lblRdReq',
                allowBlank      : false
            },
            {
                xtype           : 'cmbDynamicLanguages',
                labelClsExtra   : 'lblRdReq'
            },
            {
                xtype           : 'htmleditor',
                width           : 580,
                height          : 250,
                name            : "content",
                labelClsExtra   : 'lblRdReq',
                allowBlank      : false
            }     
        ],
        buttons: [
            {
                itemId: 'save',
                formBind: true,
                text: i18n('sSave'),
                scale: 'large',
                iconCls: 'b-save',
                glyph: Rd.config.icnYes,
                margin: Rd.config.buttonMargin
            }
        ]
    },
    initComponent: function() {
        var me      = this;
        this.callParent(arguments);
    }
});

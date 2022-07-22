Ext.define('Rd.view.dynamicDetails.winPairAdd', {
    extend: 'Ext.window.Window',
    alias : 'widget.winPairAdd',
    title : i18n('sAdd_dynamic_pair'),
    layout: 'fit',
    autoShow: false,
    width:    400,
    height:   350,
    iconCls: 'add',
    glyph: Rd.config.icnAdd,
    dynamic_detail_id: undefined,
    grid:  undefined,
    items:  {
        xtype   :  'form', 
        layout  : 'anchor',
        autoScroll:true,
        frame   : false,
        defaults    : {
            anchor: '100%'
        },
        fieldDefaults: {
            msgTarget: 'under',
            labelClsExtra: 'lblRd',
            labelAlign: 'left',
            labelSeparator: '',
            margin: Rd.config.fieldMargin,
            labelWidth: Rd.config.labelWidth
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
                xtype           : 'textfield',
                fieldLabel      : i18n('sValue'),
                name            : "value",
                labelClsExtra   : 'lblRdReq',
                allowBlank      : false
            },
            {
                xtype           : 'numberfield',
                name            : 'priority',
                fieldLabel      : i18n('sPriority'),
                value           : 1,
                maxValue        : 20,
                minValue        : 1,
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

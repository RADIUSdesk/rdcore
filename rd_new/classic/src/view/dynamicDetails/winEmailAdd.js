Ext.define('Rd.view.dynamicDetails.winEmailAdd', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winEmailAdd',
    title       : 'Add Email',
    layout      : 'fit',
    autoShow    : false,
    width       : 400,
    height      :   350,
    glyph       : Rd.config.icnAdd,
    dynamic_detail_id: undefined,
    store       :  undefined,
    items:  {
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
	            xtype       : 'textfield',
	            fieldLabel  : i18n("sMAC_address"),
	            name        : "mac",
	            allowBlank  : false,
	            blankText   : i18n("sSupply_a_value"),
	            labelClsExtra: 'lblRdReq',
	            vtype       : 'MacAddress',
	            fieldStyle  : 'text-transform:uppercase'
	        },
            {
                xtype           : 'textfield',
                fieldLabel      : 'Email',
                name            : "email",
                labelClsExtra   : 'lblRdReq',
                allowBlank      : false,
                vtype           : 'email'
            }
        ],
        buttons: [
            {
                itemId      : 'save',
                formBind    : true,
                text        : 'SAVE',
                scale       : 'large',
                glyph       : Rd.config.icnYes,
                margin      : Rd.config.buttonMargin,
                ui          : 'button-teal'
            }
        ]
    },
    initComponent: function() {
        var me      = this;
        this.callParent(arguments);
    }
});

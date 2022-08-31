Ext.define('Rd.view.vouchers.winVoucherAddDevice', {
    extend		: 'Ext.window.Window',
    alias 		: 'widget.winVoucherAddDevice',
    closable	: true,
    draggable	: true,
    resizable	: true,
    title		: 'New whitelisted device for voucher',
    width		: 300,
    height		: 250,
    plain		: true,
    border		: false,
    layout		: 'fit',
    glyph   	: Rd.config.icnAdd,
    autoShow	: false,
    usernamed 	: '',
	hidePower	: false,
    defaults	: {
            border: false
    },
    requires: [
        'Ext.form.Panel',
        'Ext.form.field.Text'
    ],
    initComponent: function() {
        var me = this;  
        var frmData = Ext.create('Ext.form.Panel',{
            border:     false,
            'layout'    : 'anchor',
            defaults    : {
                anchor: '100%'
            },
            itemId:     'scrnData',
            autoScroll: true,
            fieldDefaults: {
                msgTarget       : 'under',
                labelClsExtra   : 'lblRd',
                labelAlign      : 'top',
                labelSeparator  : '',
                labelClsExtra   : 'lblRd',
                labelWidth      : Rd.config.labelWidth,
                maxWidth        : Rd.config.maxWidth, 
                margin          : Rd.config.fieldMargin
            },
            defaultType: 'textfield',
            buttons: [{xtype: 'btnCommon'}],
            items       : [
                {
		            itemId  	: 'username',
		            xtype   	: 'textfield',
		            name    	: "username",
		            hidden  	: true,
		            value   	: me.username
		        }, 
		        {
		            xtype       : 'textfield',
		            fieldLabel  : i18n('sMAC_address'),
		            name        : "mac",
		            allowBlank  : false,
		            blankText   : i18n('sSupply_a_value'),
		            labelClsExtra: 'lblRdReq',
		            vtype       : 'MacAddress',
		            fieldStyle  : 'text-transform:lowercase',
		            value       : 'A8-40-41-13-60-E3'
		        }
            ]   
        })
        me.items = frmData;
        me.callParent(arguments);
    }
});

Ext.define('Rd.view.vouchers.winVoucherAdd', {
    extend		: 'Ext.window.Window',
    alias 		: 'widget.winVoucherAdd',
    closable	: true,
    draggable	: true,
    resizable	: false,
    title		: i18n('sNew_voucher'),
    width		: 500,
    height		: 500,
    plain		: true,
    border		: false,
    layout		: 'fit',
    glyph   	: Rd.config.icnAdd,
    autoShow	: false,
    apId    	: false,
	singleField : true,
    defaults	: {
            border	: false
    },
    requires	: [
        'Ext.form.Panel',
        'Ext.form.field.Text',
        'Rd.view.components.btnDataNext'
    ],
    initComponent: function() {
        var me = this;
        var scrnData        = me.mkScrnData();
        me.items = [
            scrnData
        ];
        me.callParent(arguments);
    },
    mkScrnData: function(){

        var me      = this;

        //Set default values for from and to:
        var dtTo    = new Date();
        dtTo.setYear(dtTo.getFullYear() + 1);

        var frmData = Ext.create('Ext.form.Panel',{
            border:     false,
            layout:     'fit',
            itemId:     'scrnData',
            autoScroll: true,
            fieldDefaults: {
                msgTarget: 'under',
                labelClsExtra: 'lblRd',
                labelAlign: 'left',
                labelSeparator: '',
                labelWidth      : Rd.config.labelWidth,
                margin          : Rd.config.fieldMargin
            },
            defaultType: 'textfield',
            items:[
               {
                    xtype   : 'tabpanel',
                    layout  : 'fit',
                    xtype   : 'tabpanel',
                    margins : '0 0 0 0',
                    plain   : true,
                    tabPosition: 'bottom',
                    border  : false,
                    cls     : 'subTab',
                    items   : [
                        { 
                            'title'     : i18n('sBasic_info'), 
                            'layout'    : 'anchor',
                            defaults    : {
                                anchor: '100%'
                            },
                            autoScroll  :true,
                            items       : [
								{
                                    itemId  : 'single_field',
                                    xtype   : 'textfield',
                                    name    : "single_field",
                                    hidden  : true,
                                    value   : me.singleField
                                },
                                {
                                    xtype       : 'displayfield',
                                    fieldLabel  : 'Cloud',
                                    value       : me.cloudName,
                                    labelClsExtra: 'lblRdReq'
                                },
                                {
                                    xtype       : 'textfield',
                                    name        : 'precede',
                                    fieldLabel  : i18n('sPrecede_string'),
                                    allowBlank  : true,
                                    labelClsExtra: 'lblRd',
									hidden		: me.singleField,
									disabled	: me.singleField
                                },
                                {
                                    xtype       : 'cmbRealm',
                                    allowBlank  : false,
                                    labelClsExtra: 'lblRdReq',
                                    itemId      : 'realm',
                                    extraParam  : me.apId
                                },
                                {
                                    xtype       : 'cmbProfile',
                                    allowBlank  : false,
                                    labelClsExtra: 'lblRdReq',
                                    itemId      : 'profile',
                                    extraParam  : me.apId
                                },
                                {
                                    xtype       : 'numberfield',
                                    name        : 'quantity',
                                    fieldLabel  : i18n('sHow_many_qm'),
                                    value       : 1,
                                    maxValue    : 5000,
                                    minValue    : 1,
                                    labelClsExtra: 'lblRdReq',
                                    itemId      : 'quantity'
                                },
                                {
                                    xtype       : 'textfield',
                                    name        : 'batch',
                                    fieldLabel  : i18n('sBatch_name'),
                                    allowBlank  : false,
                                    labelClsExtra: 'lblRdReq',
                                    itemId      : 'batch',
                                    disabled    : true,
                                    hidden      : true
                                },
                                {
                                    xtype       : 'slider',
                                    name        : 'pwd_length',
                                    fieldLabel  : i18n('sPassword_length'),
                                    width       : 200,
                                    value       : 3,
                                    increment   : 1,
                                    minValue    : 3,
                                    maxValue    : 15,
									hidden		: me.singleField,
									disabled	: me.singleField
                                }
                            ]
                        },
                        { 
                            'title' : i18n('sActivate_and_Expire'),
                            'layout'    : 'anchor',
                            autoScroll  :true,
                            defaults    : {
                                anchor: '100%'
                            },
                            items       : [
                                {
                                    xtype       : 'checkbox',      
                                    fieldLabel  : i18n('sActivate_upon_first_login'),
                                    name        : 'activate_on_login',
                                    inputValue  : 'activate_on_login',
                                    itemId      : 'activate_on_login',
                                    checked     : false,
                                    cls         : 'lblRd'
                                },
                                {
                                    xtype       : 'numberfield',
                                    name        : 'days_valid',
                                    fieldLabel  : i18n('sDays_available_after_first_login'),
                                    value       : 0,
                                    maxValue    : 366,
                                    minValue    : 0,
                                    itemId      : 'days_valid',
                                    hidden      : true,
                                    disabled    : true
                                },
                                {
                                    xtype       : 'numberfield',
                                    name        : 'hours_valid',
                                    fieldLabel  : 'Hours',
                                    labelAlign  : 'right',
                                    value       : 0,
                                    maxValue    : 23,
                                    minValue    : 0,
                                    itemId      : 'hours_valid',
                                    hidden      : true,
                                    disabled    : true
                                },
                                {
                                    xtype       : 'numberfield',
                                    name        : 'minutes_valid',
                                    fieldLabel  : 'Minutes',
                                    labelAlign  : 'right',
                                    value       : 0,
                                    maxValue    : 59,
                                    minValue    : 0,
                                    itemId      : 'minutes_valid',
                                    hidden      : true,
                                    disabled    : true
                                },
                                {
                                    xtype       : 'checkbox',      
                                    fieldLabel  : i18n('sNever_expire'),
                                    name        : 'never_expire',
                                    inputValue  : 'never_expire',
                                    itemId      : 'never_expire',
                                    checked     : true,
                                    cls         : 'lblRd'
                                },
                                {
                                    xtype       : 'datefield',
                                    fieldLabel  : i18n('sExpire'),
                                    name        : 'expire',
                                    itemId      : 'expire',
                                    minValue    : new Date(),  // limited to the current date or after
                                    disabled    : true,
                                    value       : dtTo
                                }
                            ]
                        },
                        { 
                            'title' : 'Extra field',
                            'layout'    : 'anchor',
                            defaults    : {
                                anchor: '100%'
                            },
                            items: [
                                {
                                    xtype       : 'textfield',
                                    name        : 'extra_name',
                                    fieldLabel  : 'Extra field name',
                                    allowBlank  : true,
                                    labelClsExtra: 'lblRd'
                                },
                                {
                                    xtype       : 'textfield',
                                    name        : 'extra_value',
                                    fieldLabel  : 'Extra field value',
                                    allowBlank  : true,
                                    labelClsExtra: 'lblRd'
                                }
                            ]
                        }
                    ]
                }              
            ],
            buttons: [{ xtype : 'btnDataNext' }]
        });
        return frmData;

    }   
});

Ext.define('Rd.view.vouchers.pnlVoucher', {
    extend	: 'Ext.tab.Panel',
    alias	: 'widget.pnlVoucher',
    border	: false,
    v_id	: null,
    v_name	: null,
    record	: null, //We will supply each instance with a reference to the selected record.
    plain	: true,
    cls     : 'subTab',
    requires: [
        'Rd.view.components.btnCommon'
    ],
    initComponent: function(){
        var me      = this;
        //Set default values for from and to:
        var dtFrom  = new Date();
        var dtTo    = new Date();
        dtTo.setYear(dtTo.getFullYear() + 1);

		var ap_id	= me.record.get('user_id');

        me.items = [
        {   
            title:  i18n('sBasic_info'),
            itemId : 'tabBasicInfo',
            layout: 'hbox',
            items:  { 
                xtype   :  'form',
                height  : '100%', 
                width   :  400,
                layout  : 'anchor',
                autoScroll:true,
                frame   : true,
                defaults    : {
                    anchor: '100%'
                },
                fieldDefaults: {
                    msgTarget       : 'under',
                    labelClsExtra   : 'lblRd',
                    labelAlign      : 'left',
                    labelSeparator  : '',
                    margin          : 15,
                    labelWidth      : 150
                },
                items       : [               
                    {
                        xtype       : 'cmbRealm',
                        allowBlank  : false,
                        labelClsExtra: 'lblRdReq',
                        itemId      : 'realm',
						extraParam  : ap_id
                    },
                    {
                        xtype       : 'cmbProfile',
                        allowBlank  : false,
                        labelClsExtra: 'lblRdReq',
                        itemId      : 'profile',
						extraParam  : ap_id
                    },
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
                    },
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
                    },
					{
                        xtype       : 'checkbox',      
                        boxLabel    : 'Connect only from selected SSIDs',
                        name        : 'ssid_only',
                        inputValue  : 'ssid_only',
						itemId  	: 'ssid_only',
                        checked     : false,
                        cls         : 'lblRd'
                    },
                    {
                        xtype       : 'cmbSsid',
                        labelClsExtra: 'lblRdReq',
						itemId		: 'ssid_list',
						hidden		: true,
						disabled	: true,
						extraParam  : me.ap_id
                    }  
                ],
                buttons: [ {xtype: 'btnCommon'}
                    
                  /*  {
                        itemId: 'save',
                        text: i18n('sSave'),
                        scale: 'large',
                        iconCls: 'b-save',
                        glyph:  Rd.config.icnYes,
                        margin: '0 20 40 0'
                    }*/
                ]
            }  
        },
        { 
            title   : i18n('sPrivate_attributes'),
            layout  : 'fit',
            xtype   : 'gridVoucherPrivate',  
            username: me.v_name
        }, 
		{ 
            title   : i18n('sDevices'),
            layout  : 'fit',
            xtype   : 'gridVoucherDevices',  
            username: me.v_name
        }, 
        { 
            title   : i18n('sAccounting_data'), 
            layout  : 'fit',
            xtype   : 'gridVoucherRadaccts',
            username: me.v_name
        }
        
    ]; 
        me.callParent(arguments);
    }
});

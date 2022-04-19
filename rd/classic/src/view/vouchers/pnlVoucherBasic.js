Ext.define('Rd.view.vouchers.pnlVoucherBasic', {
    extend      : 'Ext.form.Panel',
    alias       : 'widget.pnlVoucherBasic',
    autoScroll	: true,
    plain       : true,
    frame       : false,
    layout      : {
        type    : 'vbox',
        pack    : 'start',
        align   : 'stretch'
    },
    margin      : 5,  
    ap_id       : null,
    fieldDefaults: {
        msgTarget       : 'under',
        labelAlign      : 'left',
        labelSeparator  : '',
        labelWidth      : Rd.config.labelWidth+20,
        margin          : Rd.config.fieldMargin,
        labelClsExtra   : 'lblRdReq'
    },
    buttons : [
        {
            itemId  : 'save',
            text    : 'SAVE',
            scale   : 'large',
            formBind: true,
            glyph   : Rd.config.icnYes,
            margin  : Rd.config.buttonMargin,
            ui      : 'button-teal'
        }
    ],
    initComponent: function(){
        var me      = this;
        var w_prim  = 550;
        
        //Set default values for from and to:
        var dtFrom  = new Date();
        var dtTo    = new Date();
        dtTo.setYear(dtTo.getFullYear() + 1);

		var ap_id	= me.record.get('user_id');
        
        var cntRequired  = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
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
            ]
        }
              
        me.items = [
            {
                xtype       : 'panel',
                title       : "Required Info",
                glyph       : Rd.config.icnGears,
                ui          : 'panel-blue',
                layout      : {
                  type  : 'vbox',
                  align : 'start',
                  pack  : 'start'
                },
                bodyPadding : 10,
                items       : cntRequired				
            }
        ];    
        me.callParent(arguments);
    }
});

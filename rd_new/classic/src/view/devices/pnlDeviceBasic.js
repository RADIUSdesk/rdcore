Ext.define('Rd.view.devices.pnlDeviceBasic', {
    extend      : 'Ext.form.Panel',
    alias       : 'widget.pnlDeviceBasic',
    autoScroll	: true,
    plain       : true,
    frame       : false,
    layout      : {
        type    : 'vbox',
        pack    : 'start',
        align   : 'stretch'
    },
    margin      : 5,
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
        
        var dtFrom  = new Date();
        var dtTo    = new Date();
        dtTo.setYear(dtTo.getFullYear() + 1);

		var ap_id	= me.record.get('owner_id');
        
        var cntRequired  = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
            items       : [
                {
                    xtype       : 'textfield',
                    fieldLabel  : i18n('sDescription'),
                    name        : "description",
                    allowBlank  : false,
                    blankText   : i18n('sSupply_a_value'),
                    labelClsExtra: 'lblRdReq'
                },
                {
                    xtype       : 'cmbPermanentUser',
                    allowBlank  : false,
					name		: 'permanent_user_id',
                    labelClsExtra: 'lblRdReq',
                    itemId      : 'owner'
                },             
                {
                    xtype       : 'cmbProfile',
                    allowBlank  : false,
                    labelClsExtra: 'lblRdReq',
                    itemId      : 'profile'
                },
                {
                    xtype       : 'cmbCap',
                    allowBlank  : false,
                    labelClsExtra: 'lblRdReq',
                    hidden      : true,
                    value       : 'hard',
                    fieldLabel  : i18n('sCap_type_for_data'),
                    itemId      : 'cmbDataCap',
                    name        : 'data_cap_type'
                },
                {
                    xtype       : 'cmbCap',
                    allowBlank  : false,
                    labelClsExtra: 'lblRdReq',
                    hidden      : true,
                    value       : 'hard',
                    fieldLabel  : i18n('sCap_type_for_time'),
                    itemId      : 'cmbTimeCap',
                    name        : 'time_cap_type'
                },
                {
                    xtype       : 'checkbox',      
                    boxLabel    : i18n('sAlways_active'),
                    name        : 'always_active',
                    inputValue  : 'always_active',
                    itemId      : 'always_active',
                    checked     : true,
                    cls         : 'lblRd'
                },
                {
                    xtype       : 'datefield',
                    fieldLabel  : i18n('sFrom'),
                    name        : 'from_date',
                    itemId      : 'from_date',
                    minValue    : new Date("May 20, 2013 00:00:00"), 
                    hidden      : true,
                    disabled    : true,
                    value       : dtFrom
                },
                {
                    xtype       : 'datefield',
                    fieldLabel  : i18n('sTo'),
                    name        : 'to_date',
                    itemId      : 'to_date',
                    minValue    : new Date("May 21, 2013 00:00:00"),
                    hidden      : true,
                    disabled    : true,
                    value       : dtTo
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

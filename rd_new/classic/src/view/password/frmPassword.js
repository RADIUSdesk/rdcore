Ext.define('Rd.view.password.frmPassword', {
    extend      : 'Ext.form.Panel',
    alias       : 'widget.frmPassword',
    autoScroll  : true,
    autoCreate  : true,
    //frame       : true,
    border      : false,
    layout      : 'anchor',
    user_data   : undefined,
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
      //  maxWidth        : 450,
      //  width           : 450 
    },
    requires: [
        'Rd.view.components.cmbPermanentUser'
    ],
    buttons: [
        {
            itemId  : 'save',
            formBind: true,
            text    : i18n('sOK'),
            scale   : 'large',
            iconCls : 'b-btn_ok',
            glyph   : Rd.config.icnYes,
            margin  : Rd.config.buttonMargin
        }
    ],
    initComponent: function(){
        var me      = this;

        //Set default values for from and to:
        var dtFrom  = new Date();
        var dtTo    = new Date();
        dtTo.setDate(dtTo.getDate() + 7); //Expire by defaul 7 days later      
 
        me.items    = [          
            {
                xtype       : 'cmbPermanentUser',
                fieldLabel  : i18n('sUsername')
            },
            {
                xtype       : 'displayfield',
                value       : i18n('s_br_select_user_first_br'),
                fieldLabel  : i18n('sCurrent_password'),
                fieldCls    : 'green_round',
                itemId      : 'currentPwd'
            },
            {
                xtype       : 'textfield',
                name        : 'password',
                fieldLabel  : i18n('sNew_password'),
                allowBlank  : false,
                minLength   : 4
            },
            {
                xtype       : 'checkbox',      
                fieldLabel  : i18n('sAlways_active'),
                name        : 'always_active',
                inputValue  : 'always_active',
                itemId      : 'always_active',
                checked     : true,
                cls         : 'lblRd'
            },
            {
                xtype: 'datefield',
                fieldLabel: i18n('sFrom'),
                name: 'from_date',
                itemId      : 'from_date',
                minValue: new Date(),  // limited to the current date or after
                hidden      : true,
                disabled    : true,
                value       : dtFrom
            },
            {
                xtype: 'datefield',
                fieldLabel: i18n('sTo'),
                name: 'to_date',
                itemId      : 'to_date',
                minValue: new Date(),  // limited to the current date or after
                hidden      : true,
                disabled    : true,
                value       : dtTo
            }
        ];        
           
        me.callParent(arguments);
    }
});


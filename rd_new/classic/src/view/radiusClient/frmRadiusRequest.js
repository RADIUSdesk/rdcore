Ext.define('Rd.view.radiusClient.frmRadiusRequest', {
    extend      : 'Ext.form.Panel',
    alias       : 'widget.frmRadiusRequest',
    autoScroll  : true,
    autoCreate  : true,
    frame       : true,
    layout      : 'anchor',
    defaults    : {
        anchor: '100%'
    },
    fieldDefaults: {
        msgTarget       : 'under',
        labelClsExtra   : 'lblRd',
        labelAlign      : 'left',
        labelSeparator  : '',
        margin          : Rd.config.fieldMargin
     //   labelWidth      : Rd.config.labelWidth,
      //  maxWidth        : Rd.config.maxWidth,
      //  width           : 400 
    },
    requires: [
        'Rd.view.radiusClient.cmbRequestType',  'Rd.view.radiusClient.cmbUserType', 'Rd.view.components.cmbPermanentUser',
        'Rd.view.components.cmbDevice',         'Rd.view.components.cmbVoucher'
    ],
    buttons: [
        {
            itemId  : 'send',
            formBind: true,
            text    : i18n('sOK'),
            scale   : 'large',
            iconCls : 'b-btn_ok',
            glyph: Rd.config.icnYes,
            margin  : Rd.config.buttonMargin
        }
    ],
    initComponent: function(){
        var me      = this; 
        me.items    = [
            {
                xtype   : 'cmbRequestType',
                value   : 'auth'
            },
            {
                xtype   : 'cmbUserType',
                value   : 'permanent'
            },
            {
                xtype       : 'cmbPermanentUser',
                fieldLabel  : i18n('sUsername')
            },
            {
                xtype       : 'cmbDevice',
                hidden      : true,
                disabled    : true
            },
            {
                xtype       : 'cmbVoucher',
                hidden      : true,
                disabled    : true
            }
        ];   
        me.callParent(arguments);
    }
});


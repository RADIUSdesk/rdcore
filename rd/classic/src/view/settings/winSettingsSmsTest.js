Ext.define('Rd.view.settings.winSettingsSmsTest', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winSettingsSmsTest',
    closable    : true,
    draggable   : true,
    resizable   : true,
    title       : 'Test SMS Settings',
    width       : 500,
    height      : 350,
    plain       : true,
    border      : false,
    layout      : 'fit',
    glyph       : Rd.config.icnMobile,
    autoShow    : false,
    defaults    : {
            border: false
    },
    requires: [
        'Ext.form.field.Text'
    ],
    initComponent: function() {
        var me = this;  
        var frmData = Ext.create('Ext.form.Panel',{
            border:     false,
            layout:     'anchor',
            defaults: {
                anchor: '100%'
            },
            itemId:     'scrnData',
            autoScroll: true,
            fieldDefaults: {
                msgTarget       : 'under',
                labelClsExtra   : 'lblRd',
                labelAlign      : 'left',
                labelSeparator  : '',
                labelClsExtra   : 'lblRd',
                labelWidth      : Rd.config.labelWidth,
                margin          : Rd.config.fieldMargin
            },
            defaultType: 'textfield',
            buttons: [
                {
                    xtype       : 'btnCommon',
                    itemId      : 'btnEmailTestOK',
                    listeners   : {
                        click     : 'onSmsTestOkClick'
                    }   
                }        
            ],
            items: [
                    { 
                        name        : 'nr',
                        value       : me.nr,
                        hidden      : true
                    },
                    {
                        xtype       : 'textfield',
                        fieldLabel  : 'SMS To',
                        name        : "phone",
                        maskRe      : /[0-9]/,
                        validator: function(v) {
                            return /^-?[0-9]*?$/.test(v)? true : 'Only positive/negative float (x.yy)/int formats allowed!';
                        },
                        allowBlank  : false,
                        blankText   : i18n('sSupply_a_value'),
                        labelClsExtra: 'lblRdReq'
                    },
                    {
                        xtype       : 'textareafield',
                        grow        : true,
                        name        : 'message',
                        fieldLabel  : 'Message'
                    }
            ]
        });
        me.items = frmData;
        me.callParent(arguments);
    }
});

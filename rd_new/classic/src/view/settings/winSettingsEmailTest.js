Ext.define('Rd.view.settings.winSettingsEmailTest', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winSettingsEmailTest',
    closable    : true,
    draggable   : true,
    resizable   : true,
    title       : 'Test Email Settings',
    width       : 500,
    height      : 350,
    plain       : true,
    border      : false,
    layout      : 'fit',
    glyph       : Rd.config.icnEmail,
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
                        click     : 'onEmailTestOkClick'
                    }   
                }        
            ],
            items: [
                    {
                        xtype       : 'textfield',
                        fieldLabel  : 'Email To',
                        name        : "email",
                        allowBlank  : false,
                        blankText   : i18n('sSupply_a_value'),
                        labelClsExtra: 'lblRdReq',
                        vtype       : 'email',
                        value       : me.email
                    },
                    {
                        xtype       : 'textareafield',
                        grow        : true,
                        name        : 'message',
                        fieldLabel  : 'Extra message'
                    }
            ]
        });
        me.items = frmData;
        me.callParent(arguments);
    }
});

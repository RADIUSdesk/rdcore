Ext.define('Rd.view.settings.winSettingsLicenseAdd', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winSettingsLicenseAdd',
    closable    : true,
    draggable   : true,
    resizable   : true,
    border      : false,
    title       : 'Upgrade License Key',
    layout      : 'fit',
    autoShow    : false,
    width       : 400,
    height      : 300,
    glyph       : Rd.config.icnAdd,
    parentId    : undefined,
    parentDisplay: undefined,
    initComponent: function() {

        var me  = this;
        me.items = [
            {
                xtype: 'form',
                fieldDefaults: {
                    msgTarget: 'under',
                    labelClsExtra: 'lblRd',
                    labelAlign: 'left',
                    labelSeparator: '',
                    margin: 15
                },
                defaults: {
                    anchor: '100%'
                },
                items: [
                    
                    {
                        xtype       : 'textfield',
                        fieldLabel  : 'License Key',
                        name        : 'license_key',
                        allowBlank  :false,
                        blankText   : i18n('sEnter_a_value'),
                        labelClsExtra: 'lblRdReq'
                    }
                 ],
                 buttons : [
                    {
                        text        : i18n('sSave'),
                        scale       : 'large',
                        action      : 'save',
                        glyph       : Rd.config.icnNext,
                        formBind    : true,
                        margin      : '0 20 40 0',
                        listeners   : {
                            click     : 'onLicenseUpgradeSaveClick'
                        }   
                    }
                ]
            }
        ];
        this.callParent(arguments);
    }
});

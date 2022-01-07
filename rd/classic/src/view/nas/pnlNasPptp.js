Ext.define('Rd.view.nas.pnlNasPptp', {
    extend  : 'Ext.panel.Panel',
    alias   : 'widget.pnlNasPptp',
    border  : false,
    nas_id  : null,
    url     : null,
    layout: 'hbox',
    bodyStyle: {backgroundColor : Rd.config.panelGrey },
    items   :  {
        xtype   : 'panel',
        frame   : true,
        height  : '100%', 
        width   :  400,
        layout  : 'fit',
        items   : { 
            xtype   :  'form', 
            layout  : 'anchor',
            autoScroll:true,
            frame   : false,
            defaults    : {
                anchor: '100%'
            },
            fieldDefaults: {
                msgTarget: 'under',
                labelClsExtra: 'lblRd',
                labelAlign: 'left',
                labelSeparator: '',
                margin: Rd.config.fieldMargin,
                labelWidth: Rd.config.labelWidth
            },
            tbar: [
                { xtype: 'tbtext', text: i18n('sPPTP_credentials'), cls: 'lblWizard' }
            ],
            items       : [
                 {
                    itemId      : 'username',
                    xtype       : 'textfield',
                    fieldLabel  : i18n('sUsername'),
                    name        : 'username',
                    allowBlank  : false,
                    blankText   : i18n('sSupply_a_value'),
                    labelClsExtra: 'lblRdReq'
                },
                {
                    itemId      : 'password',
                    xtype       : 'textfield',
                    fieldLabel  : i18n('sPassword'),
                    name        : 'password',
                    allowBlank  : false,
                    blankText   : i18n('sSupply_a_value'),
                    labelClsExtra: 'lblRdReq'
                }                
            ],
            buttons: [
                {
                    itemId: 'save',
                    formBind: true,
                    text: i18n('sSave'),
                    scale: 'large',
                    iconCls: 'b-save',
                    glyph: Rd.config.icnYes,
                    margin: Rd.config.buttonMargin
                }
            ]
        }
    },
    initComponent: function(){
        var me = this;
        me.callParent(arguments);
    }
});

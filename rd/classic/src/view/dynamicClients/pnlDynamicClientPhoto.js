Ext.define('Rd.view.dynamicClients.pnlDynamicClientPhoto', {
    extend  : 'Ext.panel.Panel',
    alias   : 'widget.pnlDynamicClientPhoto',
    border  : false,
    nas_id  : null,
    url     : Ext.BLANK_IMAGE_URL,
    layout: 'hbox',
    bodyStyle: {backgroundColor : Rd.config.panelGrey },
    requires:   [
        'Rd.view.components.cmpImg'
    ],
    items   :  {
        xtype   : 'panel',
        frame   : true,
        height  : '100%', 
        width   :  400,
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
        items   : [
            {
                xtype: 'panel',
                title: 'Current Photo',
                flex: 1,
                border: false,
                items: [{'xtype' : 'cmpImg'}]
            },
            { 
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
            items       : [
                {
                    xtype: 'filefield',
                    itemId: 'form-file',
                    emptyText: 'Select an image',
                    fieldLabel: 'New photo',
                    allowBlank  : false,
                    name: 'photo',
                    buttonText: '',
                    buttonConfig: {
                        iconCls: 'upload-icon',
                        glyph: Rd.config.icnFolder
                    }
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
                },
                {
                    itemId: 'cancel',
                    text: i18n('sCancel'),
                    scale: 'large',
                    iconCls: 'b-close',
                    glyph: Rd.config.icnClose,
                    margin: Rd.config.buttonMargin
                }
            ]
        }

        ]
    },
    initComponent: function(){
        var me = this;
        me.callParent(arguments);
    }
});

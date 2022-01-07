Ext.define('Rd.view.realms.pnlRealmLogo', {
    extend  : 'Ext.panel.Panel',
    alias   : 'widget.pnlRealmLogo',
    border  : false,
    nas_id  : null,
    url     : Ext.BLANK_IMAGE_URL,
    layout: 'hbox',
    bodyStyle: {backgroundColor : Rd.config.panelGrey },
    initComponent: function(){
        var me = this;

        var tplImg = new Ext.Template([
                    "<div class='divMapAction'>",
                        "<img src='{image}' alt='Realm logo'>",
                    "</div>"
                ]);

        me.items =  {
                xtype   : 'panel',
                frame   : false,
                padding : 5,
                height  : '100%', 
                width   :  450,
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                items   : [
                    {
                        xtype: 'panel',
                        title: i18n('sCurrent_logo'),
                        flex: 1,
                        border: false,
                        itemId: 'pnlImg',
                        tpl: tplImg,
                        data: {img : me.url}
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
                            emptyText: i18n('sSelect_an_image'),
                            fieldLabel: i18n('sNew_logo'),
                            allowBlank  : false,
                            name: 'photo',
                            buttonText: '',
                            buttonConfig: {
                                iconCls: 'upload-icon',
                                glyph:      Rd.config.icnFolder
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
                            glyph:      Rd.config.icnYes,
                            margin: Rd.config.buttonMargin
                        },
                        {
                            itemId: 'cancel',
                            text: i18n('sCancel'),
                            scale: 'large',
                            iconCls: 'b-close',
                            glyph:      Rd.config.icnClose,
                            margin: Rd.config.buttonMargin
                        }
                    ]
                }

                ]};

        me.callParent(arguments);
    }
});

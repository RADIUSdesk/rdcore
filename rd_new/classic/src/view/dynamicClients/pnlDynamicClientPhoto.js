Ext.define('Rd.view.dynamicClients.pnlDynamicClientPhoto', {
    extend      : 'Ext.form.Panel',
    alias       : 'widget.pnlDynamicClientPhoto',
    realm_id    : null,
    autoScroll	: true,
    plain       : true,
    frame       : false,
    layout      : 'fit',
    margin      : 5,  
    realm_id    : null,
    url         : Ext.BLANK_IMAGE_URL,
    fieldDefaults: {
        msgTarget       : 'under',
        labelAlign      : 'left',
        labelSeparator  : '',
        labelWidth      : Rd.config.labelWidth+20,
        margin          : Rd.config.fieldMargin,
        labelClsExtra   : 'lblRdReq'
    },
    buttons: [
        {
            itemId: 'cancel',
            text: i18n('sCancel'),
            scale: 'large',
            iconCls: 'b-close',
            glyph:      Rd.config.icnClose,
            margin: Rd.config.buttonMargin
        },
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

        var tplImg = new Ext.Template([
            "<div class='divMapAction'>",
                "<img src='{image}' alt='Client photo'>",
            "</div>"
        ]);

        var cntRequired  = {
            xtype       : 'container',
            width       : w_prim,
            layout      : {
                type    : 'vbox',
                pack    : 'start',
                align   : 'stretchmax'
            },
            items       : [
                {
                    xtype: 'panel',
                    flex: 1,
                    border: false,
                    itemId: 'pnlImg',
                    tpl: tplImg,
                    data: {img : me.url}
                },
                {
                    xtype: 'filefield',
                    width: w_prim-20,
                    itemId: 'form-file',
                    emptyText: i18n('sSelect_an_image'),
                    fieldLabel: 'New photo',
                    allowBlank  : false,
                    name: 'photo',
                    buttonText: '',
                    buttonConfig: {
                        iconCls: 'upload-icon',
                        glyph:      Rd.config.icnFolder
                    }
                }
            ]
        };

       me.items = [
            {
                xtype       : 'panel',
                title       : 'Current Photo',
                ui          : 'panel-blue',
                layout      : 'fit',
                bodyPadding : 10,
                items       : cntRequired				
            }          
        ];      

        me.callParent(arguments);
    }
});

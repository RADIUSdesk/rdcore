Ext.define('Rd.view.dynamicDetails.pnlDynamicDetailLogo', {
    extend      : 'Ext.form.Panel',
    alias       : 'widget.pnlDynamicDetailLogo',    
    autoScroll	: true,
    plain       : true,
    frame       : false,
    layout      : {
        type    : 'vbox',
        pack    : 'start',
        align   : 'stretch'
    },
    margin      : 5,  
    dynamic_detail_id: null,
    fieldDefaults: {
        msgTarget       : 'under',
        labelAlign      : 'left',
        labelSeparator  : '',
        labelWidth      : Rd.config.labelWidth+20,
        margin          : Rd.config.fieldMargin,
        labelClsExtra   : 'lblRdReq'
    },   
    url     : Ext.BLANK_IMAGE_URL,
    buttons : [
         {
            itemId      : 'cancel',
            text        : i18n('sCancel'),
            scale       : 'large',
            glyph       : Rd.config.icnClose,
            margin      : Rd.config.buttonMargin
        },
        {
            itemId      : 'save',
            formBind    : true,
            text        : i18n('sSave'),
            scale       : 'large',
            glyph       : Rd.config.icnYes,
            margin      : Rd.config.buttonMargin,
            ui          : 'button-teal'
        }     
    ],
    initComponent: function(){
        var me = this;
        var w_prim  = 550;

        var tplImg = new Ext.Template([
                    "<div class='divMapAction'>",
                        "<img src='{image}' alt='DynamicDetail logo'>",
                    "</div>"
                ]);

        me.items = [
            {
                xtype   : 'panel',
                flex    : 1,
                title       : "Logo",
                border  : false,
                itemId  : 'pnlImg',
                bodyPadding : 10,
                glyph   : Rd.config.icnCertificate, 
                ui      : 'panel-blue',
                tpl     : tplImg,
                data    : {img : me.url}
            },
            {
                xtype       : 'container',
                width       : w_prim,
                items       : [
                    {
                        xtype       : 'filefield',
                        itemId      : 'form-file',
                        emptyText   : i18n('sSelect_an_image'),
                        fieldLabel  : i18n('sNew_logo'),
                        allowBlank  : false,
                        name        : 'photo',
                        width       : w_prim,
                        buttonText  : '',
                        buttonConfig: {
                            glyph: Rd.config.icnFolder
                        }   
                    }
                ]
            }         
        ];

        me.callParent(arguments);
    }
});

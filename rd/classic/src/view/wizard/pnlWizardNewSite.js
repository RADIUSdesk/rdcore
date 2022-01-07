Ext.define('Rd.view.wizard.pnlWizardNewSite', {
    extend  : 'Ext.panel.Panel',
    alias   : 'widget.pnlWizardNewSite',
    border  : false,
    layout  : 'border',
    requires: [
        'Ext.layout.container.Card',
        'Ext.form.Panel',
        'Ext.form.field.Text',
        'Ext.form.FieldContainer',
        'Ext.form.field.Radio',
        'Rd.view.wizard.vcWizardNewSite',
        'Rd.view.components.cmbCountries',      
        'Rd.view.components.cmbTimezones',
        'Rd.view.dynamicDetails.cmbThemes'
    ],
    controller  : 'vcWizardNewSite',
    initComponent: function(){
        var me      = this; 
        var tplImg  = new Ext.Template([
            "<div class='divMapAction'>",
                "<img src='{image}' alt='DynamicDetail logo'>",
            "</div>"
        ]);
        
        //Create the view for the wallpapers:
     /*   var imageTpl = new Ext.XTemplate(
            '<tpl for=".">',
                '<div class="thumb-wrap">',
                    '<div>',
                        '<img src="{img}" />',  
                    '</div>',
                '</div>',
            '</tpl>'
        );*/
        
        var imageTpl = new Ext.XTemplate(
            '<tpl for=".">',
                '<div class="thumb-wrap">',
                    '<div>',
                        '<div><h1>{title}</h1></div>',
                            '<img src="{img}" />',
                        '<div class="description">{description}</div>',
                        '<tpl if="Ext.isEmpty(url)">', //If the url is not empty add the link
                            '<div></div>',
                        '<tpl else>',
                            '<div><a href="{url}" target="_blank">{url}</a></div>',
                        '</tpl>',
                    '</div>',
                //'</div>',
                    '<div class="thumb-info">',
                        '<ul class="fa-ul">',
                        //Active start 
                        '<tpl if="active">',
                            '<li><span class="txtGreen"><i class="fa-li fa fa-check-circle"></i>Enabled</span></li>',
                        '<tpl else>',
                            '<li><span class="txtGrey"><i class="fa-li fa fa-minus-circle"></i>Disabled</span></li>',
                        '</tpl>',
                        //Active end
                        //Fit start 
                        '<tpl if="fit==\'stretch_to_fit\'">',
                            '<li><i class="fa-li fa fa-expand"></i>Stretch To Fit</li>',
                        '</tpl>',
                        '<tpl if="fit==\'horizontal\'">',
                            '<li><i class="fa-li fa fa-expand"></i>Horizontal Fit</li>',
                        '</tpl>',
                        '<tpl if="fit==\'vertical\'">',
                            '<li><i class="fa-li fa fa-expand"></i>Vertical Fit</li>',
                        '</tpl>',
                        '<tpl if="fit==\'original\'">',
                            '<li><i class="fa-li fa fa-expand"></i>Original Size</li>',
                        '</tpl>', 
                        //Fit end
                          '<li style="background-color:#{background_color};"><i class="fa-li fa fa-paint-brush"></i>Background HTML <b>#{background_color}</b></li>',
                          '<li><i class="fa-li fa fa-clock-o"></i>Slide duration <b>{slide_duration}</b> seconds</li>',
                        //Title 
                        '<tpl if="include_title">',
                            '<li><span class="txtGreen"><i class="fa-li fa fa-check-circle"></i>Show Title</span></li>',
                        '<tpl else>',
                            '<li><span class="txtGrey"><i class="fa-li fa fa-minus-circle"></i>Hide Title</span></li>',
                        '</tpl>',
                        //Title end
                        //Description 
                        '<tpl if="include_description">',
                            '<li><span class="txtGreen"><i class="fa-li fa fa-check-circle"></i>Show Description</span></li>',
                        '<tpl else>',
                            '<li><span class="txtGrey"><i class="fa-li fa fa-minus-circle"></i>Hide Description</span></li>',
                        '</tpl>',
                        //Description end
                        '</ul>',
                    '</div>',
                '</div>',   
            '</tpl>'
        );
        

        me.store = Ext.create(Ext.data.Store,{
            model: 'Rd.model.mDynamicPhoto',
            proxy: {
                type    :'ajax',
                url     : '/cake3/rd_cake/wizards/index-photo.json',
                format  : 'json',
                reader  : {
                    keepRawData     : true,
                    type: 'json',
                    rootProperty: 'items'
                },
                api: {
                    destroy  : '/cake3/rd_cake/wizards/delete-photo.json'
                }
            },
            listeners: {
                load: function(store, records, successful) {
                    if(!successful){
                        Ext.ux.Toaster.msg(
                            'Error encountered',
                            store.getProxy().getReader().rawData.message.message,
                            Ext.ux.Constants.clsWarn,
                            Ext.ux.Constants.msgWarn
                        );
                    }
                },
                scope: this
            }
        });

        var v = Ext.create('Ext.view.View', {
            store       : me.store,
            multiSelect : true,
            tpl         : imageTpl,
            itemId      : 'dvPhotos',
            width       :  450,
            itemSelector: 'div.thumb-wrap',
            emptyText   : i18n('sNo_images_available')
        });
               
        me.items    = [
            {
                xtype       : 'panel',
                layout      : 'card',
                region      : 'center',
                itemId      : 'pnlCardNewSite',
                ui          : 'light',
                margin      : 5,
                items       : [
                    {
                        xtype       : 'form',
                        itemId      : 'pnlOne',
                        title       : 'Step 1 of 5',
                        autoScroll  : true,
                        layout      : 'anchor',
                        defaults    : {
                            anchor  : '100%'
                        },
                        bodyPadding : 10,
                        defaultType : 'textfield',
                        fieldDefaults: {
                            msgTarget       : 'under',
                            labelClsExtra   : 'lblRd',
                            labelAlign      : 'left',
                            labelSeparator  : '',
                            margin          : Rd.config.fieldMargin,
                            maxWidth        : Rd.config.maxWidth
                        },
                        items       : [
                            {
                                xtype       : 'label',
                                margin      : Rd.config.fieldMargin,
                                cls         : 'lblRdReq',
                                text        : 'The business or property you are signing up'
                            },
                            {
                                name        : 'name',
                                itemId      : 'txtName',
                                allowBlank  : false,
                                emptyText   : 'Specify a value to continue',
                                regex       : /^[\w\-\s]+$/,
                                regexText   : "Only words allowed",
                                listeners       : {
                                    change  : 'onTxtNameChange',
                                    blur    : 'onTxtNameBlur'
                                } 
                            },
                            {
                                xtype       : 'label',
                                margin      : Rd.config.fieldMargin,
                                cls         : 'lblRdReq',
                                text        : 'Password for Operator'
                            },
                            {
                                name        : 'password',
                                itemId      : 'txtPassword',
                                allowBlank  : false,
                                emptyText   : 'Specify a value to continue',
                                minLength   : 5
                            },
                            {
                                xtype       : 'label',
                                margin      : Rd.config.fieldMargin,
                                cls         : 'lblRdReq',
                                text        : 'The SSID used by guests (open)'
                            },
                            {
                                name        : 'ssid_guest',
                                itemId      : 'ssid_guest',
                                value       : 'Guest',
                                allowBlank  : false,
                                maxLength   : 31,
                                regex       : /^[\w\-\s]+$/,
                                regexText   : "Only words allowed",
                                emptyText   : 'Specify a value to continue'
                            },
                            {
                                xtype       : 'label',
                                margin      : Rd.config.fieldMargin,
                                cls         : 'lblRdReq',
                                text        : 'The SSID used by staff (secure)'
                            },
                            {
                                name        : 'ssid_wireless',
                                itemId      : 'ssid_wireless',
                                value       : 'Wireless',
                                maxLength   : 31,
                                allowBlank  : false,
                                regex       : /^[\w\-\s]+$/,
                                regexText   : "Only words allowed",
                                emptyText   : 'Specify a value to continue'
                            },
                            {
                                xtype       : 'label',
                                margin      : Rd.config.fieldMargin,
                                cls         : 'lblRdReq',
                                text        : 'Secure SSID passphrase'
                            },
                            {
                                name        : 'key_wireless',
                                itemId      : 'key_wireless',
                                value       : '12345678',
                                minLength   : 8,
                                allowBlank  : false,
                                emptyText   : 'Specify a value to continue'
                            }
                        ],
                        buttons     : [
                            {
                                itemId  : 'btnOneNext',
                                text    : i18n('sNext'),
                                scale   : 'large',
                                ui      : 'button-teal',
                                glyph   : Rd.config.icnNext,
                                formBind: true,
                                margin  : Rd.config.buttonMargin,
                                listeners       : {
                                            click : 'onBtnOneNextClick'
                                } 
                            }
                        ]
                    },
                    {
                    
                        xtype       : 'form',
                        itemId      : 'pnlTwo',
                        title       : 'Step 2 of 5',
                        autoScroll  : true,
                        layout      : 'anchor',
                        defaults    : {
                            anchor  : '100%'
                        },
                        bodyPadding : 10,
                        defaultType : 'checkbox',
                        fieldDefaults: {
                            msgTarget       : 'under',
                            labelClsExtra   : 'lblRd',
                            labelAlign      : 'left',
                            labelSeparator  : '',
                            margin          : Rd.config.fieldMargin,
                            maxWidth        : Rd.config.maxWidth
                        },
                        listeners: {
                            activate: 'pnlTwoActivate'
                        },
                        items       : [
                            {
                                xtype       : 'cmbCountries',
                                anchor      : '100%',
                                labelClsExtra: 'lblRdReq'
                            },
                            {
                                xtype       : 'cmbTimezones',
                                anchor      : '100%',
                                labelClsExtra: 'lblRdReq'
                            },       
                            {
                                xtype       : 'label',
                                margin      : Rd.config.fieldMargin,
                                cls         : 'lblRdReq',
                                text        : 'Select the user types you want to use'
                            },
                            {
                                boxLabel    : 'Vouchers',
                                name        : 'voucher_login_check',
                                cls         : 'lblRd',
                                checked     : true
                            }, 
                            {
                                boxLabel    : 'Permanent Users',
                                name        : 'user_login_check',
                                cls         : 'lblRd',
                                checked     : true
                            }, 
                            {
                                boxLabel    : 'Click to connect',
                                name        : 'connect_check',
                                cls         : 'lblRd',
                                checked     : true
                            }    
                        ],
                        buttons     : [
                            {
                                text    : 'Cancel',
                                scale   : 'large',
                                glyph   : Rd.config.icnClose,
                                margin  : Rd.config.buttonMargin,
                                listeners       : {
                                    click : 'onBtnCancelClick'
                                } 
                            },
                            {
                                itemId  : 'btnTwoNext',
                                text    : i18n('sNext'),
                                scale   : 'large',
                                ui      : 'button-teal',
                                glyph   : Rd.config.icnNext,
                                formBind: true,
                                margin  : Rd.config.buttonMargin,
                                listeners       : {
                                            click : 'onBtnTwoNextClick'
                                } 
                            }
                        ]
                    },
                    
                    {
                        xtype   : 'panel',
                        frame   : true,
                        title   : 'Step 3 of 5 -> Select Logo',
                        height  : '100%', 
                        width   :  450,
                        autoScroll  : true,
                        layout: {
                            type    : 'vbox',
                            align   : 'stretch'
                        },
                        listeners: {
                            activate: 'pnlThreeActivate'
                        },
                        items   : [
                            {
                                xtype   : 'panel',
                               // title   : i18n('sCurrent_logo'),
                                flex    : 1,
                                border  : false,
                                itemId  : 'pnlImg',
                                tpl     : tplImg,
                                data    : {img : me.url}
                            },
                            { 
                                xtype       :  'form', 
                                layout      : 'anchor',
                                autoScroll  :true,
                                frame       : false,
                                defaults    : {
                                    anchor: '100%'
                                },
                                fieldDefaults: {
                                    msgTarget       : 'under',
                                    labelClsExtra   : 'lblRd',
                                    labelAlign      : 'left',
                                    labelSeparator  : '',
                                    margin          : Rd.config.fieldMargin,
                                    maxWidth        : Rd.config.maxWidth
                                },
                                items       : [
                                    {
                                        xtype       : 'filefield',
                                        itemId      : 'form-file',
                                        emptyText   : i18n('sSelect_an_image'),
                                        fieldLabel  : i18n('sNew_logo'),
                                        allowBlank  : false,
                                        name        : 'photo',
                                        buttonText  : '',
                                        buttonConfig: {
                                            glyph   : Rd.config.icnFolder
                                        }   
                                    }          
                                ],
                                buttons: [
                                    {
                                        itemId  : 'btnLogoSave',
                                        formBind: true,
                                        text    : i18n('sSave'),
                                        scale   : 'large',
                                        glyph   : Rd.config.icnYes,
                                        margin  : Rd.config.buttonMargin,
                                        listeners : {
                                            click : 'onBtnLogoSaveClick'
                                        } 
                                    }, 
                                    {
                                        text    : 'Cancel',
                                        scale   : 'large',
                                        glyph   : Rd.config.icnClose,
                                        margin  : Rd.config.buttonMargin,
                                        listeners : {
                                            click : 'onBtnCancelClick'
                                        } 
                                    },
                                    {
                                        itemId  : 'btnThreeNext',
                                        text    : i18n('sNext'),
                                        scale   : 'large',
                                        ui      : 'button-teal',
                                        glyph   : Rd.config.icnNext,
                                        margin  : Rd.config.buttonMargin,
                                        listeners : {
                                            click : 'onBtnThreeNextClick'
                                        } 
                                    }
                                ]
                            }
                        ]
                    },
                    {
                    
                        xtype       : 'panel',
                        itemId      : 'pnlFour',
                        title       : 'Step 4 of 5 -> Upload Images',
                        autoScroll  : true,
                        xtype       : 'panel',
                        frame       : false,
                        height      : '100%', 
                        width       :  550,
                        layout: {
                            type    : 'vbox',
                            align   : 'begin'
                        },
                        listeners: {
                            activate: 'pnlFourActivate'
                        },
                        items       : v,
                        tbar        :  [
                            {
                                "xtype": "buttongroup",
                                "items": [
                                    {
                                        "xtype": "button",
                                        "glyph": "xf021@FontAwesome",
                                        "scale": "large",
                                        "tooltip": "Reload",
                                         listeners : {
                                            click : 'onBtnPhotoReloadClick'
                                        } 
                                    },
                                    {
                                        "xtype": "button",
                                        "glyph": "xf067@FontAwesome",
                                        "scale": "large",
                                        "tooltip": "Add",
                                         listeners : {
                                            click : 'onBtnPhotoAddClick'
                                        } 
                                    },
                                    {
                                        "xtype": "button",
                                        "glyph": "xf1f8@FontAwesome",
                                        "scale": "large",
                                        "tooltip": "Delete",
                                        'itemId' : 'photoDelete',
                                         listeners : {
                                            click : 'onBtnPhotoDeleteClick'
                                        } 
                                    }
                                ]
                            }
                        ],
                        buttons     : [
                            {
                                text    : 'Cancel',
                                scale   : 'large',
                                glyph   : Rd.config.icnClose,
                                margin  : Rd.config.buttonMargin,
                                listeners       : {
                                    click : 'onBtnCancelClick'
                                } 
                            },
                            {
                                itemId  : 'btnFourNext',
                                text    : 'Next',
                                scale   : 'large',
                                ui      : 'button-teal',
                                glyph   : Rd.config.icnNext,
                                formBind: true,
                                margin  : Rd.config.buttonMargin,
                                listeners       : {
                                            click : 'onBtnFourNextClick'
                                } 
                            }
                        ]
                    },
                    {              
                        xtype       : 'form',
                        itemId      : 'pnlFive',
                        title       : 'Step 5 of 5 -> Select a Theme',
                        autoScroll  : true,
                        layout      : 'anchor',
                        defaults    : {
                            anchor  : '100%'
                        },
                        bodyPadding : 10,
                        defaultType : 'checkbox',
                        fieldDefaults: {
                            msgTarget       : 'under',
                            labelClsExtra   : 'lblRd',
                            labelAlign      : 'left',
                            labelSeparator  : '',
                            margin          : Rd.config.fieldMargin,
                            maxWidth        : Rd.config.maxWidth
                        },
                        items       : [
                            { 
								xtype       : 'cmbThemes', 
								anchor      : '100%',
								labelClsExtra : 'lblRdReq',
								allowBlank  : false,
								excludeCustom : true,
								listeners   : {
                                    change : 'onCmbThemesChange'
                                } 
							} 
                        ],
                        buttons     : [
                            {
                                text    : 'Preview Mobile',
                                scale   : 'large',
                                glyph   : Rd.config.icnMobile,
                                margin  : Rd.config.buttonMargin,
                                listeners       : {
                                    click : 'previewMobile'
                                }
                            },
                            {
                                text    : 'Preview Desktop',
                                scale   : 'large',
                                glyph   : Rd.config.icnDesktop,
                                margin  : Rd.config.buttonMargin,
                                listeners       : {
                                    click : 'previewDesktop'
                                }
                            },
                            '->', 
                            {
                                text    : 'Cancel',
                                scale   : 'large',
                                glyph   : Rd.config.icnClose,
                                margin  : Rd.config.buttonMargin,
                                listeners       : {
                                    click : 'onBtnCancelClick'
                                } 
                            },
                            {
                                itemId  : 'btnFiveNext',
                                text    : 'Finish',
                                scale   : 'large',
                                ui      : 'button-teal',
                                glyph   : Rd.config.icnNext,
                                formBind: true,
                                margin  : Rd.config.buttonMargin,
                                listeners       : {
                                            click : 'onBtnFiveNextClick'
                                } 
                            }
                        ]
                    }
                ]
            },
            {
                xtype       : 'panel',
                title       : 'Info',
                itemId      : 'pnlInfo',
                glyph       : Rd.config.icnInfo,
                autoScroll  : true,
                width       : 400,
                margin      : 5,
                bodyPadding : 10,
                region      :'east',
                ui          : 'light',
                layout      : {
                    type    : 'fit'
                },
                collapsible : true,
                collapsed   : false,
                collapseDirection: 'right',
                listeners       : {
                    afterrender : 'onPnlInfoAfterrender'
                } 
            }
        ];  
        me.callParent(arguments);
    },
    
    mkScrnOne: function(){  
        
    }
});

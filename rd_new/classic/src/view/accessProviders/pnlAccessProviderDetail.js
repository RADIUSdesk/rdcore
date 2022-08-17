Ext.define('Rd.view.accessProviders.pnlAccessProviderDetail', {
    extend      : 'Ext.form.Panel',
    alias       : 'widget.pnlAccessProviderDetail',
    autoScroll	: true,
    plain       : true,
    frame       : false,
    layout      : {
        type    : 'vbox',
        pack    : 'start',
        align   : 'stretch'
    },
    margin      : 5,  
    ap_id       : null,
    fieldDefaults: {
        msgTarget       : 'under',
        labelAlign      : 'left',
        labelSeparator  : '',
        labelWidth      : Rd.config.labelWidth+20,
        margin          : Rd.config.fieldMargin,
        labelClsExtra   : 'lblRdReq'
    },
    requires    : [
        'Rd.view.accessProviders.vcAccessProviderDetails'
    ],
    controller  : 'vcAccessProviderDetails',
    buttons : [
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
        
        var cntRequired  = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
            items       : [
                
                {
                    xtype       : 'displayfield',
                    fieldLabel  : 'API Key',
                    name        : 'api_key',
                    value       : me.api_key,
                    labelClsExtra: 'lblRdReq'
                },
                {
                    xtype   : 'textfield',
                    name    : "id",
                    hidden  : true,
                    value   : me.ap_id,
                    itemId  : 'ap_id'
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : i18n('sUsername'),
                    name        : "username",
                    allowBlank  :false,
                    blankText   : i18n("sEnter_a_value"),
                    labelClsExtra: 'lblRdReq'
                },
                { 
                    xtype       : 'cmbLanguages', 
                    width       : 350, 
                    fieldLabel  : i18n('sLanguage'),  
                    name        : 'language', 
                    allowBlank  : false,
                    labelClsExtra: 'lblRdReq' 
                },
                { 
                    xtype       : 'cmbTimezones',
                    labelClsExtra: 'lblRdReq',
                    name        : 'timezone_id' 
                },
                {
                    xtype       : 'checkbox',      
                    fieldLabel  : i18n('sActivate'),
                    name        : 'active',
                    inputValue  : 'active',
                    checked     : true,
                    labelClsExtra: 'lblRdReq'
                }     
            ]
        }
        
        var cntOptional  = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
            items       : [
                 {
                    xtype       : 'textfield',
                    fieldLabel  : i18n('sName'),
                    name        : "name"
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : i18n('sSurname'),
                    name        : "surname"
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : i18n('sPhone'),
                    name        : "phone",
                    vtype       : 'Numeric'
                },
                {
                    xtype       : 'textfield',
			        itemId		: 'txEmail',
                    fieldLabel  : i18n('s_email'),
                    name        : "email",
                    vtype       : 'email',
                    listeners   : {
                        change : 'onTxEmailChange'
                    } 
                },
                {
                    xtype       : 'checkbox',
                    itemId      : 'chkGetAlerts',      
                    fieldLabel  : 'Get Email Alerts',
                    name        : 'alert_activate',
                    inputValue  : 'alert_activate',
                    checked     : false,
                    disabled    : true,
                    listeners   : {
                        change : 'onChkGetAlertsChange'
                    } 
                },
		        {
		          xtype       : 'numberfield',
		          fieldLabel  : 'Frequency (every N hours)',
		          name        : 'alert_frequency',
		          itemId      : 'fldFrequency',
		          allowBlank  : false,
		          minValue    : 1,
		          maxValue    : 12,
		          step        : 1,
		          keyNavEnabled : true,
                  disabled    : true,
                  value       : 1
		        },
                {
                    xtype     : 'textareafield',
                    grow      : true,
                    name      : 'address',
                    fieldLabel: i18n('sAddress'),
                    anchor    : '100%'
                }
            ]
        }
        
        var cntWhiteLabel  = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
            items       : [
                {
                    xtype       : 'checkbox',
                    itemId      : 'chkWlActive',      
                    fieldLabel  : i18n('sActivate'),
                    name        : 'wl_active',
                    inputValue  : 'wl_active',
                    checked     : false,
                    listeners   : {
                        change : 'onChkWlActiveChange'
                    } 
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'Header Text',
                    name        : "wl_header",
                    itemId      : 'txtWlHeader',
                    disabled    : true
                },
                {
                    xtype       : 'colorfield',
                    fieldLabel  : 'Header Background',
                    name        : 'wl_h_bg',
                    beforeBodyEl: [
                        '<div class="' + Ext.baseCSSPrefix + 'colorpicker-field-swatch custom-color-picker-swatch">' +
                            '<div id="{id}-swatchEl" data-ref="swatchEl" class="' + Ext.baseCSSPrefix +
                                    'colorpicker-field-swatch-inner"></div>' +
                        '</div>'
                    ],
                    value       : '#FFFFFF',
                    itemId      : 'clrWlHeaderBg',
                    disabled    : true
                },
                {
                    xtype       : 'colorfield',
                    fieldLabel  : 'Header Foreground',
                    name        : 'wl_h_fg',
                    beforeBodyEl: [
                        '<div class="' + Ext.baseCSSPrefix + 'colorpicker-field-swatch custom-color-picker-swatch">' +
                            '<div id="{id}-swatchEl" data-ref="swatchEl" class="' + Ext.baseCSSPrefix +
                                    'colorpicker-field-swatch-inner"></div>' +
                        '</div>'
                    ],
                    value       : '#4b4c4c',
                    itemId      : 'clrWlHeaderFg',
                    disabled    : true
                    
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'Footer Text',
                    name        : "wl_footer",
                    itemId      : 'txtWlFooter',
                    disabled    : true
                },
                {
                    xtype       : 'checkbox',
                    itemId      : 'chkWlImgActive',      
                    fieldLabel  : 'Include Logo',
                    name        : 'wl_img_active',
                    inputValue  : 'wl_img_active',
                    checked     : false,
                    disabled    : true,
                    listeners   : {
                        change : 'onChkWlImgActiveChange'
                    } 
                },
                {
                    xtype       : 'filefield',
                    itemId      : 'flWlImgFileUpload',
                    emptyText   : i18n('sSelect_an_image'),
                    fieldLabel  : 'New Logo File',
                    allowBlank  : true,
                    name        : 'wl_img_file_upload',
                    buttonText  : '',
                  //  disabled    : true,
                    buttonConfig: {
                        iconCls: 'upload-icon',
                        glyph: Rd.config.icnFolder
                    }  
                },
                {
                    xtype       : 'textfield',
                    name        : "wl_img_file",
                    hidden      : true
                },
                {
                    xtype       : 'image',
                  //  src         : '/cake3/rd_cake/img/access_providers/logo.png', //Souces it when form loads
                    autoEl      : 'div',
                    title       : 'Current Logo',
                    itemId      : 'imgWlLogo',
                    minHeight   : 100
                }         
            ]
        }
        
        
        me.items = [
            {
                xtype       : 'panel',
                title       : "Required Info",
                glyph       : Rd.config.icnInfo, 
                ui          : 'panel-blue',
                layout      : {
                  type  : 'vbox',
                  align : 'start',
                  pack  : 'start'
                },
                bodyPadding : 10,
                items       : cntRequired				
            },
            {
                xtype       : 'panel',
                title       : "User Info",
                glyph       : Rd.config.icnUser, 
                ui          : 'panel-green',
                layout      : {
                  type      : 'vbox',
                  align     : 'start',
                  pack      : 'start'
                },
                bodyPadding : 10,
                items       : cntOptional				
            },
            {
                xtype       : 'panel',
                title       : "White Label",
                glyph       : Rd.config.icnTag, 
                ui          : 'panel-green',
                layout      : {
                  type      : 'vbox',
                  align     : 'start',
                  pack      : 'start'
                },
                bodyPadding : 10,
                items       : cntWhiteLabel				
            }
        ];    
        me.callParent(arguments);
    }
});

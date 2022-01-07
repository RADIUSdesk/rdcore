Ext.define('Rd.view.dynamicDetails.pnlDynamicDetailTweaks', {
    extend      : 'Ext.form.Panel',
    alias       : 'widget.pnlDynamicDetailTweaks',
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
    defaults    : {
            border: false
    },
    fieldDefaults: {
        msgTarget       : 'under',
        labelAlign      : 'left',
        labelSeparator  : '',
        labelWidth      : Rd.config.labelWidth+20,
        margin          : Rd.config.fieldMargin,
        labelClsExtra   : 'lblRdReq'
    },
    requires: [
        'Ext.form.field.Text',
        'Rd.view.dynamicDetails.vcDynamicDetailTweaks',
        'Rd.view.dynamicDetails.cmbDynamicLanguages',
        'Rd.view.components.rdColorfield',
        'Rd.view.dynamicDetails.tagDynamicLanguages'
    ],
    controller  : 'vcDynamicDetailTweaks',
    listeners   : {
        activate : 'onViewActivate'
    },
    url: '/cake3/rd_cake/dynamic-detail-translations/get-pnl-content.json',
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
    OldInitComponent: function(){

        var me      = this;
        var w_prim  = 550;
        var w_sec   = 350;
        var w_chk   = 200; 
        
        var pnlFbOptions = {
            xtype       : 'panel',
            //hidden      : true,
            disabled    : true,
            bodyStyle   : 'background: #e0ebeb',
            itemId      : 'pnlFbOptions',
            items   : [     
                {
		            xtype       : 'checkbox',
		            fieldLabel  : 'Share After FB Login',
		            name        : "share_after_FB_login",
		            width       : w_prim,
		            itemId      : 'chkShareFbAfterLogin'
	            },
	            {
		            xtype       : 'textfield',
		            fieldLabel  : 'FB App ID',
		            name        : "FB_app_id",
		            allowBlank  : false,
		            disabled    : true,
		            blankText   : i18n("sSupply_a_value"),
		            width       : w_prim,
		            itemId      : 'txtFbAppId'
	            },
	            {
		            xtype       : 'textfield',
		            fieldLabel  : 'FB Page To Share',
		            name        : "FB_page_to_share",
		            allowBlank  : false,
		            disabled    : true,
		            blankText   : i18n("sSupply_a_value"),
		            width       : w_prim,
		            itemId      : 'txtFbPageToShare'
	            }  
            ]            
        };
        
        var pnlColors = {
            xtype       : 'panel',
            bodyStyle   : 'background: #e0ebeb',
            items   : [
                 {
                    xtype       : 'rdColorfield',
                    fieldLabel  : 'Infobar Colour',
                    width       : w_prim,
                    name        : 'infobar_colour'
                },
		        {
                    xtype       : 'colorfield',
                    fieldLabel  : 'WiFi Caption Colour',
                    width       : w_prim,
                    name        : 'wifi_caption_colour',
                    beforeBodyEl: [
                        '<div class="' + Ext.baseCSSPrefix + 'colorpicker-field-swatch custom-color-picker-swatch">' +
                            '<div id="{id}-swatchEl" data-ref="swatchEl" class="' + Ext.baseCSSPrefix +
                                    'colorpicker-field-swatch-inner"></div>' +
                        '</div>'
                    ],
                    value       : '#DDDDE5'
                },
		        {
                    xtype       : 'colorfield',
                    fieldLabel  : 'Background 1',
                    width       : w_prim,
                    name        : 'background_colour1',
                    beforeBodyEl: [
                        '<div class="' + Ext.baseCSSPrefix + 'colorpicker-field-swatch custom-color-picker-swatch">' +
                            '<div id="{id}-swatchEl" data-ref="swatchEl" class="' + Ext.baseCSSPrefix +
                                    'colorpicker-field-swatch-inner"></div>' +
                        '</div>'
                    ],
                    value       : '#DDDDE5'
                },
                {
                    xtype       : 'colorfield',
                    fieldLabel  : 'Background 2',
                    width       : w_prim,
                    name        : 'background_colour2',
                    beforeBodyEl: [
                        '<div class="' + Ext.baseCSSPrefix + 'colorpicker-field-swatch custom-color-picker-swatch">' +
                            '<div id="{id}-swatchEl" data-ref="swatchEl" class="' + Ext.baseCSSPrefix +
                                    'colorpicker-field-swatch-inner"></div>' +
                        '</div>'
                    ],
                    value       : '#DDDDE5'
                },
                {
                    xtype       : 'colorfield',
                    fieldLabel  : 'Background 3',
                    width       : w_prim,
                    name        : 'background_colour3',
                    beforeBodyEl: [
                        '<div class="' + Ext.baseCSSPrefix + 'colorpicker-field-swatch custom-color-picker-swatch">' +
                            '<div id="{id}-swatchEl" data-ref="swatchEl" class="' + Ext.baseCSSPrefix +
                                    'colorpicker-field-swatch-inner"></div>' +
                        '</div>'
                    ],
                    value       : '#DDDDE5'
                }  
            ]
        };
             
        var cntTop  = {
            xtype       : 'container',
            items       : [              
                
                {
			        xtype       : 'textfield',
			        fieldLabel  : 'SSID',
			        name        : "ssid",
			        allowBlank  : false,
			        blankText   : i18n("sSupply_a_value"),
			        width       : w_prim
		        },
		        {
			        xtype       : 'textfield',
			        fieldLabel  : 'WiFi Caption',
			        name        : "wifi_caption",
			        allowBlank  : false,
			        blankText   : i18n("sSupply_a_value"),
			        width       : w_prim
		        },
		        {
                    xtype       : 'checkboxgroup',
                    vertical    : false,
                    fieldLabel  : 'Options',
                    labelWidth  : Rd.config.labelWidth,
                    columns     : 2,
                    vertical    : false,
                    items: [
                        { 
				            boxLabel    : 'Random Slideshow',
				            name        : 'slideshow_random',
				            width       : w_chk
			            },
                        { 
                            boxLabel    : 'No Splash Page', 
                            name        : 'no_splash',
                            width       : w_chk
                        },
                        { 
                            boxLabel    : 'No Welcome Page', 
                            name        : 'no_welcome',
                            width       : w_chk
                        },
                        { 
                            boxLabel    : 'Show Policy', 
                            name        : 'show_policy',
                            width       : w_chk
                        },
                        { 
				            boxLabel    : 'Only Email Registartion',
				            name        : 'only_email_registration',
				            width       : w_chk
			            },
                        { 
                            boxLabel    : 'Email Registration And Suffix', 
                            name        : 'email_registration_add_suffix',
                            width       : w_chk
                        }, 
                        { 
				            boxLabel    : 'Connect With Registered',
				            name        : 'connect_with_registered',
				            width       : w_chk
			            },
                        { 
                            boxLabel    : 'Email And Password', 
                            name        : 'email_and_password',
                            width       : w_chk
                        },         
                        { 
				            boxLabel    : 'Password Only',
				            name        : 'password_only',
				            width       : w_chk
			            }
                    ]
                },                
                pnlColors
            ]
        };      
        me.items = [
            {
                xtype       : 'panel',
                title       : "General",
                glyph       : Rd.config.icnGears, 
                ui          : 'panel-blue',
                layout      : 'fit',
                items       : cntTop,
                bodyPadding : 10
            }, 
           {
                xtype       : 'panel',
                title       : "Supported Languages",
                glyph       : Rd.config.icnGlobe, 
                ui          : 'panel-green',
                layout      : {
                  type  : 'vbox',
                  align : 'start',
                  pack  : 'start'
                },
                bodyPadding : 10,
                items       : [
                    {
                        fieldLabel      : 'Default Language',
                        xtype           : 'cmbDynamicLanguages',
                        labelClsExtra   : 'lblRdReq',
                        width           : w_prim
                    },       
                    {
                        xtype           : 'tagDynamicLanguages',
                        width           : w_prim
                    },
                    {
                        xtype           : 'button',
                        text            : 'Translations',
                        glyph           : Rd.config.icnGlobe,
                        scale           : 'small',
                        ui              : 'button-orange',
                        width           : w_prim,
                        itemId          : 'translate',
                        margin          : 12
                    }
                ]
            },
            {
                xtype       : 'panel',
                title       : 'Social Login (OAuth)',
                glyph       : Rd.config.icnFacebook, 
                ui          : 'panel-green',
                layout      : {
                  type  : 'vbox',
                  align : 'start',
                  pack  : 'start'
                },
           //     bodyStyle   : 'background: #eff6f4',
                bodyPadding : 10,
                items: [
                    {
                        xtype       : 'checkboxgroup',
                        vertical    : false,
                        // Arrange checkboxes into two columns, distributed vertically
                        columns     : 2,
                        vertical    : false,
                        items: [
                            { 
                                boxLabel: '<span style="font-family:FontAwesome;">&#xf09a;</span> Facebook', 
                                name: 'facebook_login',
                                width: w_sec,
                                itemId: 'chkFacebookLogin'
                            },
                            { 
                                boxLabel: '<span style="font-family:FontAwesome;">&#xf099;</span> Twitter', 
                                name: 'twitter_login',
                                width: w_sec
                            }, 
                            { 
                                boxLabel: '<span style="font-family:FontAwesome;">&#xf0e1;</span> LinkedIn',
                                name: 'linkedin_login',
                                width: w_sec
                            },
                            { 
                                boxLabel: '<span style="font-family:FontAwesome;">&#xf179;</span> Apple',
                                name: 'apple_login',
                                width : w_sec
                            },
                            { 
                                boxLabel: '<span style="font-family:FontAwesome;">&#xf1a0;</span> Google',
                                name: 'google_login',
                                width: w_sec
                            },
                            { 
                                boxLabel: '<span style="font-family:FontAwesome;">&#xf17a;</span> Microsoft',
                                name: 'microsoft_login',
                                width: w_sec
                            }    
                        ]
                    },
                    pnlFbOptions
                ]
            }
        ]; 
        
        me.buttons = [
            {
                itemId  : 'save',
                text    : 'SAVE',
                scale   : 'large',
                formBind: true,
                glyph   : Rd.config.icnYes,
                margin  : Rd.config.buttonMargin,
                ui      : 'button-teal'
            }
        ];
                    
        me.callParent(arguments);
    },
    initComponent: function(){
        var me = this;
        Ext.Ajax.request({
            url: me.url,
            method: 'GET',
            success: me.buildPanel,
            scope: me
        });      
        me.callParent(arguments);
    },
    buildPanel: function(response){  
        var me  = this;            
        var s   = Ext.create('Ext.data.Store', {
            fields: [
                {name: 'id',    type: 'string'},
                {name: 'name',  type: 'string'}
            ],
            proxy: {
                    type    : 'ajax',
                    format  : 'json',
                    batchActions: true, 
                    url     : '/cake3/rd_cake/dynamic-detail-translations/languages-list.json',
                    reader: {
                        type            : 'json',
                        rootProperty    : 'items',
                        messageProperty : 'message'
                    }
            },
            autoLoad: true
        });   
        var jsonData  = Ext.JSON.decode(response.responseText);
        if(jsonData.success){
            me.add(jsonData.data);                
        }
    }
});

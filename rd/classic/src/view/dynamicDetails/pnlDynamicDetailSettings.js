Ext.define('Rd.view.dynamicDetails.pnlDynamicDetailSettings', {
    extend  : 'Ext.panel.Panel',
    alias   : 'widget.pnlDynamicDetailSettings',
    border  : false,
    dynamic_detail_id: null,
    layout  : 'hbox',
    bodyStyle: {backgroundColor : Rd.config.panelGrey },
    requires    : [
        'Rd.view.dynamicDetails.vcDynamicDetailSettings',
        'Rd.view.dynamicDetails.cmbExpire',
        'Rd.view.components.rdColorfield',
    ],
    controller  : 'vcDynamicDetailSettings',
    user_id : undefined, // The user_id of the Access Provider who owns the Dynamic Login page -> This will influence the list of Realms and Profiles
    initComponent: function(){
        var me = this;  
        
        var proto = window.location.protocol;
        var host  = window.location.hostname;                       
        var s   = Ext.create('Ext.data.Store', {
            fields: [
                {name: 'id',    type: 'string'},
                {name: 'name',  type: 'string'}
            ],
            proxy: {
                    type    : 'ajax',
                    format  : 'json',
                    batchActions: true, 
                    url     : '/cake3/rd_cake/dynamic-details/i18n.json',
                    reader: {
                        type            : 'json',
                        rootProperty    : 'items',
                        messageProperty : 'message'
                    }
            },
            autoLoad: true
        });
        
        me.items =  { 
                xtype   :  'form',
                height  : '100%', 
                width   :  500,
                layout  : 'fit',
                autoScroll:true,
                frame   : true,
                fieldDefaults: {
                    msgTarget       : 'under',
                    labelClsExtra   : 'lblRd',
                    labelAlign      : 'left',
                    labelSeparator  : '',
                    margin          : Rd.config.fieldMargin,
                    labelWidth      : Rd.config.labelWidth,
                   // maxWidth        : Rd.config.maxWidth  
                },
                items       : [
                    {
                        xtype   : 'tabpanel',
                        layout  : 'fit',
                        xtype   : 'tabpanel',
                        margins : '0 0 0 0',
                        plain   : false,
                        tabPosition: 'bottom',
                        border  : false,
                        items   : [
                            { 
                                'title'     : 'Theme',
                                'layout'    : 'anchor',
                                itemId      : 'tabTheme',
                                defaults    : {
                                    anchor: '100%'
                                },
                                autoScroll:true,
                                items       : [
									{
								        xtype       : 'textfield',
								        name        : "id",
								        hidden      : true
								    },
									{ 
										xtype       : 'cmbThemes', 
										labelClsExtra : 'lblRdReq',
										allowBlank  : false,
										listeners   : {
                                            change : 'onCmbThemesChange'
                                        } 
									},
									{
								        xtype       : 'textfield',
								        fieldLabel  : 'Coova Desktop URL',
								        itemId      : 'txtCoovaDesktopUrl',
								        name        : 'coova_desktop_url',
								        value       : '/rd_login/cc/d/index.html',
								        disabled    : true,
								        hidden      : true,
								        allowBlank  : false,
								        labelClsExtra: 'lblRdReq'
								    },
								    {
								        xtype       : 'textfield',
								        fieldLabel  : 'Coova Mobile URL',
								        itemId      : 'txtCoovaMobileUrl',
								        name        : 'coova_mobile_url',
								        value       : '/rd_login/cc/m/index.html',
								        disabled    : true,
								        hidden      : true,
								        allowBlank  : false,
								        labelClsExtra: 'lblRdReq'
								    },
								    {
								        xtype       : 'textfield',
								        fieldLabel  : 'Mikrotik Desktop URL',
								        itemId      : 'txtMikrotikDesktopUrl',
								        name        : 'mikrotik_desktop_url',
								        value       : '/rd_login/mt/d/index.html',
								        disabled    : true,
								        hidden      : true,
								        allowBlank  : false,
								        labelClsExtra: 'lblRdReq'
								    },
								    {
								        xtype       : 'textfield',
								        fieldLabel  : 'Mikrotik Mobile URL',
								        itemId      : 'txtMikrotikMobileUrl',
								        name        : 'mikrotik_mobile_url',
								        value       : '/rd_login/mt/m/index.html',
								        disabled    : true,
								        hidden      : true,
								        allowBlank  : false,
								        labelClsExtra: 'lblRdReq'
								    },
								    {
								        xtype       : 'checkbox',      
								        fieldLabel  : 'Show Logo',
								        name        : 'show_logo',
								        inputValue  : 'show_logo',
								        checked     : false,
								        labelClsExtra: 'lblRdReq'							         
								    },
								    {
								        xtype       : 'checkbox',      
								        fieldLabel  : 'Show Name',
								        name        : 'show_name',
								        inputValue  : 'show_name',
								        itemId      : 'chkShowName',
								        checked     : false,
								        labelClsExtra: 'lblRdReq',
								        listeners   : {
                                            change : 'chkShowNameChange'
                                        }   							         
								    },
								    {
                                        xtype       : 'rdColorfield',
                                        fieldLabel  : 'Colour Of Name',
                                        name        : 'name_colour',
                                        itemId      : 'clrNameColour',
                                        labelClsExtra: 'lblRdReq',
                                        disabled    : true
                                    },
									{
								        xtype       : 'checkbox',      
								        fieldLabel  : 'Slideshow',
								        itemId      : 'chkSlideshow',
								        name        : 'slideshow_check',
								        inputValue  : 'slideshow_check',
								        checked     : false,
								        labelClsExtra: 'lblRdReq',
								        listeners   : {
                                            change : 'chkSlideshowChange'
                                        }   
								    },								    
								    {
								        xtype       : 'checkbox',      
								        fieldLabel  : 'Enforce Watching',
								        itemId      : 'chkSlideshowEnforce',
								        name        : 'slideshow_enforce_watching',
								        inputValue  : 'slideshow_enforce_watching',
								        checked     : false,
								        labelClsExtra: 'lblRd',
								        disabled    : true,
								        listeners   : {
                                            change : 'chkEnforceChange'
                                        }      
								    },
								    {
								        xtype       : 'numberfield',
								        name        : 'slideshow_enforce_seconds',
								        fieldLabel  : 'Enforce in Seconds',
								        itemId      : 'nrEnforceInSeconds',
								        value       : 30,
								        maxValue    : 300,
								        minValue    : 1,
								        disabled    : true
								    }
                                ]
                            },
                            { 
                                'title'     : 'Login',
                                'layout'    : 'anchor',
                                itemId      : 'tabUsersVouchers',
                                defaults    : {
                                    anchor: '100%'
                                },
                                autoScroll:true,
                                items       : [  
									{
								        xtype       : 'checkbox',      
								        fieldLabel  : 'User login',
								        itemId      : 'chkUserLogin',
								        name        : 'user_login_check',
								        inputValue  : 'user_login_check',
								        checked     : true,
								        labelClsExtra: 'lblRdReq'
								    },
									{
								        xtype       : 'checkbox',      
								        fieldLabel  : 'Auto-add suffix',
								        itemId      : 'chkAutoSuffix',
								        name        : 'auto_suffix_check',
								        inputValue  : 'auto_suffix_check',
								        checked     : true,
								        labelClsExtra: 'lblRd'
								    },
									{
								        xtype       : 'textfield',
								        fieldLabel  : 'Suffix',
								        itemId      : 'txtSuffix',
								        name        : 'auto_suffix',
								        disabled    : true
								    },
									{
								        xtype       : 'checkbox',      
								        fieldLabel  : 'Lost password',
								        itemId      : 'chkLostPassword',
								        name        : 'lost_password',
								        inputValue  : 'lost_password',
								        labelClsExtra: 'lblRd'
								    },
									{
								        xtype       : 'checkbox',      
								        fieldLabel  : 'Voucher login',
								        itemId      : 'chkVoucherLogin',
								        name        : 'voucher_login_check',
								        inputValue  : 'voucher_login_check',
								        checked     : true,
								        labelClsExtra: 'lblRdReq'
								    },
								    {
								        xtype       : 'numberfield',
								        name        : 'show_screen_delay',
								        fieldLabel  : 'Show Screen Delay (Seconds)',
								        value       : 5,
								        maxValue    : 600,
								        minValue    : 0,
								        labelClsExtra: 'lblRdReq'
								    }	          
                                ]
                            },
                            { 
                                'title'     : 'T&Cs',
                                'layout'    : 'anchor',
                                itemId      : 'tabTandC',
                                defaults    : {
                                    anchor: '100%'
                                },
                                autoScroll:true,
                                items       : [
									{
								        xtype       : 'checkbox',      
								        fieldLabel  : 'Agree to T&C',
								        itemId      : 'chkTc',
								        name        : 't_c_check',
								        inputValue  : 't_c_check',
								        checked     : false,
								        labelClsExtra: 'lblRdReq'
								    },
								    {
								        xtype       : 'textfield',
								        fieldLabel  : 'T&C URL',
								        itemId      : 'txtTcUrl',
								        name        : "t_c_url",
								        disabled    : true,
								        allowBlank  : false,
								        vtype       : 'url',
								        labelClsExtra: 'lblRdReq'
								    }              
                                ]
                            },
							{ 
                                'title'     : 'Redirect',
                                'layout'    : 'anchor',
                                itemId      : 'tabRedirect',
                                defaults    : {
                                    anchor: '100%'
                                },
                                autoScroll:true,
                                items       : [
									{
								        xtype       : 'checkbox',      
								        fieldLabel  : 'Redirect after connect',
								        itemId      : 'chkRedirect',
								        name        : 'redirect_check',
								        inputValue  : 'redirect_check',
								        checked     : false,
								        labelClsExtra: 'lblRdReq',
								        listeners   : {
                                            change : 'chkRedirectChange'
                                        }   
								    },
								    {
								        xtype       : 'textfield',
								        fieldLabel  : 'Redirect to URL',
								        itemId      : 'txtRedirectUrl',
								        name        : "redirect_url",
								        disabled    : true,
								        hidden      : true,
								        allowBlank  : false,
								        vtype       : 'url',
								        labelClsExtra: 'lblRdReq'
								    },
									{
								        xtype       : 'checkbox',      
								        fieldLabel  : 'Show usage',
								        itemId      : 'chkUsage',
								        name        : 'usage_show_check',
								        inputValue  : 'usage_show_check',
								        checked     : false,
								        labelClsExtra: 'lblRdReq',
								        listeners   : {
                                            change : 'chkUsageChange'
                                        }  
								    },
								    {
								        xtype       : 'numberfield',
								        name        : 'usage_refresh_interval',
								        fieldLabel  : 'Refresh every (seconds)',
								        itemId      : 'nrUsageRefresh',
								        value       : 120,
								        maxValue    : 600,
								        minValue    : 60,
								        disabled    : true,
								        hidden      : true,
								        labelClsExtra: 'lblRdReq'
								    }	      
                                ]
                            },
                            { 
                                'title'     : i18n('sRegistration'),
                                'layout'    : 'anchor',
                                itemId      : 'tabRegistration',
                                defaults    : {
                                    anchor: '100%'
                                },
                                autoScroll:true,
                                items       : [
									 {
								        xtype       : 'checkbox',      
								        fieldLabel  : i18n('sUser_registration'),
								        itemId      : 'chkRegisterUsers',
								        name        : 'register_users',
								        inputValue  : 'register_users',
								        labelClsExtra: 'lblRdReq',
								        listeners   : {
                                            change : 'onChkRegisterUsersChange'
                                        } 
								    },
								    {
                                        xtype       : 'cmbRealm',
                                        allowBlank  : false,
                                        labelClsExtra: 'lblRdReq',
                                        itemId      : 'realm',
                                        disabled    : true,
						                extraParam  : me.user_id
                                    },
                                    {
                                        xtype       : 'cmbProfile',
                                        allowBlank  : false,
                                        labelClsExtra: 'lblRdReq',
                                        itemId      : 'profile',
                                        disabled    : true,
						                extraParam  : me.user_id
                                    },
								    {
								        xtype       : 'checkbox',      
								        boxLabel    : 'One user registration per device',
								        itemId      : 'chkRegMacCheck',
								        name        : 'reg_mac_check',
								        inputValue  : 'reg_mac_check',
								        disabled    : true,
								        checked     : true,
								        cls         : 'lblRd'
								    },
								    {
                                        xtype       : 'checkbox',      
                                        boxLabel    : 'Auto-add device after authentication',
                                        itemId      : 'chkRegAutoAdd',
                                        name        : 'reg_auto_add',
                                        inputValue  : 'reg_auto_add',
                                        disabled    : true,
                                        checked     : false,
                                        cls         : 'lblRd'
                                    },
                                    {
                                        xtype       : 'checkbox',      
                                        boxLabel    : 'Send confirmation email',
                                        itemId      : 'chkRegEmail',
                                        name        : 'reg_email',
                                        inputValue  : 'reg_email',
                                        disabled    : true,
                                        checked     : false,
                                        cls         : 'lblRd'
                                    }  
                                ]
                            },
                            { 
                                'title'     : i18n('sLanguage'),
                                'layout'    : 'anchor',
                                itemId      : 'tabLanguage',
                                defaults    : {
                                    anchor: '100%'
                                },
                                autoScroll:true,
                                items       : [
                                    {
                                        xtype           : 'cmbDynamicDetailLanguages',
                                        labelClsExtra   : 'lblRdReq'
                                    },
                                    {
                                        fieldLabel      : 'Available Languages',
                                        store           : s,
                                        queryMode       : 'local',
                                        emptyText       : 'Just The Default Language',
                                        displayField    : 'name',
                                        valueField      : 'id',
                                        xtype           : 'tagfield',
                                        name            : 'available_languages[]',
                                        labelClsExtra   : 'lblRd'
                                    } 
                                ]
                            }
                        ]
                    }
                ],
                buttons: [
                    {
                        itemId		: 'save',
                        formBind	: true,
                        text		: i18n('sSave'),
                        scale		: 'large',
                        iconCls		: 'b-save',
                        glyph		: Rd.config.icnYes,
                        margin		: Rd.config.buttonMargin
                    }
                ]
            };

        me.callParent(arguments);
    }
});

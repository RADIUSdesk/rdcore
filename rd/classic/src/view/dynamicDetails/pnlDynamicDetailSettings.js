Ext.define('Rd.view.dynamicDetails.pnlDynamicDetailSettings', {
    extend      : 'Ext.form.Panel',
    alias       : 'widget.pnlDynamicDetailSettings',
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
    requires    : [
        'Rd.view.dynamicDetails.vcDynamicDetailSettings',
        'Rd.view.dynamicDetails.cmbExpire',
        'Rd.view.components.rdColorfield',
    ],
    controller  : 'vcDynamicDetailSettings',
    listeners   : {
        activate : 'onViewActivate'
    },
    user_id : undefined, // The user_id of the Access Provider who owns the Dynamic Login page -> This will influence the list of Realms and Profiles
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
        var me = this;
        
        var w_prim  = 550;
        
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
        
        var cntGeneral  = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
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
        }
        
        var cntLogin = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
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
                    xtype   : 'panel',
                    itemId  : 'pnlAutoSuffix',
                    bodyStyle   : 'background: #f0feff',
                    layout      : 'anchor',
                    defaults    : {
                        anchor  : '100%'
                    },
                    items   : [
				        {
			                xtype       : 'checkbox',      
			                fieldLabel  : 'Auto-add suffix',
			                itemId      : 'chkAutoSuffix',
			                name        : 'auto_suffix_check',
			                inputValue  : 'auto_suffix_check',
			                checked     : true
			            },
				        {
			                xtype       : 'textfield',
			                fieldLabel  : 'Suffix',
			                itemId      : 'txtSuffix',
			                name        : 'auto_suffix',
			                allowBlank  : false,
			                disabled    : true
			            }
			        ]
			    },
			    {
                    xtype   : 'panel',
                    itemId  : 'pnlLostPassword',
                    bodyStyle   : 'background: #f0f5ff',
                    items   : [
                        {
			                xtype       : 'checkbox',      
			                fieldLabel  : 'Lost password',
			                itemId      : 'chkLostPassword',
			                name        : 'lost_password',
			                inputValue  : 'lost_password',
			                listeners   : {
                                change : 'chkLostPasswordChange'
                            }   
			            },
			            {
                            xtype       : 'radiogroup',
                            itemId      : 'rgrpLostPwdMethod',
                            fieldLabel  : 'Method',
                            disabled    : true,
                            columns     : 2,
                            vertical    : true,
                            items: [
                                { boxLabel: 'Email',    name: 'lost_password_method', inputValue: 'email',
                                    margin  : '0 0 0 0',
                                    width   : 150 
                                },
                                { boxLabel: 'SMS',      name: 'lost_password_method', inputValue: 'sms',
                                    margin  : '0 0 0 0',
                                    width   : 150
                                }                                                  
                            ]
                        }                                        
                    ]
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
        }
        
        var cntTc = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
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
        }
        
        var cntRedirect = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
            items       : [
                {
			        xtype       : 'checkbox',      
			        fieldLabel  : 'Redirect',
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
        }
        
        var cntRegister = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
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
        }
        
         var cntLanguage = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
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
        
         
        var cntCoova = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
            items       : [
                {
			        xtype       : 'checkbox',      
			        fieldLabel  : 'JSON Unavailable',
			        name        : 'chilli_json_unavailable',
			        labelClsExtra: 'lblRdReq',
			        afterRender: function (ct, position) {
                        new Ext.ToolTip({
                            target : this.id,
                            trackMouse : false,
                            maxWidth : 250,
                            minWidth : 100,
                            html : "<label class=\'lblTipItem\'>Use with DD-Wrt and Teltonika. Does not need SSL Certs</label>"
                        });
                    }
			    },
			    {
			        xtype       : 'checkbox', 
			        fieldLabel  : 'Use CHAP',
			        name        : "chilli_use_chap",
			        labelClsExtra: 'lblRdReq',
			        afterRender: function (ct, position) {
                        new Ext.ToolTip({
                            target : this.id,
                            trackMouse : false,
                            maxWidth : 250,
                            minWidth : 100,
                            html : "<label class=\'lblTipItem\'>Use CHAP instead of UAM service. UAM Secret needs to be left out on Coova</label>"
                        });
                    }
			    }     
            ]
        }
            
        me.items = [
            {
                xtype       : 'panel',
                title       : "General",
                glyph       : Rd.config.icnGears, 
                ui          : 'panel-blue',
                layout      : {
                  type  : 'vbox',
                  align : 'start',
                  pack  : 'start'
                },
                bodyPadding : 10,
                items       : cntGeneral				
            },
            {
                xtype       : 'panel',
                title       : "Login Window Settings",
                glyph       : Rd.config.icnSignIn, 
                ui          : 'panel-green',
                layout      : {
                  type      : 'vbox',
                  align     : 'start',
                  pack      : 'start'
                },
                bodyPadding : 10,
                items       : cntLogin				
            },
            {
                xtype       : 'panel',
                title       : 'Terms & Conditions',
                glyph       : Rd.config.icnGavel, 
                ui          : 'panel-green',
                layout      : {
                  type      : 'vbox',
                  align     : 'start',
                  pack      : 'start'
                },
                bodyPadding : 10,
                items       : cntTc				
            },
            {
                xtype       : 'panel',
                title       : 'Redirect After Login',
                glyph       : Rd.config.icnNext, 
                ui          : 'panel-green',
                layout      : {
                  type      : 'vbox',
                  align     : 'start',
                  pack      : 'start'
                },
                bodyPadding : 10,
                items       : cntRedirect				
            },
            {
                xtype       : 'panel',
                title       : 'User Registration',
                glyph       : Rd.config.icnUser, 
                ui          : 'panel-green',
                layout      : {
                  type      : 'vbox',
                  align     : 'start',
                  pack      : 'start'
                },
                bodyPadding : 10,
                items       : cntRegister				
            },
            {
                xtype       : 'panel',
                title       : i18n('sLanguage'),
                glyph       : Rd.config.icnFlag, 
                ui          : 'panel-green',
                layout      : {
                  type      : 'vbox',
                  align     : 'start',
                  pack      : 'start'
                },
                bodyPadding : 10,
                items       : cntLanguage				
            },
            {
                xtype       : 'panel',
                title       : 'Coova Chilli Specific',
                glyph       : Rd.config.icnThermometer, 
                ui          : 'panel-green',
                layout      : {
                  type      : 'vbox',
                  align     : 'start',
                  pack      : 'start'
                },
                bodyPadding : 10,
                items       : cntCoova				
            }
        ];
        me.callParent(arguments);
    }
});

Ext.define('Rd.view.settings.pnlSettingsOLD', {
    extend  : 'Ext.panel.Panel',
    alias   : 'widget.pnlSettingsOLD',
    border  : false,
    frame   : false,
    layout  : {
        type    : 'hbox',
        align   : 'stretch'
    },
    requires  : [
        'Rd.view.components.cmbTimezones',      
        'Rd.view.components.cmbCountries',
        'Rd.view.components.rdPasswordfield',
        'Rd.view.settings.vcSettings',
        'Rd.view.settings.pnlSettingsLicense',
        'Rd.view.settings.winSettingsEmailTest'
    ],
    controller  : 'vcSettings',
    bodyStyle: {backgroundColor : Rd.config.panelGrey },
    listeners   : {
        activate : 'onViewActivate'
    },
    initComponent: function () {
        var me      = this;      
        var pnlMqtt = {
            title       : 'MQTT', 
            autoScroll  : true,
            items       : [
                {
                    xtype       : 'panel',
                    title       : "MQTT",
                    glyph       : Rd.config.icnActivity, 
                    ui          : 'panel-blue',
                    layout      : 'anchor',
                    defaultType : 'textfield',
                    defaults    : {
                        anchor: '100%'
                    },
                    items       : [
                        { 
                            fieldLabel      : 'Enable', 
                            name            : 'mqtt_enabled', 
                            inputValue      : 'mqtt_enabled',
                            itemId          : 'chkMqttEnabled',
                            labelClsExtra   : 'lblRdReq',
                            checked         : false, 
                            xtype           : 'checkbox'
                        },
                        {
                            fieldLabel      : 'User',
                            name            : 'mqtt_user',
                            itemId          : 'txtMqttUser',
                            allowBlank      : false,
                            blankText       : i18n('sSupply_a_value'),
                            labelClsExtra   : 'lblRdReq',
                            disabled        : true
                        },
                        {
                            xtype           : 'rdPasswordfield',
                            rdName          : 'mqtt_password',
                            itemId          : 'txtMqttPassword',
                            rdLabel         : 'Password',
                            disabled        : true
                        },              
                        {
                            fieldLabel      : 'Server URL',
                            name            : 'mqtt_server_url',
                            itemId          : 'txtMqttServerUrl',
                            allowBlank      : false,
                            blankText       : i18n('sSupply_a_value'),
                            labelClsExtra   : 'lblRdReq',
                            disabled        : true
                        },
                        {
                            fieldLabel      : 'Command Topic',
                            name            : 'mqtt_command_topic',
                            itemId          : 'txtMqttCommandTopic',
                            allowBlank      : false,
                            blankText       : i18n('sSupply_a_value'),
                            labelClsExtra   : 'lblRdReq',
                            disabled        : true
                        }
                    ],
                    bodyPadding : 10
                }
            ]
        };
        
        var pnlMaps = {
            title       : 'Maps',
            autoScroll  :true,
            items       : [
                {
                    xtype       : 'panel',
                    title       : "Maps",
                    glyph       : Rd.config.icnMap, 
                    ui          : 'panel-blue',
                    layout      : 'anchor',
                    defaultType : 'textfield',
                    defaults    : {
                        anchor: '100%'
                    },
                    items       : [
                        { 
                            fieldLabel      : 'Enable', 
                            name            : 'maps_enabled', 
                            inputValue      : 'maps_enabled',
                            labelClsExtra   : 'lblRdReq',
                            checked         : false, 
                            xtype           : 'checkbox'
                        }
                        
                        /*{
                            xtype           : 'textfield',
                            fieldLabel      : 'Google api key',
                            name            : 'google_map_api_key',
                            itemId          : 'google_map_api_key',
                            allowBlank      : true,
                            blankText       : i18n('sSupply_a_value'),
                            labelClsExtra   : 'lblRdReq'     
                        },
                        {
                            xtype           : 'textfield',
                            fieldLabel      : 'Baidu api key',
                            name            : 'baidu_map_api_key',
                            itemId          : 'baidu_map_api_key',
                            allowBlank      : true,
                            blankText       : i18n('sSupply_a_value'),
                            labelClsExtra   : 'lblRdReq'
                        },                      
                        { 
                            xtype           : 'cmbMapPrefs', 
                            labelClsExtra   : 'lblRdReq',
                            name            : 'map_to_use',
                            allowBlank      : false,
                        }*/     
                    ],
                    bodyPadding : 10
                }
            ]
        };
        
        var pnlMail = {
            title       : 'Email',
            autoScroll  :true,
            items       : [
                {
                    xtype       : 'panel',
                    title       : "Email",
                    glyph       : Rd.config.icnEmail, 
                    ui          : 'panel-blue',
                    layout      : 'anchor',
                    defaultType : 'textfield',
                    defaults    : {
                        anchor: '100%'
                    },
                    items       : [
                        { 
                            fieldLabel      : 'Enable', 
                            name            : 'email_enabled', 
                            inputValue      : '1',
                            itemId          : 'chkEmailEnabled',
                            labelClsExtra   : 'lblRdReq',
                            checked         : false, 
                            xtype           : 'checkbox'
                        },
                        { 
                            fieldLabel      : 'SSL', 
                            name            : 'email_ssl', 
                            inputValue      : '1',
                            itemId          : 'chkEmailSsl',
                            labelClsExtra   : 'lblRdReq',
                            checked         : true, 
                            xtype           : 'checkbox',
                            disabled        : true
                        },
                        {
                            xtype           : 'textfield',
                            fieldLabel      : 'SMTP Server',
                            name            : 'email_server',
                            itemId          : 'txtEmailServer',
                            allowBlank      : false,
                            blankText       : i18n('sSupply_a_value'),
                            labelClsExtra   : 'lblRdReq',
                            vtype           : 'DnsName',
                            disabled        : true
                        },
                        {
                            xtype           : 'textfield',
                            fieldLabel      : 'SMTP Port',
                            name            : 'email_port',
                            itemId          : 'txtEmailPort',
                            allowBlank      : false,
                            blankText       : i18n('sSupply_a_value'),
                            labelClsExtra   : 'lblRdReq',
                            vtype           : 'Numeric',
                            disabled        : true
                        },
                        {
                            xtype           : 'textfield',
                            fieldLabel      : 'Username',
                            name            : 'email_username',
                            itemId          : 'email_username',
                            itemId          : 'txtEmailUsername',
                            allowBlank      : false,
                            blankText       : i18n('sSupply_a_value'),
                            labelClsExtra   : 'lblRdReq',
                            disabled        : true
                        },
                        {
                            xtype           : 'rdPasswordfield',
                            rdName          : 'email_password',
                            rdLabel         : 'Password',
                            itemId          : 'txtEmailPassword',
                            disabled        : true
                        },
                        {
                            xtype           : 'textfield',
                            fieldLabel      : 'Sender Name',
                            name            : 'email_sendername',
                            itemId          : 'email_sendername',
                            allowBlank      : true,
                            itemId          : 'txtEmailSendername',
                            labelClsExtra   : 'lblRd',
                            disabled        : true
                        },
                        {
                            xtype           : 'button',
                            text            : 'Test Email Settings',
                            ui              : 'button-teal',
                            itemId          : 'btnEmailTest',
                            scale           : 'large',
                            padding         : 5,
                            margin          : 5,
                            disabled        : true,
                            listeners   : {
                                click     : 'onEmailTestClick'
                            }    
                        }        
                        
                    ],
                    bodyPadding : 10
                }
            ]
        };
        
        var pnlDefault = {
            title       : 'Default Settings',
            layout      : {
                type    : 'vbox',
                pack    : 'start',
                align   : 'stretch'
            },
            autoScroll  :true,
            items       :[
                {
                    xtype       : 'panel',
                    title       : "MESHdesk and APdesk Hardware",
                    glyph       : Rd.config.icnGears, 
                    ui          : 'panel-blue',
                    layout      : 'anchor',
                    defaults    : {
                        anchor: '100%'
                    },
                    items       : [
                        {
                            xtype   : 'rdPasswordfield'
                        },                             
                        {
                            xtype   : 'cmbCountries',
                            labelClsExtra   : 'lblRdReq'
                        },
                        {
                            xtype   : 'cmbTimezones',
                            labelClsExtra   : 'lblRdReq'
                        },
                        {
                            xtype       : 'numberfield',
                            name        : 'heartbeat_dead_after',
                            itemId      : 'heartbeat_dead_after',
                            fieldLabel  : 'Heartbeat Dead After',
                            value       : 600,
                            maxValue    : 21600,
                            minValue    : 300,
                            labelClsExtra   : 'lblRdReq'
                        } 
                    ],
                    bodyPadding : 10
                },
                {
                    xtype       : 'panel',
                    title       : 'Captive Portal',
                    glyph       : Rd.config.icnGlobe, 
                    ui          : 'panel-green',
                    layout      : 'anchor',
                    defaults    : {
                        anchor: '100%'
                    },
                    defaultType : 'textfield',
                    items       : [
                         {
                            fieldLabel      : 'RADIUS-1',
                            name            : 'cp_radius_1',
                            allowBlank      : false,
                            blankText       : i18n('sSupply_a_value'),
                            labelClsExtra   : 'lblRdReq'
                        },
                        {
                            fieldLabel      : 'RADIUS-2',
                            name            : 'cp_radius_2',
                            allowBlank      : true,
                            blankText       : i18n('sSupply_a_value'),
                            labelClsExtra   : 'lblRd'
                        },
                        {
                            xtype           : 'rdPasswordfield',
                            rdName          : 'cp_radius_secret',
                            rdLabel         : 'Shared Secret'
                        }, 
                        {
                            fieldLabel      : 'UAM URL',
                            name            : 'cp_uam_url',
                            allowBlank      : false,
                            blankText       : i18n('sSupply_a_value'),
                            labelClsExtra   : 'lblRdReq'
                        },
                        {
                            xtype           : 'rdPasswordfield',
                            rdName          : 'cp_uam_secret',
                            rdLabel         : 'UAM Secret'
                        }, 
                        { 
                            fieldLabel      : 'Swap Octets', 
                            name            : 'cp_swap_octet', 
                            inputValue      : 'cp_swap_octet',
                            labelClsExtra   : 'lblRdReq',
                            checked         : true, 
                            xtype           : 'checkbox' 
                        },
                        { 
                            fieldLabel      : 'MAC Auth', 
                            name            : 'cp_mac_auth', 
                            inputValue      : 'cp_mac_auth',
                            labelClsExtra   : 'lblRdReq',
                            checked         : true, 
                            xtype           : 'checkbox' 
                        },
                        {
                            xtype           : 'textareafield',
                            grow            : true,
                            name            : 'cp_coova_optional',
                            fieldLabel      : 'Optional Coova',
                            anchor          : '100%',
                            labelClsExtra   : 'lblRd'
                        }             
                    ],
                    bodyPadding : 10
                }
            ]
        };
        
        var pnlLicensing = {
            title       : 'Licensing',
            xtype       : 'pnlSettingsLicense',
            autoScroll  : true
        };
                 
        me.items =  { 
            xtype   : 'form',
            height  : '100%',
            width   :  550,        
            layout  : 'fit',
            frame   : true,
            fieldDefaults: {
                msgTarget       : 'under',
                labelClsExtra   : 'lblRd',
                labelAlign      : 'left',
                labelSeparator  : '',
                labelClsExtra   : 'lblRd',
                labelWidth      : Rd.config.labelWidth+20,
                margin          : Rd.config.fieldMargin,
                defaultType     : 'textfield'
            },
            items       : [{
                xtype   : 'tabpanel',
                margins : '0 0 0 0',
                plain   : false,
                tabPosition: 'bottom',
                border  : false,
                items   :  [
                    pnlDefault,
                    pnlMqtt,
                    pnlMaps,
                    pnlMail
                 //   pnlLicensing
                ]
            }],
            buttons: [
                {
                    itemId      : 'save',
                    formBind    : true,
                    text        : i18n('sSave'),
                    scale       : 'large',
                    glyph       : Rd.config.icnYes,
                    margin      : Rd.config.buttonMargin
                }
            ]
        };
        
        me.callParent(arguments);
    }
});

Ext.define('Rd.view.settings.pnlSettingsEmail', {
    extend      : 'Ext.form.Panel',
    alias       : 'widget.pnlSettingsEmail',
    autoScroll	: true,
    plain       : true,
    frame       : false,
    layout      : {
        type    : 'vbox',
        pack    : 'start',
        align   : 'stretch'
    },
    margin      : 5,
    cloud_id    : -1,  
    fieldDefaults: {
        msgTarget       : 'under',
        labelAlign      : 'left',
        labelSeparator  : '',
        labelWidth      : Rd.config.labelWidth+20,
        margin          : Rd.config.fieldMargin,
        labelClsExtra   : 'lblRdReq',
        defaultType     : 'textfield'
    },
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
    requires: [
        'Rd.view.settings.vcSettingsEmail',
        'Rd.view.settigs.gridEmailHistories',
        'Rd.view.components.cmbMailTransports'
    ],
    controller  : 'vcSettingsEmail',
    listeners       : {
        activate  : 'onViewActivate'
    },
    initComponent: function(){
        var me      = this;
        var w_prim  = 550;
           
        var cntEmail  = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
            items       : [
                { 
                    name            : 'edit_cloud_id',
                    value           : me.cloud_id,
                    hidden          : true,
                    itemId          : 'editCloudId',
                    xtype           : 'textfield'          
                 },
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
                    xtype           : 'cmbMailTransports'
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
                    fieldLabel      : 'API Key', 
                    name            : 'email_sg_api',
                    itemId          : 'txtEmailSgApi',
                    labelClsExtra   : 'lblRdReq',
                    xtype           : 'textfield',
                    disabled        : true,
                    hidden          : true
                },
                {
                    xtype           : 'textfield',
                    fieldLabel      : 'Sender Name',
                    name            : 'email_sg_sendername',
                    itemId          : 'email_sg_sendername',
                    allowBlank      : false,
                    itemId          : 'txtEmailSgSendername',
                    labelClsExtra   : 'lblRdReq',
                    disabled        : true,
                    hidden          : true
                },
                {
                    xtype           : 'textfield',
                    fieldLabel      : 'Template',
                    name            : 'email_sg_template',
                    itemId          : 'email_sg_template',
                    allowBlank      : true,
                    itemId          : 'txtEmailSgTemplate',
                    labelClsExtra   : 'lblRd',
                    disabled        : true,
                    hidden          : true
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
            ]
        }
                      
        me.items = [
            {
                xtype       : 'panel',
                title       : "Email",
                glyph       : Rd.config.icnEmail, 
                ui          : 'panel-blue',
                layout      : {
                  type  : 'vbox',
                  align : 'start',
                  pack  : 'start'
                },
                bodyPadding : 10,
                items       : cntEmail				
            },
            {
                xtype       : 'panel',
                title       : "History Of Emails",
                glyph       : Rd.config.icnHistory,
                ui          : 'panel-green',
                layout      : {
                  type  : 'vbox',
                  align : 'start',
                  pack  : 'start'
                },
                bodyPadding : 10,
                items       : {
                    xtype       : 'container',
                    width       : w_prim,
                    layout      : 'anchor',
                    defaults    : {
                        anchor  : '100%'
                    },
                    defaultType : 'textfield',
                    items       : [
                        {
                            xtype           : 'button',
                            text            : 'Show Sent History',
                            glyph           : Rd.config.icnHistory,
                            ui              : 'button-teal',
                            itemId          : 'btnEmailHistory',
                            scale           : 'large',
                            padding         : 5,
                            margin          : 5,
                            listeners   : {
                                click     : 'onEmailHistoryClick'
                            }    
                        }                   
                    ]			
                }
            }
        ];    
        me.callParent(arguments);
    }
});

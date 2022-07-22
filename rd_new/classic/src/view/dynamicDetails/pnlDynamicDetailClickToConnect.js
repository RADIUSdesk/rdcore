Ext.define('Rd.view.dynamicDetails.pnlDynamicDetailClickToConnect', {
    extend      : 'Ext.form.Panel',
    alias       : 'widget.pnlDynamicDetailClickToConnect',
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
        'Rd.view.dynamicDetails.vcDynamicDetailClickToConnect',
        'Rd.view.components.sldrToggle',
        'Rd.view.dynamicDetails.pnlDynamicDetailCustomerItem'
    ],
    controller  : 'vcDynamicDetailClickToConnect',
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
    initComponent: function(){

        var me      = this;
        var w_prim  = 550;
        var w_sec   = 350;
        var w_chk   = 207;
        
        
        var reSupply = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            data : [
                {"id":-1, "name":"Every Time"},
                {"id":0,  "name":"Once Off"},
                {"id":1,  "name":"Every Day"},
                {"id":7,  "name":"Every Week"},
                {"id":30, "name":"Every Month"},
                {"id":90, "name":"Every 3 Months"}
            ]
        });
        
        var cmbReSupply = Ext.create('Ext.form.ComboBox', {
            fieldLabel      : 'Re-Supply Interval',
            store           : reSupply,
            queryMode       : 'local',
            displayField    : 'name',
            valueField      : 'id',
            name            : 'ci_resupply_interval',
            itemId          : 'cmbReSupply',
            labelWidth      : Rd.config.labelWidth+20,
            allowBlank      : false,
            forceSelection  : true,
            value           : 0,
            width           : w_prim,
            disabled        : true
        }); 
       
             
        var cntTop  = {
            xtype       : 'container',
            items       : [              
                {
                    xtype       : 'textfield',
                    name        : "dynamic_detail_id",
                    hidden      : true,
                    value       : me.dynamic_detail_id
                },
                {
                    xtype       : 'checkbox',      
                    fieldLabel  : 'Enable',
                    itemId      : 'chkClickToConnect',
                    name        : 'connect_check',
                    inputValue  : 'connect_check',
                    checked     : false,
                    labelClsExtra: 'lblRdReq',
                    width       : w_prim,
                    
                },                 
                {
                    xtype       : 'textfield',
                    itemId      : 'txtConnectUsername',
                    fieldLabel  : 'Connect as',
                    name        : "connect_username",
                    allowBlank  : false,
                    blankText   : i18n("sSupply_a_value"),
                    disabled    : true,
                    width       : w_prim
                },
                {
                    xtype       : 'textfield',
                    itemId      : 'txtConnectSuffix',
                    fieldLabel  : 'Add suffix of',
                    name        : "connect_suffix",
                    allowBlank  : false,
                    blankText   : i18n("sSupply_a_value"),
                    disabled    : true,
                    width       : w_prim
                },
                {
                    xtype       : 'numberfield',
                    name        : 'connect_delay',
                    fieldLabel  : 'Delay before connecting (seconds)',
                    itemId      : 'nrConnectDelay',
                    value       : 0,
                    maxValue    : 600,
                    minValue    : 0,
                    disabled    : true,
                    width       : w_prim
                },
                {
                    xtype       : 'checkbox',      
                    fieldLabel  : 'Only Click-to-connect',
                    itemId      : 'chkConnectOnly',
                    name        : 'connect_only',
                    inputValue  : 'connect_only',
                    checked     : false,
                    disabled    : true,
                    width       : w_prim
                }             
            ]
        }; 
        
        var stripe = true;     
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
                title       : "Collect Customer Data",
                glyph       : Rd.config.icnUser,
                itemId      : 'pnlCustomerData',
                ui          : 'panel-green',
                layout      : {
                  type  : 'vbox',
                  align : 'start',
                  pack  : 'start'
                },
                bodyPadding : 10,
                items       : [
                    {
                        xtype       : 'checkbox',      
                        fieldLabel  : 'Enable',
                        itemId      : 'chkCustInfo',
                        name        : 'cust_info_check',
                        inputValue  : 'cust_info_check',
                        checked     : false,
                        labelClsExtra: 'lblRdReq',
                        disabled    : true,
                        width       : w_prim
                    },      
                    cmbReSupply,
                    {
                        xtype       : 'pnlDynamicDetailCustomerItem',
                        name        : 'ci_first_name',
                        stripe      : stripe,
                        itemName    : 'First Name' 
                    },
                    {
                        xtype       : 'pnlDynamicDetailCustomerItem',
                        name        : 'ci_last_name',
                        stripe      : !stripe,
                        itemName    : 'Last Name' 
                    },
                    {
                        xtype       : 'pnlDynamicDetailCustomerItem',
                        name        : 'ci_email',
                        stripe      : stripe,
                        itemName    : 'Email' 
                    },
                    {
                        xtype       : 'panel',
                        width       : 565,
                        itemId      : 'pnlEmail',
                        disabled    : true,
                        layout      : 'anchor',
                        defaults    : {
                            anchor: '100%'
                        },
                        bodyStyle   : 'background: #f0f0f5', //stripe
                        //bodyStyle   : 'background: #d1e0e0', //NO stripe
                        bodyPadding : 0,
                        items       : [
                            {
                                xtype       : 'checkbox',      
                                fieldLabel  : 'Show Email Opt-In',
                                itemId      : 'chkCtcEmailOptIn',
                                name        : 'ci_email_opt_in',
                                inputValue  : 'ci_email_opt_in',
                                checked     : false
                            },
                            {
                                xtype       : 'textfield',
                                itemId      : 'ci_email_opt_in_txt',
                                fieldLabel  : 'Opt In Text',
                                name        : 'ci_email_opt_in_txt',
                                allowBlank  : false,
                                blankText   : i18n("sSupply_a_value"),
                                labelClsExtra: 'lblRdReq',
                                value       : 'Send Promotional Email' 
                            }
                        ]
                    },   
                    {
                        xtype       : 'pnlDynamicDetailCustomerItem',
                        name        : 'ci_gender',
                        stripe      : !stripe,
                        itemName    : 'Gender' 
                    },
                    {
                        xtype       : 'pnlDynamicDetailCustomerItem',
                        name        : 'ci_birthday',
                        stripe      : stripe,
                        itemName    : 'Birthday' 
                    },
                    {
                        xtype       : 'pnlDynamicDetailCustomerItem',
                        name        : 'ci_company',
                        stripe      : !stripe,
                        itemName    : 'Company' 
                    },
                    {
                        xtype       : 'pnlDynamicDetailCustomerItem',
                        name        : 'ci_address',
                        stripe      : stripe,
                        itemName    : 'Address' 
                    },   
                    {
                        xtype       : 'pnlDynamicDetailCustomerItem',
                        name        : 'ci_city',
                        stripe      : !stripe,
                        itemName    : 'City' 
                    },
                    {
                        xtype       : 'pnlDynamicDetailCustomerItem',
                        name        : 'ci_country',
                        stripe      : stripe,
                        itemName    : 'Country' 
                    },
                    {
                        xtype       : 'pnlDynamicDetailCustomerItem',
                        name        : 'ci_phone',
                        stripe      : !stripe,
                        itemName    : 'Phone' 
                    },
                    {
                        xtype       : 'panel',
                        width       : 565,
                        itemId      : 'pnlPhone',
                        disabled    : true,
                        layout      : 'anchor',
                        defaults    : {
                            anchor: '100%'
                        },
                        //bodyStyle   : 'background: #f0f0f5', //stripe
                        bodyStyle   : 'background: #d1e0e0', //NO stripe
                        bodyPadding : 0,
                        items       : [
                            {
                                xtype       : 'checkbox',      
                                fieldLabel  : 'Show SMS Opt-In',
                                itemId      : 'chkCtcPhoneOptIn',
                                name        : 'ci_phone_opt_in',
                                inputValue  : 'ci_phone_opt_in',
                                checked     : false
                            },
                            {
                                xtype       : 'textfield',
                                itemId      : 'ci_phone_opt_in_txt',
                                fieldLabel  : 'Opt In Text',
                                name        : 'ci_phone_opt_in_txt',
                                allowBlank  : false,
                                blankText   : i18n("sSupply_a_value"),
                                labelClsExtra: 'lblRdReq',
                                value       : 'Send Promotional SMS' 
                            }
                        ]
                    },   
                    {
                        xtype       : 'pnlDynamicDetailCustomerItem',
                        name        : 'ci_room',
                        stripe      : stripe,
                        itemName    : 'Room' 
                    },
                    {
                        xtype       : 'pnlDynamicDetailCustomerItem',
                        name        : 'ci_custom1',
                        stripe      : !stripe,
                        itemName    : 'Custom1' 
                    },
                    {
                        xtype       : 'panel',
                        width       : 565,
                        itemId      : 'pnlCustom1',
                        disabled    : true,
                        layout      : 'anchor',
                        defaults    : {
                            anchor: '100%'
                        },
                        //bodyStyle   : 'background: #f0f0f5', //stripe
                        bodyStyle   : 'background: #d1e0e0', //NO stripe
                        bodyPadding : 0,
                        items       : [
                            {
                                xtype       : 'textfield',
                                itemId      : 'ci_custom1_txt',
                                fieldLabel  : 'Custom1 Text',
                                name        : 'ci_custom1_txt',
                                disabled    : true,
                                allowBlank  : false,
                                value       : 'Custom One',
                                blankText   : i18n("sSupply_a_value"),
                                labelClsExtra: 'lblRdReq'
                            }
                        ]
                    }, 
                    {
                        xtype       : 'pnlDynamicDetailCustomerItem',
                        name        : 'ci_custom2',
                        stripe      : stripe,
                        itemName    : 'Custom2' 
                    },
                    {
                        xtype       : 'panel',
                        width       : 565,
                        itemId      : 'pnlCustom2',
                        disabled    : true,
                        layout      : 'anchor',
                        defaults    : {
                            anchor: '100%'
                        },
                        bodyStyle   : 'background: #f0f0f5', //stripe
                        //bodyStyle   : 'background: #d1e0e0', //NO stripe
                        bodyPadding : 0,
                        items       : [
                            {
                                xtype       : 'textfield',
                                itemId      : 'ci_custom2_txt',
                                fieldLabel  : 'Custom2 Text',
                                name        : 'ci_custom2_txt',
                                disabled    : true,
                                allowBlank  : false,
                                value       : 'Custom Two',
                                blankText   : i18n("sSupply_a_value"),
                                labelClsExtra: 'lblRdReq'
                            }
                        ]
                    }, 
                    {
                        xtype       : 'pnlDynamicDetailCustomerItem',
                        name        : 'ci_custom3',
                        stripe      : !stripe,
                        itemName    : 'Custom3' 
                    },
                    {
                        xtype       : 'panel',
                        width       : 565,
                        itemId      : 'pnlCustom3',
                        disabled    : true,
                        layout      : 'anchor',
                        defaults    : {
                            anchor: '100%'
                        },
                        //bodyStyle   : 'background: #f0f0f5', //stripe
                        bodyStyle   : 'background: #d1e0e0', //NO stripe
                        bodyPadding : 0,
                        items       : [
                            {
                                xtype       : 'textfield',
                                itemId      : 'ci_custom3_txt',
                                fieldLabel  : 'Custom3 Text',
                                name        : 'ci_custom3_txt',
                                disabled    : true,
                                allowBlank  : false,
                                value       : 'Custom Three',
                                blankText   : i18n("sSupply_a_value"),
                                labelClsExtra: 'lblRdReq'
                            }
                        ]
                    }, 
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
    }
    
});

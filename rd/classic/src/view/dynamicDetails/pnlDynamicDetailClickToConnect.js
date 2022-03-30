Ext.define('Rd.view.dynamicDetails.pnlDynamicDetailClickToConnect', {
    extend  : 'Ext.panel.Panel',
    alias   : 'widget.pnlDynamicDetailClickToConnect',
    border  : false,
    dynamic_detail_id: null,
    layout  : 'hbox',
    bodyStyle: {backgroundColor : Rd.config.panelGrey },
    requires: [
        'Rd.view.dynamicDetails.vcDynamicDetailClickToConnect'
    ],
    controller  : 'vcDynamicDetailClickToConnect',
    initComponent: function(){
        var me = this;     
        var reSupply = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            data : [
                {"id":0,  "name":"Never"},
                {"id":1,  "name":"Every Day"},
                {"id":7,  "name":"Every Week"},
                {"id":30, "name":"Every Month"},
                {"id":90, "name":"Every 3 Months"}
            ]
        });

        // Create the combo box, attached to the states data store
        var cmbReSupply = Ext.create('Ext.form.ComboBox', {
            fieldLabel      : 'Re-Supply Email Interval',
            store           : reSupply,
            queryMode       : 'local',
            displayField    : 'name',
            valueField      : 'id',
            name            : 'ctc_resupply_email_interval',
            itemId          : 'cmbReSupply',
            labelCls        : 'lblRd',
            allowBlank      : false,
            forceSelection  : true,
            value           : 0,
            disabled        : true
        });
        
        var cmbReSupplyP = Ext.create('Ext.form.ComboBox', {
            fieldLabel      : 'Re-Supply Phone Interval',
            store           : reSupply,
            queryMode       : 'local',
            displayField    : 'name',
            valueField      : 'id',
            name            : 'ctc_resupply_phone_interval',
            itemId          : 'cmbReSupplyPhone',
            labelCls        : 'lblRd',
            allowBlank      : false,
            forceSelection  : true,
            value           : 0,
            disabled        : true
        });
        
        var cmbReSupplyDn = Ext.create('Ext.form.ComboBox', {
            fieldLabel      : 'Re-Supply DN Interval',
            store           : reSupply,
            queryMode       : 'local',
            displayField    : 'name',
            valueField      : 'id',
            name            : 'ctc_resupply_dn_interval',
            itemId          : 'cmbReSupplyDn',
            labelCls        : 'lblRd',
            allowBlank      : false,
            forceSelection  : true,
            value           : 0,
            disabled        : true
        });
        
        me.items =  { 
                xtype       : 'form',
                height      : '100%', 
                width       :  450,
                layout      : 'anchor',
                defaults    : {
                    anchor: '100%'
                },
                autoScroll  :true,
                frame       : true,
                fieldDefaults: {
                    msgTarget       : 'under',
                    labelClsExtra   : 'lblRd',
                    labelAlign      : 'left',
                    labelSeparator  : '',
                    margin          : Rd.config.fieldMargin,
                    labelWidth      : 200,
                    maxWidth        : Rd.config.maxWidth  
                },
                items       : [
                    {
                        xtype       : 'textfield',
                        name        : "id",
                        hidden      : true
                    },
                    {
                        xtype       : 'checkbox',      
                        fieldLabel  : 'Enable',
                        itemId      : 'chkClickToConnect',
                        name        : 'connect_check',
                        inputValue  : 'connect_check',
                        checked     : false,
                        labelClsExtra: 'lblRdReq'
                    },                 
                    {
                        xtype       : 'textfield',
                        itemId      : 'txtConnectUsername',
                        fieldLabel  : 'Connect as',
                        name        : "connect_username",
                        allowBlank  : false,
                        blankText   : i18n("sSupply_a_value"),
                        disabled    : true
                    },
                    {
                        xtype       : 'textfield',
                        itemId      : 'txtConnectSuffix',
                        fieldLabel  : 'Add suffix of',
                        name        : "connect_suffix",
                        allowBlank  : false,
                        blankText   : i18n("sSupply_a_value"),
                        disabled    : true
                    },
                    {
                        xtype       : 'numberfield',
                        name        : 'connect_delay',
                        fieldLabel  : 'Delay before connecting (seconds)',
                        itemId      : 'nrConnectDelay',
                        value       : 0,
                        maxValue    : 600,
                        minValue    : 0,
                        disabled    : true
                    },
                    {
                        xtype       : 'checkbox',      
                        fieldLabel  : 'Only Click-to-connect',
                        itemId      : 'chkConnectOnly',
                        name        : 'connect_only',
                        inputValue  : 'connect_only',
                        checked     : false,
                        disabled    : true
                    },
                    {
                        xtype       : 'panel',
                        layout      : 'anchor',
                        defaults    : {
                            anchor: '100%'
                        },
                        bodyStyle   : 'background: #e0f9ed',
                        bodyPadding : 0,
                        items       : [
                            {
                                xtype       : 'checkbox',      
                                fieldLabel  : 'Require Email To Connect',
                                itemId      : 'chkCtcRequireEmail',
                                name        : 'ctc_require_email',
                                inputValue  : 'ctc_require_email',
                                checked     : false,
                                disabled    : true
                            },
                            cmbReSupply,
                            {
                                xtype       : 'checkbox',      
                                fieldLabel  : 'Show Email Opt-In',
                                itemId      : 'chkCtcEmailOptIn',
                                name        : 'ctc_email_opt_in',
                                inputValue  : 'ctc_email_opt_in',
                                checked     : false,
                                disabled    : true
                            },
                            {
                                xtype       : 'textfield',
                                itemId      : 'txt_email_opt_in',
                                fieldLabel  : 'Opt In Text',
                                name        : 'ctc_email_opt_in_txt',
                                allowBlank  : false,
                                blankText   : i18n("sSupply_a_value"),
                                disabled    : true,
                                labelClsExtra: 'lblRdReq',
                                value       : 'Send Promotional Email' 
                            }
                        ]
                    },
                    {
                        xtype       : 'panel',
                        layout      : 'anchor',
                        defaults    : {
                            anchor: '100%'
                        },
                        bodyStyle   : 'background: #e0eaf9',
                        bodyPadding : 0,
                        items       : [
                            {
                                xtype       : 'checkbox',      
                                fieldLabel  : 'Require Phone To Connect',
                                itemId      : 'chkCtcRequirePhone',
                                name        : 'ctc_require_phone',
                                inputValue  : 'ctc_require_phone',
                                checked     : false,
                                disabled    : true
                            },
                            cmbReSupplyP,
                            {
                                xtype       : 'checkbox',      
                                fieldLabel  : 'Show SMS Opt-In',
                                itemId      : 'chkCtcPhoneOptIn',
                                name        : 'ctc_phone_opt_in',
                                inputValue  : 'ctc_phone_opt_in',
                                checked     : false,
                                disabled    : true
                            },
                            {
                                xtype       : 'textfield',
                                itemId      : 'txt_phone_opt_in',
                                fieldLabel  : 'Opt In Text',
                                name        : 'ctc_phone_opt_in_txt',
                                allowBlank  : false,
                                blankText   : i18n("sSupply_a_value"),
                                disabled    : true,
                                labelClsExtra: 'lblRdReq',
                                value       : 'Send Promotional SMS' 
                            }                    
                        ]
                    },     
                    {
                        xtype       : 'panel',
                        layout      : 'anchor',
                        defaults    : {
                            anchor: '100%'
                        },
                        bodyStyle   : 'background: #e0f9ed',
                        bodyPadding : 0,
                        items       : [
                            {
                                xtype       : 'checkbox',      
                                fieldLabel  : 'Require DN To Connect',
                                itemId      : 'chkCtcRequireDn',
                                name        : 'ctc_require_dn',
                                inputValue  : 'ctc_require_dn',
                                checked     : false,
                                disabled    : true
                            },
                            cmbReSupplyDn
                        ]
                    }             
                ],
                buttons: [
                    {
                        itemId  : 'save',
                        formBind: true,
                        text    : i18n('sSave'),
                        scale   : 'large',
                        glyph   : Rd.config.icnYes,
                        margin  : Rd.config.buttonMargin
                    }
                ]
            };
        me.callParent(arguments);
    }
});

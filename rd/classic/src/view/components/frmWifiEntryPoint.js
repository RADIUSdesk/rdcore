Ext.define('Rd.view.components.frmWifiEntryPoint', {
    extend          : 'Ext.form.Panel',
    alias           : 'widget.frmWifiEntryPoint',
    requires: [
        'Rd.view.components.cmbEncryptionOptions',
        'Rd.view.components.vcWifiEntryPoint',
        'Rd.view.components.gridSchedule'
    ],
    controller  : 'vcWifiEntryPoint',
    border      : false,
    layout      : 'fit',
    autoScroll  : true,
    mode		: 'add', //mode = add or edit
    fieldDefaults: {
        msgTarget       : 'under',
        labelClsExtra   : 'lblRd',
        labelAlign      : 'left',
        labelSeparator  : '',
        labelWidth      : Rd.config.labelWidth,
        margin          : Rd.config.fieldMargin
    },
    defaultType : 'textfield',
    jsonSubmit	: true,
    buttons     : [
        {
            itemId  : 'save',
            text    : i18n("sOK"),
            scale   : 'large',
            formBind: true,
            glyph   : Rd.config.icnYes,
            margin  : Rd.config.buttonMargin
        }
    ],
    initComponent: function() {
        var me      = this;
        var w_rd    = 80;
        
        var store_ft = Ext.create('Ext.data.Store', {
            fields: ['id', 'Name'],
            data : [
                {"id": 0, "name": 'FT Over The Air'},
                {"id": 1, "name": 'FT Over DS'}
            ]
        });
                  
        me.items    = [
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
                        'title'     : i18n("sBasic_info"),
                        'layout'    : 'anchor',
                        itemId      : 'tabRequired',
                        defaults    : {
                            anchor: '100%'
                        },
                        autoScroll:true,
                        items       : [
                            {
                                itemId  : 'id',
                                xtype   : 'textfield',
                                name    : "id",
                                hidden  : true
                            }, 
                            {
                                itemId  : 'ap_profile_id',
                                xtype   : 'textfield',
                                name    : "ap_profile_id",
                                hidden  : true,
                                value   : me.apProfileId
                            },
                            {
                                itemId  : 'mesh_id',
                                xtype   : 'textfield',
                                name    : "mesh_id",
                                hidden  : true,
                                value   : me.meshId
                            }, 
                            {
                                xtype       : 'textfield',
                                fieldLabel  : i18n("sSSID"),
                                name        : 'name',
                                allowBlank  : false,
                                blankText   : i18n("sSupply_a_value"),
                                labelClsExtra: 'lblRdReq'
                            },
                            {
                                xtype       : 'radiogroup',
                                labelClsExtra: 'lblRdReq',
                                fieldLabel  : 'Frequency',
                                columns     : 3,
                                vertical    : false,
                                items       : [
                                    {
                                        boxLabel  : '2.4G',
                                        width     : w_rd,
                                        name      : 'frequency_band',
                                        inputValue: 'two',
                                        margin    : '0 15 0 0'
                                    }, 
                                    {
                                        boxLabel  : '5G',
                                        width     : w_rd,
                                        name      : 'frequency_band',
                                        inputValue: 'five',
                                        margin    : '0 0 0 15'
                                    },
                                    {
                                        boxLabel  : '2.4 & 5G',
                                        width     : w_rd,
                                        name      : 'frequency_band',
                                        inputValue: 'both',
                                        value     : true,
                                        margin    : '0 0 0 15'
                                    },
                                    {
                                        boxLabel  : '5G Lower',
                                        width     : w_rd,
                                        name      : 'frequency_band',
                                        inputValue: 'five_lower',
                                        margin    : '0 15 0 0'
                                    }, 
                                    {
                                        boxLabel  : '5G Upper',
                                        width     : w_rd,
                                        name      : 'frequency_band',
                                        inputValue: 'five_upper',
                                        margin    : '0 0 0 15'
                                    }
                                ]  
                            },              
                            {
                                xtype       : 'checkbox',      
                                name        : 'hidden',
                                inputValue  : 'hidden',
                                checked     : false,
                                boxLabel  	: i18n("sHidden"),
                                boxLabelCls	: 'boxLabelRd'
                            },
                            {
                                xtype       : 'checkbox',      
                                name        : 'isolate',
                                inputValue  : 'isolate',
                                checked     : false,
                                boxLabel  	: i18n("sClient_isolation"),
                                boxLabelCls	: 'boxLabelRd'
                            },
                            {
                                xtype       : 'checkbox',      
                                name        : 'apply_to_all',
                                inputValue  : 'apply_to_all',
                                checked     : true,
                                boxLabel  	: i18n('sApply_to_all_nodes'),
                                boxLabelCls	: 'boxLabelRd'
                            }
                        ]
                    },
                    { 
                        'title'     : i18n("sEncryption"),
                        'layout'    : 'anchor',
                        itemId      : 'tabEncryption',
                        defaults    : {
                            anchor: '100%'
                        },
                        autoScroll:true,
                        items       : [          
                            { 
                                xtype           : 'cmbEncryptionOptions', 
                                labelClsExtra   : 'lblRdReq',
                                allowBlank      : false 
                            },
                            {
                                xtype       : 'textfield',
                                fieldLabel  : i18n("sKey"),
                                name        : 'special_key',
                                itemId      : 'key',
                                minLength   : 8,
                                allowBlank  : false,  
                                blankText   : i18n("sSupply_a_value"),
                                labelClsExtra: 'lblRdReq',
                                hidden      : true,
                                disabled    : true
                            }, 
                            {
                                xtype       : 'textfield',
                                fieldLabel  : i18n("sRADIUS_server"),
                                name        : 'auth_server',
                                itemId      : 'auth_server',
                                allowBlank  : false,
                                blankText   : i18n("sSupply_a_value"),
                                labelClsExtra: 'lblRdReq',
                                hidden      : true,
                                disabled    : true
                            },
                            {
                                xtype       : 'textfield',
                                fieldLabel  : i18n("sShared_secret"),
                                name        : 'auth_secret',
                                itemId      : 'auth_secret',
                                allowBlank  : false,
                                blankText   : i18n("sSupply_a_value"),
                                labelClsExtra: 'lblRdReq',
                                hidden      : true,
                                disabled    : true
                            },
                             {
                                xtype       : 'checkbox',      
                                name        : 'auto_nasid',
                                inputValue  : 'auto_nasid',
                                checked     : true,
                                itemId      : 'chk_auto_nasid',
                                hidden      : true,
                                disabled    : true,
                                boxLabel  	: 'Generate NAS ID',
                                boxLabelCls	: 'boxLabelRd'
                            },
                            {
                                xtype       : 'textfield',
                                fieldLabel  : 'NAS ID',
                                name        : 'nasid',
                                itemId      : 'nasid',
                                allowBlank  : false,
                                blankText   : i18n("sSupply_a_value"),
                                labelClsExtra: 'lblRdReq',
                                hidden      : true,
                                disabled    : true
                            }, 
                            {
                                xtype       : 'checkbox',      
                                name        : 'accounting',
                                inputValue  : 'accounting',
                                checked     : true,
                                itemId      : 'chk_accounting',
                                hidden      : true,
                                disabled    : true,
                                boxLabel  	: 'Accounting',
                                boxLabelCls	: 'boxLabelRd'
                            },
                            {
                                xtype       : 'numberfield',
                                name        : 'default_vlan',
                                itemId      : 'default_vlan',
                                fieldLabel  : 'Default VLAN',
                                value       : 0,
                                maxValue    : 4094,
                                minValue    : 0,
                                labelClsExtra: 'lblRdReq',
                                hidden      : true,
                                disabled    : true,
                                hideTrigger : true,
                    			keyNavEnabled   	: false,
                    			mouseWheelEnabled	: false
                            },
                            {
                                xtype       : 'textfield',
                                fieldLabel  : 'Default Key',
                                name        : 'default_key',
                                itemId      : 'default_key',
                                minLength   : 8,
                                allowBlank  : false,  
                                blankText   : i18n("sSupply_a_value"),
                                labelClsExtra: 'lblRdReq',
                                hidden      : true,
                                disabled    : true
                            },
                            {
                                xtype       : 'checkbox',      
                                name        : 'hotspot2_enable',
                                checked     : false,
                                itemId      : 'chkHotspot2',
                                hidden      : true,
                                disabled    : true,
                                boxLabel  	: 'Hotspot 2.0',
                                boxLabelCls	: 'boxLabelRd'
                            },
                            {
						        xtype       : 'checkbox',      
						        boxLabel    : '802.11r Fast Transition',
						        inputValue  : 'ieee802r',
						        name        : 'ieee802r',
						        boxLabelCls	: 'boxLabelRd',
						        itemId		: 'chkFastRoaming',
						        hidden		: true,
						        disabled	: true
						    },
						    {	
						    	xtype		: 'panel',
						    	bodyStyle  	: 'background: #e0ebeb',
						    	hidden		: true,
						    	disabled	: true,
						    	itemId		: 'pnlFastRoaming',
						    	layout    	: 'anchor',
		                        defaults    : {
		                            anchor: '100%'
		                        },
						    	items		: [
						    		{
										xtype       : 'combobox',
										fieldLabel  : 'FT Protocol',
										store       : store_ft,
										queryMode   : 'local',
										name        : 'ft_over_ds',
										displayField: 'name',
										valueField  : 'id',
										value       : 0//Default
									},
									{
				                        xtype       : 'textfield',
				                        fieldLabel  : 'Mobility Domain',
				                        name        : 'mobility_domain',
				                        itemId      : 'txtMobilityDomain',
				                        minLength   : 4,
				                        maxLength   : 4,
				                        allowBlank  : true,  
				                        blankText   : i18n("sSupply_a_value"),
				                        labelClsExtra: 'lblRd',
				                        validator: function(val) {
				                        	if(val == ''){
				                        		return true; //allow empty
				                        	}
				                        	if((/^([a-fA-F0-9]){4}$/).test(val)){
				                        		return true;
											}else{
												return '4-character hexadecimal ID Please';
											}
										}
				                    },
									{
				                        xtype       : 'checkbox',      
				                        boxLabel    : 'Generate NAS ID',
				                        name        : 'auto_nasid',
				                        inputValue  : 'auto_nasid',
				                        checked     : true,
				                        boxLabelCls	: 'boxLabelRd',
				                        itemId      : 'chkFtNasid',
				                    },
				                    {
				                        xtype       : 'textfield',
				                        fieldLabel  : 'NAS ID',
				                        name        : 'nasid',
				                        itemId      : 'txtFtNasid',
				                        allowBlank  : false,
				                        blankText   : i18n("sSupply_a_value"),
				                        labelClsExtra: 'lblRdReq',
				                        hidden		: true,
				                        disabled	: true
				                    },									
				                    {
										xtype       : 'checkbox',      
										boxLabel    : 'Generate PMK Locally',
										name        : 'ft_pskgenerate_local',
										inputValue  : 'ft_pskgenerate_local',
										boxLabelCls	: 'boxLabelRd',
										checked		: true
									}
								]
							}						                           
                        ]
                    },
                    { 
                        'title'     : i18n("sAdvanced"),
                        'layout'    : 'anchor',
                        itemId      : 'tabAdvanced',
                        defaults    : {
                            anchor: '100%'
                        },
                        autoScroll:true,
                        items       : [ 
                            {
                                xtype       : 'checkbox',      
                                name        : 'chk_maxassoc',
                                inputValue  : 'chk_maxassoc',
                                checked     : false,
                                itemId      : 'chk_maxassoc',
                                boxLabel  	: i18n("sLimitClients"),
                                boxLabelCls	: 'boxLabelRd'
                            },          
                            {
                                xtype       : 'numberfield',
                                name        : 'maxassoc',
                                fieldLabel  : i18n("sMaxClients"),
                                value       : 100,
                                maxValue    : 1000,
                                minValue    : 1,
                                labelClsExtra: 'lblRdReq',
                                hidden      : true,
                                disabled    : true,
                                itemId      : 'maxassoc'
                            }, 
                            { 
                                xtype       : 'cmbMacFilter',
                                labelClsExtra: 'lblRdReq'
                            },
                            {
                                xtype       : 'cmbPermanentUser',
                                fieldLabel  : i18n("sBYOD_Belonging_To"),
                                labelClsExtra: 'lblRdReq',
                                name        : 'permanent_user_id',
                                hidden      : true,
                                disabled    : true
                            }     
                        ]
                    },
                    { 
                        title     	: 'Schedule',
                        layout      : {
                        	type	: 'vbox',
                        	align	: 'stretch',
                        	pack	: 'start'	
                        },
                        itemId      : 'tabSchedule',
                        autoScroll	:true,
                        items       : [ 
                            {
                                xtype       : 'checkbox',      
                                name        : 'chk_schedule',
                                inputValue  : 'chk_schedule',
                                checked     : false,
                                itemId      : 'chk_schedule',
                                labelWidth  : Rd.config.labelWidth,
                                boxLabel  	: 'Enable',
                                boxLabelCls	: 'boxLabelRd'
                            },
                            {
                            	xtype		: 'gridSchedule',
                            	mode		: me.mode,
                            	flex		: 1,
                            	disabled	: true                          
                            }
                        ]
                    }
                ]
            }
        ];
        me.callParent(arguments);

    }
});

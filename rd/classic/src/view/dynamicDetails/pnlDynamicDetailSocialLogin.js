Ext.define('Rd.view.dynamicDetails.pnlDynamicDetailSocialLogin', {
    extend  : 'Ext.panel.Panel',
    alias   : 'widget.pnlDynamicDetailSocialLogin',
    border  : false,
    dynamic_detail_id: null,
    layout  : 'hbox',
    bodyStyle: {backgroundColor : Rd.config.panelGrey },
    user_id : undefined, // The user_id of the Access Provider who owns the Dynamic Login page -> This will influence the list of Realms and Profiles
    initComponent: function(){
        var me = this;

		var voucher_or_user = Ext.create('Ext.data.Store', {
			fields: ['id', 'name'],
			data : [
				{"id":"voucher", 	"name":"Voucher"},
				{"id":"user", 		"name":"Permanent User"}
			]
		});

        me.items =  { 
                xtype   :  'form',
                height  : '100%', 
                width   :  450,
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
                    maxWidth        : Rd.config.maxWidth  
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
                                'title'     : 'Basic',
                                'layout'    : 'anchor',
                                itemId      : 'tabSocialBasic',
                                defaults    : {
                                    anchor: '100%'
                                },
                                autoScroll:true,
                                items       : [
									{
								        xtype       : 'textfield',
								        name        : "id",
								        hidden      : true,
										value		: me.dynamic_detail_id
								    },
									{
								        xtype       : 'checkbox',      
								        fieldLabel  : 'Enable',
								        itemId      : 'chkEnableSocialLogin',
								        name        : 'social_enable',
								        inputValue  : 'social_enable',
								        checked     : true,
								        labelClsExtra: 'lblRdReq'
								    },
									{
										xtype       : 'cmbPermanentUser',
										fieldLabel  : 'Temp login user',
										allowBlank  : false,
										name		: 'social_temp_permanent_user_id',
										itemId		: 'socialTempUser'
									}
                                ]
                            },
                            { 
                                'title'     : 'Facebook',
                                'layout'    : 'anchor',
                                itemId      : 'tabFacebook',
								glyph		: Rd.config.icnFacebook,
                                defaults    : {
                                    anchor: '100%'
                                },
                                autoScroll:true,
                                items       : [
									{
								        xtype       	: 'checkbox',      
								        fieldLabel  	: 'Enable',
								        name        	: 'fb_enable',
								        inputValue  	: 'fb_enable',
										labelClsExtra	: 'lblRdReq'
								    },	   
									{
								        xtype       	: 'checkbox',      
								        fieldLabel  	: 'Record info',
								        name        	: 'fb_record_info',
								        inputValue  	: 'fb_record_info',
										labelClsExtra	: 'lblRdReq'
								    },				
									{
								        xtype       	: 'textfield',
								        fieldLabel  	: 'Key/Id',
								        name        	: 'fb_id',
										labelClsExtra	: 'lblRdReq'
								    },
									{
								        xtype       	: 'textfield',
								        fieldLabel  	: 'Secret',
								        name        	: 'fb_secret',
										labelClsExtra	: 'lblRdReq'
								    },
									{
										xtype			: 'combobox',
										fieldLabel		: 'Auto create',
										store			: voucher_or_user,
										queryMode		: 'local',
										displayField	: 'name',
										valueField		: 'id',
										value			: 'voucher',
										name			: 'fb_voucher_or_user',
										labelClsExtra	: 'lblRdReq'
									},
									{
		                                xtype       	: 'cmbRealm',
		                                labelClsExtra	: 'lblRdReq',
										itemId      	: 'fbRealm',
										extraParam  	: me.user_id,
										name			: 'fb_realm',
										allowBlank  	: false
		                            },
		                            {
		                                xtype       	: 'cmbProfile',
		                                labelClsExtra	: 'lblRdReq',
		                                itemId      	: 'fbProfile',
										extraParam  	: me.user_id,
										name			: 'fb_profile',
										allowBlank  	: true
		                            }     
                                ]
                            },
                            { 
                                'title'     : 'Twitter',
                                'layout'    : 'anchor',
                                itemId      : 'tabTwitter',
								glyph		: Rd.config.icnTwitter,
                                defaults    : {
                                    anchor: '100%'
                                },
                                autoScroll:true,
                                items       : [ 
									{
								        xtype       	: 'checkbox',      
								        fieldLabel  	: 'Enable',
								        name        	: 'tw_enable',
								        inputValue  	: 'tw_enable',
										labelClsExtra	: 'lblRdReq'
								    },	 
									{
								        xtype       	: 'checkbox',      
								        fieldLabel  	: 'Record info',
								        name        	: 'tw_record_info',
								        inputValue  	: 'tw_record_info',
										labelClsExtra	: 'lblRdReq'
								    },				
									{
								        xtype       	: 'textfield',
								        fieldLabel  	: 'Key/Id',
								        name        	: 'tw_id',
										labelClsExtra	: 'lblRdReq'
								    },
									{
								        xtype       	: 'textfield',
								        fieldLabel  	: 'Secret',
								        name        	: 'tw_secret',
										labelClsExtra	: 'lblRdReq'
								    },
									{
										xtype			: 'combobox',
										fieldLabel		: 'Auto create',
										store			: voucher_or_user,
										queryMode		: 'local',
										displayField	: 'name',
										valueField		: 'id',
										value			: 'voucher',
										name			: 'tw_voucher_or_user',
										labelClsExtra	: 'lblRdReq'
									},
									{
		                                xtype       	: 'cmbRealm',
		                                ///allowBlank  	: false,
		                                labelClsExtra	: 'lblRdReq',
										itemId      	: 'twRealm',
										extraParam  	: me.user_id,
										name			: 'tw_realm',
										allowBlank  	: true
		                            },
		                            {
		                                xtype       	: 'cmbProfile',
		                                ///allowBlank  	: false,
		                                labelClsExtra	: 'lblRdReq',
		                                itemId      	: 'twProfile',
										extraParam  	: me.user_id,
										name			: 'tw_profile',
										allowBlank  	: true
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

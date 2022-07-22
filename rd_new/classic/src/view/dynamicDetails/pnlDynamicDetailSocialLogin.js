Ext.define('Rd.view.dynamicDetails.pnlDynamicDetailSocialLogin', {
    extend      : 'Ext.form.Panel',
    alias       : 'widget.pnlDynamicDetailSocialLogin',
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
        'Rd.view.dynamicDetails.vcDynamicDetailSocialLogin'
    ],
    controller  : 'vcDynamicDetailSocialLogin',
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
        var me      = this;
        var w_prim  = 550;

		var voucher_or_user = Ext.create('Ext.data.Store', {
			fields: ['id', 'name'],
			data : [
				{"id":"voucher", 	"name":"Voucher"},
				{"id":"user", 		"name":"Permanent User"}
			]
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
        }
        
        var cntFb  = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
            items       : [
                {
			        xtype       	: 'checkbox',      
			        fieldLabel  	: 'Enable',
			        name        	: 'fb_enable',
			        inputValue  	: 'fb_enable',
					labelClsExtra	: 'lblRdReq',
					itemId          : 'chkFbEnable',
					checked         : true
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
        };
        
        var cntTwitter  = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
            items       : [
                {
			        xtype       	: 'checkbox',      
			        fieldLabel  	: 'Enable',
			        name        	: 'tw_enable',
			        inputValue  	: 'tw_enable',
					labelClsExtra	: 'lblRdReq',
					itemId          : 'chkTwEnable',
					checked         : true
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
        };
        
        var cntGoogle  = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
            items       : [
                {
			        xtype       	: 'checkbox',      
			        fieldLabel  	: 'Enable',
			        name        	: 'gp_enable',
			        inputValue  	: 'gp_enable',
					labelClsExtra	: 'lblRdReq',
					itemId          : 'chkGpEnable',
					checked         : true
			    },	 
				{
			        xtype       	: 'checkbox',      
			        fieldLabel  	: 'Record info',
			        name        	: 'gp_record_info',
			        inputValue  	: 'gp_record_info',
					labelClsExtra	: 'lblRdReq'
			    },				
				{
			        xtype       	: 'textfield',
			        fieldLabel  	: 'Key/Id',
			        name        	: 'gp_id',
					labelClsExtra	: 'lblRdReq'
			    },
				{
			        xtype       	: 'textfield',
			        fieldLabel  	: 'Secret',
			        name        	: 'gp_secret',
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
					name			: 'gp_voucher_or_user',
					labelClsExtra	: 'lblRdReq'
				},
				{
                    xtype       	: 'cmbRealm',
                    labelClsExtra	: 'lblRdReq',
					itemId      	: 'gpRealm',
					extraParam  	: me.user_id,
					name			: 'gp_realm',
					allowBlank  	: true
                },
                {
                    xtype       	: 'cmbProfile',
                    labelClsExtra	: 'lblRdReq',
                    itemId      	: 'gpProfile',
					extraParam  	: me.user_id,
					name			: 'gp_profile',
					allowBlank  	: true
                }         
            ]
        };
        
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
                title       : "Facebook",
                glyph       : Rd.config.icnFacebook, 
                ui          : 'panel-green',
                layout      : {
                  type      : 'vbox',
                  align     : 'start',
                  pack      : 'start'
                },
                bodyPadding : 10,
                items       : cntFb				
            },
            {
                xtype       : 'panel',
                title       : "Twitter",
                glyph       : Rd.config.icnTwitter, 
                ui          : 'panel-green',
                layout      : {
                  type      : 'vbox',
                  align     : 'start',
                  pack      : 'start'
                },
                bodyPadding : 10,
                items       : cntTwitter				
            },
            {
                xtype       : 'panel',
                title       : "Google",
                glyph       : Rd.config.icnGoogle, 
                ui          : 'panel-green',
                layout      : {
                  type      : 'vbox',
                  align     : 'start',
                  pack      : 'start'
                },
                bodyPadding : 10,
                items       : cntGoogle				
            }
        ];


        me.callParent(arguments);
    }
});

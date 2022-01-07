Ext.define('Rd.view.registration.pnlUpdateRegistration', {  
    extend      : 'Ext.panel.Panel',
    border      : false,
    autoCreate  : false,
    xtype       : 'pnlUpdateRegistration',
    layout      : 'fit',
    requires    : ['Rd.view.components.compWallpaper'],
    url         : null,   	//Placheholder for wallpaper URL 
	valToken	: null,		//Placheholder for valid registration process token
	valEmail	: '',
    title       : Rd.config.headerName,
    dockedItems : [{
        xtype   : 'toolbar',
        dock    : 'bottom',
        ui      : 'footer', 
        items   : [
            '->', 
            '<b>'+Rd.config.footerName+"</b> "+Rd.config.footerLicense //2012-2016 GPL license'
        ]
    }],    
    requires    : [
        'Rd.view.registration.vcRegister'
    ],
    initComponent: function () {
        var me      = this;
        me.items    = [{'xtype' : 'compWallpaper','url' : me.url}];
        me.add(me.updateRegistrationWindow());
        me.callParent(arguments);
    },
    updateRegistrationWindow: function(){
		var me = this,
			uriSafe ='';

			// Convert back from URI friendly base64 to actual before decode :-_
			uriSafe = me.valEmail.replace(/\:/g, '+').replace(/\-/g,'/').replace(/\_/g,'=');
			sEmail = Ext.util.Base64.decode(uriSafe);
		
        var winReg = Ext.create('Ext.panel.Panel', {
            layout  : "fit",
            width   : 800,
            title   : 'Complete Registration',
            glyph   : Rd.config.icnLock,
            height  : 450,
            itemId  : 'winUpdateReg',
            floating: true,
            border  : false,
            shadow  : false,
			controller  : 'vcRegister',
            items   : [ {
                    xtype       : 'form',
                    border      : false,
                    layout      : 'vbox',
                    height      : '100%',
					width		: '100%',
                    bodyPadding : 20,
                    fieldDefaults: {
                        msgTarget       : 'under',
                        labelAlign      : 'right',
                        //anchor          : '100%',
						labelWidth      : Rd.config.labelWidth,
                        labelSeparator  : '',
                        labelClsExtra   : 'lblRd'
                    },
                    defaultType : 'textfield',
                    items: [
						// hidden fields
						{
							name    : 'active',
							value	: 1,
							hidden	: true
						},
						{
							name    : 'token',
							itemId	: 'tokenKey',
							value	: me.valToken,
							hidden	: true
						},
						// Input fields
						{
							xtype       : 'container',
							padding		: 5,
							layout      : 'column',
							items: [
								{
									xtype       : 'textfield',
									columnWidth	: 0.5,
									itemId		: 'txUserName',
									hidden		: true,
									name        : "rusername"
									//fieldLabel  : i18n('sUsername'),
									//allowBlank  : false,
									//readOnly	: true,
									//blankText   : i18n("sEnter_a_value"),
									//labelClsExtra: 'lblRdReq'
								},
								{
									xtype       : 'textfield',
									//flex		: 1,
									columnWidth	: 1,
									itemId		: 'txRegEmail',
									fieldLabel  : 'Email',
									name        : "email",
									vtype       : 'email',
									readOnly	: true,
									allowBlank  : false,
									labelClsExtra: 'lblRdReq'
								}
							]
						},
						{
							xtype       : 'container',
							padding		: 5,
							layout      : 'column',
							items: [
								{
									xtype       : 'textfield',
									itemId      : 'regPassword',
									//flex		: 1,
									columnWidth	: 0.5,
									name        : 'rpassword',
									fieldLabel  : 'Password',
									inputType   : 'password',
									allowBlank  : false,
									blankText   : i18n('sEnter_password'),
									labelClsExtra: 'lblRdReq'
								},
								{
									xtype       : 'textfield',
									itemId      : 'chkRegPassword',                            
									//flex		: 1,
									columnWidth	: 0.5,
									//name        : 'chkpassword',
									fieldLabel  : 'Check Password',
									inputType   : 'password',
									allowBlank  : false,
									blankText   : 'Re-Enter Password',
									validator: function (field) {
										var form = this.up('form');
										var field1 = form.down('#regPassword');
										if (this.getValue() != field1.getValue()) {
											return 'Password fields do not match';
										}
										return true;
									},
									labelClsExtra: 'lblRdReq' 
								}
							]
						},
						{
							xtype       : 'container',
							padding		: 5,
							layout      : 'column',
							items: [
								{
									xtype       : 'textfield',
									//flex		: 1,
									columnWidth	: 0.5,
									fieldLabel  : i18n('sName'),
									name        : "name"
								},
								{
									xtype       : 'textfield',
									//flex		: 1,
									columnWidth	: 0.5,
									fieldLabel  : i18n('sSurname'),
									name        : "surname"
								}
							]
						},
						{
							xtype       : 'container',
							layout      : 'column',
							padding		: 5,
							items: [
								{
									xtype       : 'textfield',
									//flex		: 1,
									columnWidth	: 0.5,
									fieldLabel  : i18n('sPhone'),
									name        : "phone",
									vtype       : 'Numeric'
								},
								{ 
									xtype       : 'cmbLanguages', 
									//flex		: 1,
									columnWidth	: 0.5,
									fieldLabel  : i18n('sLanguage'),  
									name        : 'language', 
									allowBlank  : false,
									labelClsExtra: 'lblRdReq' 
								}
							]
						},
						{
							xtype       : 'container',
							padding		: 5,
							layout      : 'column',
							items: [
								{
									xtype       : 'checkbox',
									columnWidth : 0.25,
									//flex		: 1,								
									itemId      : 'chkGetAlerts',      
									fieldLabel  : 'Get Email Alerts',
									name        : 'notif_threshold',
									inputValue  : 'notif_threshold',
									checked     : false
								},
								{
									xtype       : 'numberfield',
									columnWidth : 0.75,
									labelWidth	: 200,								
									fieldLabel  : 'Frequency (every N hours)',
									name        : 'notif_frequency',
									itemId      : 'fldFrequency',
									allowBlank  : true,
									minValue    : 1,
									maxValue    : 12,
									step        : 1,
									keyNavEnabled : true,
									anchor    : '90%'
								}
							]
						},
						{
							xtype       : 'container',
							padding		: 5,
							layout      : 'hbox',
							items: [
								{
									xtype     : 'textareafield',
									grow      : true,
									name      : 'address',
									fieldLabel: i18n('sAddress'),
									anchor    : '100%'
								}
							]
						}
                    ],
                    dockedItems: [{
                        xtype   : 'toolbar',
                        dock    : 'bottom',
                        ui      : 'footer',
                        padding : 0,
                        items: [ 
							{
								itemId: 'saveRegistration',
								formBind: true,
								text: i18n('sSave'),
								scale: 'large',
								iconCls: 'b-save', 
								glyph: Rd.config.icnYes,  
								margin: Rd.config.buttonMargin
							}
                        ]
                    }]
                }]
        });
		var emailFld = winReg.down('#txRegEmail'),
			userNameFld = winReg.down('#txUserName');
		
		emailFld.setValue(sEmail);
		userNameFld.setValue(sEmail);
		winReg.show();
    }
});

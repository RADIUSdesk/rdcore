Ext.define('Rd.view.registration.pnlRegister', {  
    extend      : 'Ext.panel.Panel',
    border      : false,
    autoCreate  : false,
    xtype       : 'pnlRegister',
    layout      : 'fit',
    requires    : ['Rd.view.components.compWallpaper'],
    url         : null,   	//Placheholder for wallpaper URL 
	pEmail		: null,		//Placheholder for possible passed in email address 
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
        me.add(me.registerWindow(me.pEmail));
        me.callParent(arguments);
    },
    registerWindow: function(email64){
    
        var winReg = Ext.create('Ext.panel.Panel', {
            layout  : "fit",
            width   : 400,
            title   : 'Register',
            glyph   : Rd.config.icnLock,
            height  : 310,
            itemId  : 'winRegister',
            floating: true,
            border  : false,
            shadow  : false,
			controller  : 'vcRegister',
            items   : [ {
                    xtype       : 'form',
                    border      : false,
                    layout      : 'anchor',
                    height      : '100%',
                    bodyPadding : 20,
                    fieldDefaults: {
                        msgTarget       : 'under',
                        labelAlign      : 'top',
                        anchor          : '100%',
                        labelSeparator  : '',
                        labelClsExtra   : 'lblRd'
                    },
                    defaultType : 'textfield',
                    items: [
						{
							xtype: 'box',
							height: 30,
							html: 'Enter/Verify your best email'
						},
                        {
                            itemId      : 'txEmail',
                            name        : 'email',
                            fieldLabel  : i18n('s_email'),
                            allowBlank  : false,
                            blankText   : 'Enter Email',
							vtype       : 'email',
                            listeners   : {
                                change : 'onTxEmailChange'
                            } 
                        },
                        {
                            itemId      : 'txCode',                            
                            name        : 'registration_code',
                            fieldLabel  : 'Registration Code',
                            allowBlank  : true,
                            blankText   : 'Enter Code',
                            listeners   : {
                                change : 'onTxCodeChange'
                            } 
                        }
                    ],
                    dockedItems: [{
                        xtype   : 'toolbar',
                        dock    : 'bottom',
                        ui      : 'footer',
                        padding : 0,
                        items: [ 
                            {
                                text    : 'Register',
								itemId	: 'btnRegister',
                                margin  : Rd.config.buttonMargin,
                                action  : 'register',
                                ui      : 'button-teal',
                                type    : 'submit',
                                //formBind: true,
								disabled    : true,
                                scale   : 'large',
                                glyph   : Rd.config.icnYes
                            },
                            {
                                text    : 'Get Code',
								itemId	: 'btnCode',
                                margin  : Rd.config.buttonMargin,
                                action  : 'getcode',
                                //ui      : 'button-teal',
                                type    : 'submit',
                                scale   : 'large',
								disabled    : true,
                                glyph   : Rd.config.icnLock
                            }  
                        ]
                    }]
                }]
        });
		var emailFld = winReg.down('#txEmail');
		if(email64 != '') {
		// Convert back from URI friendly base64 to actual before decode :-_
			email64 = email64.replace(/\:/g, '+').replace(/\-/g,'/').replace(/\_/g,'=');
			emailFld.setValue(Ext.util.Base64.decode(email64));
		}
		winReg.show();
    }
});

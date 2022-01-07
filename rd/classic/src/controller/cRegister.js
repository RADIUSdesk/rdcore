Ext.define('Rd.controller.cRegister', {
    extend: 'Ext.app.Controller',
    views:  [
		'registration.pnlRegister',
		'registration.pnlUpdateRegistration',
	],
    stores: ['sLanguages'],
    config: {
        urlRegistration	: '/cake3/rd_cake/registration-requests/complete_registration.json',
        urlGetCode		: '/cake3/rd_cake/registration-requests/get_code.json',
        urlCompleteReg	: '/cake3/rd_cake/registration-requests/complete_registration_create_user.json',
        urlWallpaper	: 'resources/images/wallpapers/2.jpg'
    },
    refs: [
        { ref: 'viewP',         selector: 'viewP',          xtype: 'viewP',      autoCreate: true },
        { ref: 'pnlRegister',      selector: 'pnlRegister',       xtype: 'pnlRegister',   autoCreate: true},
        { ref: 'pnlUpdateRegistration',      selector: 'pnlUpdateRegistration',       xtype: 'pnlUpdateRegistration',   autoCreate: true},
		
    ], 
   init: function() {
        me = this;
        if (me.inited) {
            return;
        }
        me.inited = true;
        me.control({
            '#btnRegister': {
                click: me.register
            },
            'pnlLogin #cmbLanguage': {
                select: me.onLanguageSelect
            },
            '#btnCode': {
                click:	me.getCode
            },
            '#saveRegistration': {
                click:      me.completeRegistration
            },
        });
    },
    actionIndex: function(email64){
        var me = this;
        var li = me.getView('registration.pnlRegister').create({'url':me.getUrlWallpaper(),'pEmail':email64});
        var vp = me.getViewP();
        vp.removeAll(true);
        vp.add([li]);
    },
    actionUpdateRegistration: function(valEmail){
        var me = this,
			tmptoken = Ext.util.Cookies.get("AMPregToken");
			
        var li = me.getView('registration.pnlUpdateRegistration').create({'url':me.getUrlWallpaper(),'valEmail':valEmail,'valToken':tmptoken});
        var vp = me.getViewP();
        vp.removeAll(true);
        vp.add([li]);
    },

    register: function(button){
        var me      = this,
			win    	= button.up('#winRegister'),
			form    = win.down('form'),
			sEmail	= form.getValues().email;
        
		var esEmail = Ext.util.Base64.encode(sEmail);
		// Make it URI safe - change "+/=" occurences to ":-_"
		esEmail = esEmail.replace(/\+/g, ':').replace(/\//g,'-').replace(/=/g,'_');
		
        form.submit({
            clientValidation    : true,
            url                 : me.getUrlRegistration(),
            //params              : {auto_compact: auto_compact},
			success: function(form, action) {
				var ttoken = action.result.token_key;
				Ext.ux.Toaster.msg(
					'Success!',
					'Now Complete Your Registration...',
					Ext.ux.Constants.clsInfo,
					Ext.ux.Constants.msgInfo
				);
                //Set the token cookie
                var now = new Date();
				now = new Date(now.getTime() + 10*60000); // set token to expire in 10 minutes
                Ext.util.Cookies.set("AMPregToken", ttoken, now, "/", null, false);
				
				me.redirectTo('updateregistration/'+esEmail,{force: true});
			},
			failure: function(form, action) {
				switch (action.failureType) {
					case Ext.form.action.Action.CLIENT_INVALID:
						Ext.Msg.alert('Failure', 'Form fields may not be submitted with invalid values');
						break;
					case Ext.form.action.Action.CONNECT_FAILURE:
						Ext.Msg.alert('Failure', 'Ajax communication failed');
						break;
					case Ext.form.action.Action.SERVER_INVALID:
					   Ext.Msg.alert('Failure', action.result.message);
			   }
			}
            //failure: Ext.ux.formFail
        });
    },
	getCode: function(button) {
		var me = this;
		console.log('Get Code btn clicked');
        var win    = button.up('#winRegister'),
        form       = win.down('form');
          
		if(form.isValid()){
			form.submit({
				clientValidation    : false,
				url                 : me.getUrlGetCode(),
				success: function(form, action) {
				   Ext.Msg.alert('Success', action.result.message+'<br>Your Registration Request has been received.<br>Once you have received an email with your Registration Code, you can return here to complete your registration.');
				},
				failure: function(form, action) {
					switch (action.failureType) {
						case Ext.form.action.Action.CLIENT_INVALID:
							Ext.Msg.alert('Failure', 'Form fields may not be submitted with invalid values');
							break;
						case Ext.form.action.Action.CONNECT_FAILURE:
							Ext.Msg.alert('Failure', 'Ajax communication failed');
							break;
						case Ext.form.action.Action.SERVER_INVALID:
						   Ext.Msg.alert('Failure', action.result.message);
				   }
				}
			});
		} else {
			Ext.Msg.alert('Invalid', 'Please pcorrect invalid fields.');
			return false;
		}
	},
    completeRegistration: function(button){
        var me      = this;
        var win    = button.up('#winUpdateReg'),
        form       = win.down('form');
                
        form.submit({
            clientValidation    : true,
            url                 : me.getUrlCompleteReg(),
            //params              : {auto_compact: auto_compact},
			success: function(form, action) {
				Ext.ux.Toaster.msg(
					'Success!',
					'You may now Login',
					Ext.ux.Constants.clsInfo,
					Ext.ux.Constants.msgInfo
				);
				//me.redirectTo('updateregistration/'+action.result.token,{force: true});
				me.redirectTo('login',{force: true});
			},
			failure: function(form, action) {
				switch (action.failureType) {
					case Ext.form.action.Action.CLIENT_INVALID:
						Ext.Msg.alert('Failure', 'Form fields may not be submitted with invalid values');
						break;
					case Ext.form.action.Action.CONNECT_FAILURE:
						Ext.Msg.alert('Failure', 'Ajax communication failed');
						break;
					case Ext.form.action.Action.SERVER_INVALID:
					   Ext.Msg.alert('Failure', action.result.message);
			   }
			}
            //failure: Ext.ux.formFail
        });
    }
});

/* 
This controller is the starting point. 
It checks if a user is logged in
If not it will load the Login controller and call it's Index action
If they are logged in it will load the Dashboard controller and call it's Index action
*/

Ext.define('Rd.controller.cStartup', {
    extend: 'Ext.app.Controller',
    mixins : [
        'Ext.route.Mixin'
    ],

    routes : {
        'login' 						: 'onLoginRoute',
		'dashboard'						: 'onDashboardRoute',
		'register/:email64'				: 'onRegisterRoute',
        'updateregistration/:valEmail'	: {
											before  : 'onBeforeUpdateReg',
											action  : 'onUpdateRegistrationRoute'
										  },
		'passwordreset'					: 'onPasswordReset'
    },
    config: {
        urlCheckToken:          '/cake4/rd_cake/dashboard/check_token.json'
    },
    refs: [
        { ref: 'viewP',         selector: 'viewP',          xtype: 'viewP',      autoCreate: false }
    ],
	init: function() {
        me = this;
        me.control({
            '*': {
                unmatchedroute: 'handleUnmatchedRoute'
            }
        });
	},
	actionIndex: function(){
        var me          = this;     
        Rd.getApplication().setSelLanguage(Rd.config.selLanguage); //We hardcode the language since it is not very efficient to store the phrases in DB
        Ext.Ajax.setExtraParams({'sel_language': Rd.getApplication().getSelLanguage()});
		me.originalRoute = Rd.getApplication().getDefaultToken();
		setTimeout(function(){
		  Ext.get('loading').remove();
		  Ext.get('loadSpin').fadeOut({remove:true});
		}, 250);

    },
    // ROUTING
    onLoginRoute: function() {
        var me = this,
			token = Ext.util.Cookies.get("Token"); 
			
		me.cleanUpWins();
		//No token?
        if(token == null){
            me.showAuth();
        } else {
			//me.redirectTo('dashboard', {replace: true}); // Continue if already logged in
			me.redirectTo('dashboard'); // Continue if already logged in
			return;
		}
    },
    onDashboardRoute: function() {
        var me = this,
			token = Ext.util.Cookies.get("Token"); 
			
		me.cleanUpWins();
		//No token?
        if(token == null){
            me.showAuth();
        } else {
			me.checkToken(token).catch(function(error) {
				console.log('Auth Error - '+error);
				me.showAuth();
			}).then(function(authData) {
                if(authData != undefined){//Apply phrases to the cusom VTypes to include language:
					Rd.getApplication().applyVtypes();
					Ext.Ajax.setExtraParams({}); // Clear any old ones out
					//Set extra params to token's value
					//This is the second place of three where we set the extraParams. The token is valid 3rt blace in cLogin.js
					Ext.Ajax.setExtraParams({'token': authData.data.token,'sel_language': Rd.getApplication().getSelLanguage()});
					Rd.getApplication().setDashboardData(authData.data);
					me.showMain();
				}
				return;
			});
        }
    },
    onRegisterRoute: function(email64) {
        var me = this; 
		
		me.cleanUpWins();
		//debugger;  // REMOVE	
		if(!email64 || email64 == 'nr'){
			email64 = '';
		}
        Rd.getApplication().runAction('cRegister','Index',email64); 
    },
	onBeforeUpdateReg: function(valEmail,action){
		var me 		= this,
			tmptoken 	= Ext.util.Cookies.get("AMPregToken");
			
        if(!valEmail || valEmail == '' || tmptoken == null){
			Ext.ux.Toaster.msg(
				'Invalid Registration',
				'Your Registration has expired.  Please request a new code.',
				Ext.ux.Constants.clsInfo,
				Ext.ux.Constants.msgInfo
			);
			action.stop();
			me.redirectTo('login',{force:true});
		} else {
			action.resume();
		}	
	},
    onUpdateRegistrationRoute: function(valEmail) {
        var me = this; 
			
		me.cleanUpWins();
		Rd.getApplication().runAction('cRegister','UpdateRegistration',valEmail); 

    },
    onPasswordReset: function() {
        var me = this; 			
        Rd.getApplication().runAction('cPasswordReset','Index'); // TODO

    },
	//
	//  cleanUpWins - Close windows that may have been reached during "out of app" registration/password resett/login processes
	cleanUpWins: function() {
		var me = this,
			rwin = Ext.ComponentQuery.query('#winRegister')[0],
			lwin = Ext.ComponentQuery.query('#winLogin')[0],
			uprwin = Ext.ComponentQuery.query('#winUpdateReg')[0],
			msgWin = Ext.ComponentQuery.query('panel[cls~=x-message-box]')[0],
			vp = me.getViewP(); //No token?
		vp.removeAll(true);
		if(msgWin != undefined){
			try {
				msgWin.close();
			} catch (err) {
				// just pass through
			}
		} 
		if(rwin != undefined){
			rwin.close();
		} 
		if(lwin != undefined){
			lwin.close();
		} 
		if(uprwin != undefined){
			uprwin.close();
		} 
	},
	// Verify Valid Token on backend
	checkToken: function(token){
		var me = this;
        return new Ext.Promise(function (resolve, reject) {
            var screen_width = Ext.getBody().getViewSize().width;
            var auto_compact = false;
            if(screen_width < 1000){ //Smaller screens -> Auto compact
                auto_compact = true;
            }
            //Check if the back-end likes our token
            Ext.Ajax.request({
                url: me.getUrlCheckToken(),
                params: {
                    token       : token,
                    auto_compact: auto_compact
                },
                method: 'GET',
                success: function(response){
                    var jsonData = Ext.JSON.decode(response.responseText);
                    //Set the phrases
                    if(jsonData.success){ //Token is ok, let us continiue
                        resolve(jsonData);
                    }else{
                        console.log(jsonData);
                        reject(response.status+':'+response.statusText);
                    }
                },
				failure: function(response, opts) {
					 reject(response.status+':'+response.statusText);
				}
            });
		});
	},
    showAuth: function() {
        console.log("Show Auth");
        this.application.runAction('cLogin','Index');
    },
    showMain: function() {
        console.log("Show Main");
        this.application.runAction('cDashboard','Index');
    },
    handleUnmatchedRoute: function(route) {
        var me = this;

        var target = Rd.getApplication().getDefaultToken();
        Ext.log.warn('Route unknown: ', route);
        if (route !== target) {
            me.redirectTo(target, {replace: true});
        }
    }

});

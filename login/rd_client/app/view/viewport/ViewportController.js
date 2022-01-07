Ext.define('AmpConf.view.viewport.ViewportController', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.ViewportController',
    config  : {
        urlCheckToken:          '/cake3/rd_cake/dashboard/check_token.json'
    },
    listen  : {
        //To listen to "login", "logout" and also any unmatchedroute events fired by any controller
        controller: {
            '*': {
                login           : 'onLogin',
                logout          : 'onLogout',
                unmatchedroute  : 'handleUnmatchedRoute'
            }
        }
    },
    
    //There's only one route defined called 'login' which will be called if there is no valid session
    //or might be called directly '#login'
    routes: {
        'login': 'handleLoginRoute'
    },
    
    //The #login route will be handled here
    handleLoginRoute: function() {
        this.showAuth();
    },
    
    requires: [
        'AmpConf.view.login.cntLogin'
    ], 
       
    onLaunch: function() {
        this.originalRoute = AmpConf.getApplication().getDefaultToken();
        this.restoreSession();
    }, 
    showView: function(xtype) {
        var view = this.lookup(xtype),
        viewport = this.getView();
        if (!view) {
            viewport.removeAll(true);
            view = viewport.add({
                xtype: xtype,
                reference: xtype
            });
        }
        viewport.setActiveItem(view);
    },    
    onLogin: function(session) {
        this.initiateSession(session);
        this.redirectTo(this.originalRoute, {replace: true});
    },
    onLogout: function(){
        //this.showView('cntLogin');
        var me      = this; 
        var view    = me.getView();
        me.terminateSession();
        view.setMasked({ xtype: 'loadmask' });
        view.setMasked(false);
        me.redirectTo('login', {replace: true});
        return;  
    },
    initiateSession: function(session) {
        this.saveSession(session);
        var view = this.lookup('PermanentUsers_show'),
        viewport = this.getView();
        if (!view) {
            viewport.removeAll(true);
            var username = session.username
            if(session.type == 'voucher'){
                username = session.name;
            }
            
            view = viewport.add({xtype: 'PermanentUsers_show',reference:'PermanentUsers_show', username: username,type:session.type});
        }
        viewport.setActiveItem(view);
    },     
    showAuth: function() {
        this.showView('cntLogin');
    },     
    showMain: function() {
       // this.showView('cntMain');
       this.showView('PermanentUsers_show');
    },
    
    //Unmatched rules will be handled it a certain way here but the rest will be handled in the main view   
    handleUnmatchedRoute: function(route) {
        var me = this;
        if (!me.session) {
            // There is no authenticated user, let's redirect to the login page but keep track
            // of the original route to restore the requested route after user authentication.
            me.originalRoute = route;
            me.redirectTo('login', {replace: true});
            return;
        }

        // There is an authenticated user, so let's simply redirect to the default token.
        var target = AmpConf.getApplication().getDefaultToken();
        Ext.log.warn('Route unknown: ', route);
        if (route !== target) {
            me.redirectTo(target, {replace: true});
        }
    },
          
    restoreSession: function() {
        var me      = this;
        var session = AmpConf.util.State.get('session');
        if(session !== null && session.token !== undefined){
            me.checkToken(session.token).catch(function(error) {
				me.showAuth();
			}).then(function(authData) {
                if(authData != undefined){	
					me.onLogin(authData.data);
				}
				return;
			});  
        }else{
            me.showAuth();
        }
    },  
    
    terminateSession: function() {
        this.saveSession(null);
    },
    saveSession: function(session) {
        AmpConf.util.State.set('session', session);
        this.session = session;
    }, 
    checkToken: function(token){
		var me = this;
        return new Ext.Promise(function (resolve, reject) {  
            //Check if the back-end likes our token
            Ext.Ajax.request({
                url     : me.getUrlCheckToken(),
                params  : {
                    token  : token
                },
                method  : 'GET',
                success : function(response){
                    var jsonData = Ext.JSON.decode(response.responseText);
                    //Set the phrases
                    if(jsonData.success){ //Token is ok, let us continiue
                        resolve(jsonData);
                    }else{
                        reject(response.status+':'+response.statusText);
                    }
                },
				failure: function(response, opts) {
					 reject(response.status+':'+response.statusText);
				}
            });
		});
	}
});


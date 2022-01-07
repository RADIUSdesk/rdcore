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
                info            : 'onInfo',
                mainSubmitOk    : 'onMainSubmitOk'
            }
        }
    },
    requires: [
        'AmpConf.view.login.cntLogin'
    ], 
    
    
    onLaunch: function() {
        this.restoreSession();
        //this.showView('cntLogin');
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
    },
    onLogout: function(){
        this.showView('cntLogin'); 
    },
    onLogout: function() {
        var me  = this,
        view    = me.getView();
        me.terminateSession();
        view.setMasked({ xtype: 'loadmask' });
        view.setMasked(false);
        this.showView('cntLogin');
        return;
    },
       
    onInfo: function(){
        this.showView('cntInfo');
    }, 
    
    onMainSubmitOk: function(){
        this.showView('pnlMainComplete');
    },
    
    initiateSession: function(session) {
        if(session.token != undefined){
            Ext.Ajax.setExtraParams({});
            Ext.Ajax.setExtraParams({'token': session.token});
        }
        this.saveSession(session);
        this.showMain();
    },   
   
    showAuth: function() {
        this.showView('cntLogin');
        //this.showView('cntMain');
    },     
    showMain: function() {
        this.showView('cntMain');
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


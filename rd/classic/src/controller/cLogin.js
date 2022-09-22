Ext.define('Rd.controller.cLogin', {
    extend: 'Ext.app.Controller',
    views:  ['login.pnlLogin'],
    config: {
        urlLogin        : '/cake4/rd_cake/dashboard/authenticate.json',
        urlBranding     : '/cake4/rd_cake/dashboard/branding.json',
        urlWallpaper    : 'resources/images/wallpapers/2.jpg'
    },
    refs: [
        { ref: 'viewP',         selector: 'viewP',          xtype: 'viewP',      autoCreate: true },
        { ref: 'pnlLogin',      selector: 'pnlLogin',       xtype: 'pnlLogin',   autoCreate: false}
    ], 
   init: function() {
        me = this;
        if (me.inited) {
            return;
        }
        me.inited = true;
        me.control({
            '#winLogin button[type="submit"]': {
                click: me.login
            },
            'pnlLogin #cmbLanguage': {
                select: me.onLanguageSelect
            },
            '#inpPassword': {
                specialkey: function(field, e) {
                    if(e.getKey() == e.ENTER) {
                        var form = field.up('form');
                        var btn  = form.down('button[type="submit"]');
                        btn.fireEvent('click', btn);
                    }
                }
            }
        });
    },
    actionIndex: function(){
        var me = this;
        Ext.Ajax.request({
            url     : me.getUrlBranding(),
            method  : 'GET',
            success: function(response){
                var jsonData    = Ext.JSON.decode(response.responseText);
                console.log(jsonData);
                if(jsonData.success){
                    var li = me.getView('login.pnlLogin').create(jsonData.data);
                    var vp = me.getViewP();
                    vp.removeAll(true);
                    vp.add([li]);

                }   
            },
            scope: me
        });        
    },

    login: function(button){
        var me      = this;
        var win    = button.up('#winLogin'),
        form       = win.down('form');
        
        var screen_width = Ext.getBody().getViewSize().width;
        var auto_compact = false;
        if(screen_width < 1000){ //Smaller screens -> Auto compact
            auto_compact = true;
        }
        
        form.submit({
            clientValidation    : true,
            url                 : me.getUrlLogin(),
            params              : {auto_compact: auto_compact},
            success: function(form, action) {
                Ext.getApplication().setDashboardData(action.result.data);

                //Set the token cookie
                var now = new Date();
                now.setDate(now.getDate() + 1);
                Ext.util.Cookies.set("Token", action.result.data.token, now, "/", null, false);

                //Add the token and language (the 3rd place where we can ser extraParams - remember each time we set it overrides!
                //Ext.Ajax.setExtraParams({'token': action.result.data.token,'sel_language': Ext.getApplication().getSelLanguage()});

                me.getViewP().removeAll(true);
                win.close();
				me.redirectTo('dashboard', {force: true});

                //Ext.getApplication().runAction('cDashboard','Index');
            },
            failure: Ext.ux.formFail
        });
    },
    actionExit: function() {
        var me = this;
        me.getViewP().removeAll(true);     //Remove the current panel that fills the viewport
        Ext.util.Cookies.clear("Token");
        //me.actionIndex();
		Ext.Ajax.setExtraParams({});

		me.redirectTo('login', {replace: true});
    }
});

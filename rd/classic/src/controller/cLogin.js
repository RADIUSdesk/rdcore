Ext.define('Rd.controller.cLogin', {
    extend: 'Ext.app.Controller',
    views:  ['login.pnlLogin'],
    config: {
        urlLogin    : '/cake3/rd_cake/dashboard/authenticate.json',
        urlWallpaper: 'resources/images/wallpapers/2.jpg'
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
        var li = me.getView('login.pnlLogin').create({'url':me.getUrlWallpaper()});
        var vp = me.getViewP();
        vp.removeAll(true);
        vp.add([li]);
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
                me.application.setDashboardData(action.result.data);

                //Set the token cookie
                var now = new Date();
                now.setDate(now.getDate() + 1);
                Ext.util.Cookies.set("Token", action.result.data.token, now, "/", null, false);

                //Add the token and language (the 3rd place where we can ser extraParams - remember each time we set it overrides!
                //Ext.Ajax.setExtraParams({'token': action.result.data.token,'sel_language': me.application.getSelLanguage()});

                me.getViewP().removeAll(true);
                win.close();
				me.redirectTo('dashboard', {force: true});

                //me.application.runAction('cDashboard','Index');
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

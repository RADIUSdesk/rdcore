Ext.define('Rd.view.settings.vcSettingsDefaults', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcSettingsDefaults',
    config: {
        urlView  : '/cake3/rd_cake/settings/view.json',
        urlSave  : '/cake3/rd_cake/settings/save-defaults.json'
    }, 
    control: {
        'pnlSettingsDefaults #save'    : {
            click   : 'save'
        }
    },
    onViewActivate: function(pnl){
        var me = this;
        me.getView().setLoading(true);
        me.getView().load({url:me.getUrlView(), method:'GET',
			success : function(a,b){  
		        me.getView().setLoading(false);
            }
		});       
    },
    save: function(button){
        var me      = this;
        var form    = button.up('form');
        form.submit({
            clientValidation    : true,
            url                 : me.getUrlSave(),
            success             : function(form, action) {              
                //FIXME reload store....
                Ext.ux.Toaster.msg(
                    i18n('sItem_updated'),
                    i18n('sItem_updated_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },
            failure             : Ext.ux.formFail
        });
    }
});

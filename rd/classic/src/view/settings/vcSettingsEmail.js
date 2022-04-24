Ext.define('Rd.view.settings.vcSettingsEmail', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcSettingsEmail',
    config: {
        urlView  : '/cake3/rd_cake/settings/view.json',
        urlSave  : '/cake3/rd_cake/settings/save-email.json',
        UrlEmail : '/cake3/rd_cake/settings/test-email.json'
    }, 
    control: {
        'pnlSettingsEmail #save'    : {
            click   : 'save'
        },
        '#chkEmailEnabled' : {
            change : 'onChkEmailEnabledChange'
        }
    },
    onChkEmailEnabledChange: function(chk){
        var me      = this;
        var form    = chk.up('form');
        if(chk.getValue()){
            form.down('#chkEmailSsl').enable();
            form.down('#txtEmailServer').enable();
            form.down('#txtEmailPort').enable();
            form.down('#txtEmailUsername').enable();
            form.down('#txtEmailPassword').enable();
            form.down('#txtEmailSendername').enable(); 
            form.down('#btnEmailTest').enable();       
        }else{
            form.down('#chkEmailSsl').disable();
            form.down('#txtEmailServer').disable();
            form.down('#txtEmailPort').disable();
            form.down('#txtEmailUsername').disable();
            form.down('#txtEmailPassword').disable();
            form.down('#txtEmailSendername').disable(); 
            form.down('#btnEmailTest').disable();     
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
    },
    onEmailTestClick : function(){
        var me = this;
        if(!Ext.WindowManager.get('winSettingsEmailTestId')){
            var w = Ext.widget('winSettingsEmailTest',{id:'winSettingsEmailTestId'});
            me.getView().add(w); 
            w.show();                 
        }     
    },
    onEmailTestOkClick : function(btn){
        var me      = this;
        var form    = btn.up('form');
        var win     = btn.up('window');
        form.submit({
            clientValidation    : true,
            url                 : me.getUrlEmail(),
            success             : function(form, action) {              
                Ext.ux.Toaster.msg(
                    'Email Sent',
                    'Email Sent Please Check',
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
                win.close();
            },
            failure  : Ext.ux.formFail
        });       
    }    
});

Ext.define('Rd.view.settings.vcSettings', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcSettings',
    config: {
        urlView  : '/cake3/rd_cake/settings/view.json',
        urlSave  : '/cake3/rd_cake/settings/save.json',
        urlViewL : '/cake3/rd_cake/settings/view-license.json',
        urlSaveL : '/cake3/rd_cake/settings/edit-license.json',
        UrlEmail : '/cake3/rd_cake/settings/test-email.json'
    }, 
    control: {
        '#toolReloadLicense': {
            click: 'toolReloadLicense'         
        },
        'pnlSettings #save'    : {
            click   : 'save'
        },
        '#chkMqttEnabled' : {
            change : 'onChkMqttEnabledChange'
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
    onChkMqttEnabledChange: function(chk){
        var me      = this;
        var form    = chk.up('form');
        if(chk.getValue()){
            form.down('#txtMqttUser').enable();
            form.down('#txtMqttPassword').enable();
            form.down('#txtMqttServerUrl').enable();
            form.down('#txtMqttCommandTopic').enable();
            
        }else{
            form.down('#txtMqttUser').disable();
            form.down('#txtMqttPassword').disable();  
            form.down('#txtMqttServerUrl').disable();
            form.down('#txtMqttCommandTopic').disable();  
        }
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
    onViewActivate: function(pnl){
        var me = this;
        console.log("Settings Panel Activated");
    },
    onViewLicenseActivate: function(pnl){
        var me = this;
        pnl.setLoading(true);
        Ext.Ajax.request({
            url     : me.getUrlViewL(),
            method  : 'GET',
            success : function(response){
                var jsonData = Ext.JSON.decode(response.responseText);
                pnl.setLoading(false);
                if(jsonData.success){
                    if(jsonData.data.a){
                        var l = Ext.util.Base64.decode(jsonData.data.l);
                        var a = Ext.util.Base64.decode(jsonData.data.a);
                        var m = Ext.util.Base64.decode(jsonData.data.m);
                        var k = Ext.util.Base64.decode(jsonData.data.k);
                        var tu = parseInt(a)+parseInt(m);
                        var ta = parseInt(l)-parseInt(tu);          
                        pnl.down('#cntInfo').setData({l:l,a:a,m:m,tu:tu,ta:ta});
                        
                        var pie =  [
                             {
                                name    : m+' Nodes',
                                data1   : m
                             }, 
                             {
                                name    : a+' APs',
                                data1   : a
                             },
                             {
                                name    : ta+' AVAILABLE',
                                data1   : ta
                             }
                         ];
                         pnl.down('#pieLicense').getStore().setData(pie);
                         pnl.down('#dispLicenseKey').setValue(k);
                     }                               
                }   
            },
            scope: me
        });    
    },
    onLicenseUpgradeClick : function(){
        var me = this;
        if(!Ext.WindowManager.get('winSettingsLicenseAddId')){
            var w = Ext.widget('winSettingsLicenseAdd',{id:'winSettingsLicenseAddId'});
            me.getView().add(w); 
            w.show();                 
        }   
    },
    onLicenseUpgradeSaveClick : function(btn){
        var me      = this;
        var form    = btn.up('form');
        var win     = btn.up('window');
        form.submit({
            clientValidation    : true,
            url                 : me.getUrlSaveL(),
            success             : function(form, action) {              
                //FIXME reload store....
                Ext.ux.Toaster.msg(
                    i18n('sItem_updated'),
                    i18n('sItem_updated_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
                var pnl = me.lookupReference('pnlSettingsLicense');
                me.onViewLicenseActivate(pnl);
                win.close();
            },
            failure             : Ext.ux.formFail
        });      
    },
    toolReloadLicense : function(){
        var me = this;
        me.onViewLicenseActivate(me.getView());        
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

Ext.define('Rd.view.settings.vcSettingsMqtt', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcSettingsMqtt',
    config: {
        urlView  : '/cake3/rd_cake/settings/view.json',
        urlSave  : '/cake3/rd_cake/settings/save-mqtt.json',
        UrlMqtt  : '/cake3/rd_cake/settings/test-mqtt.json'
    }, 
    control: {
        'pnlSettingsMqtt #save'    : {
            click   : 'save'
        },
        '#chkMqttEnabled' : {
            change : 'onChkMqttEnabledChange'
        },
        '#chkApiMqttEnabled' : {
            change : 'onChkApiMqttEnabledChange'
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
    onChkApiMqttEnabledChange: function(chk){
        var me      = this;
        var form    = chk.up('form');
        if(chk.getValue()){
            form.down('#txtApiMqttGatewayUrl').enable();
            form.down('#btnApiTest').enable();            
        }else{
            form.down('#txtApiMqttGatewayUrl').disable();
            form.down('#btnApiTest').disable();  
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
        me.getView().setLoading(true);
        me.getView().load({url:me.getUrlView(), method:'GET',
			success : function(a,b){  
		        me.getView().setLoading(false);
            }
		});       
    },
    onApiTestClick : function(){
        var me = this;
        if(!Ext.WindowManager.get('winSettingsApiMqttTestId')){
            var w = Ext.widget('winSettingsApiMqttTest',{id:'winSettingsApiMqttTestId'});
            me.getView().add(w); 
            w.show();                 
        }     
    },
    onSettingsApiMqttTestShow: function(win){
        var me = this;
        win.setLoading(true);
        Ext.Ajax.request({
            url     : me.getUrlMqtt(),
            method  : 'GET',
            success : function(response){                
                win.setLoading(false);
                var jsonData    = Ext.JSON.decode(response.responseText);
                win.setHtml(jsonData.data.reply);
            },
            failure: function(response, opts) {
                win.setLoading(false);
                var reply       = "<h1>"+response.status+" Error Code</h1>";
                var jsonData    = Ext.JSON.decode(response.responseText);
                reply = reply+'<p><b>'+jsonData.message+'</b></p>';
                win.setHtml(reply);
            }
        });             
    }  
});

Ext.define('Rd.view.dynamicClients.vcDynamicClients', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcDynamicClients',
    config: {
        UrlTestMikrotik  : '/cake4/rd_cake/dynamic-clients/test-mikrotik.json',	        
    },
    init    : function() {
        var me = this;
    },
    onCmbNasTypesChange : function(cmb){
        var me      = this;
        var form    = cmb.up('form');
        var cnt     = form.down('#pnlMikrotik');
        var cntPsk  = form.down('#pnlPrivatePsk');       
        if(cmb.getValue() == 'Mikrotik-API'){
            cnt.setHidden(false);
            cnt.setDisabled(false);
            cntPsk.setHidden(true);
            cntPsk.setDisabled(true); 
        }else if(cmb.getValue() == 'private_psk'){
        	cntPsk.setHidden(false);
            cntPsk.setDisabled(false); 
            cnt.setHidden(true);
            cnt.setDisabled(true);    
        }else{
        	cnt.setHidden(true);
            cnt.setDisabled(true);
            cntPsk.setHidden(true);
            cntPsk.setDisabled(true);  
        }
    },
    onMikrotikTestClick : function(btn){
        var me      = this;
        var form    = btn.up('form');
        var id      = form.down('#txtId').getValue();

        btn.disable();
        
        Ext.Ajax.request({
            url     : me.getUrlTestMikrotik(),
            params  : {'id':id},
            method  : 'GET',
            success : function (response) {
                var jsonData = Ext.JSON.decode(response.responseText);
                if (jsonData.success) {
                    me.getView().down('#pnlMtReply').setData(jsonData.data);
                    me.getView().down('#pnlMtReply').show();
                }
                btn.enable();
            },
            failure: function (response, options) {
                var jsonData = Ext.JSON.decode(response.responseText);
                Ext.Msg.show({
                    title       : "Error",
                    msg         : response.request.url + '<br>' + response.status + ' ' + response.statusText+"<br>"+jsonData.message,
                    modal       : true,
                    buttons     : Ext.Msg.OK,
                    icon        : Ext.Msg.ERROR,
                    closeAction : 'destroy'
                });
                me.getView().down('#pnlMtReply').hide();
                btn.enable();
            },
            scope: me
        });
    }
});

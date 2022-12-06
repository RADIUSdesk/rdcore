Ext.define('Rd.view.nas.vcNas', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcNas',
    config: {
        UrlTestMikrotik  : '/cake4/rd_cake/nas/test-mikrotik.json',	        
    },
    init    : function() {
        var me = this;
    },
    onCmbNasTypesChange : function(cmb){
        var me      = this;
        var form    = cmb.up('form');
        var cnt     = form.down('#pnlMikrotik');  
        if(cmb.getValue() == 'Mikrotik-API'){
            cnt.setHidden(false);
            cnt.setDisabled(false); 
        }else{
            cnt.setHidden(true);
            cnt.setDisabled(true);    
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
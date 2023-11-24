Ext.define('Rd.view.aps.vcApEntryOverride', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcApEntryOverride',
    config : {
        UrlApStaticOverrides        : '/cake4/rd_cake/ap-profiles/ap-static-entry-overrides-view.json'
    },
    init: function() {
        var me = this;
    },
    control: {
        '#chkOverride' : {
            change:  'chkOverrideChange'
        }
    },
    chkOverrideChange : function(chk){
        var me = this;
        if(chk.getValue()){
            me.getView().down('#txtSsid').show();
            me.getView().down('#txtSsid').enable();
            if(me.getView().info.show_key){
                me.getView().down('#txtKey').show();
                me.getView().down('#txtKey').enable();
            }            
            if(me.getView().info.show_vlan){
                me.getView().down('#txtVlan').show();
                me.getView().down('#txtVlan').enable();
            }
                 
        }else{
            me.getView().down('#txtSsid').hide();
            me.getView().down('#txtSsid').disable();
            me.getView().down('#txtKey').hide();
            me.getView().down('#txtKey').disable();
            me.getView().down('#txtVlan').hide();
            me.getView().down('#txtVlan').disable();
        }    
    }
});

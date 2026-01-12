Ext.define('Rd.view.aps.vcApVpnEntry', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcApVpnEntry',
    config : {
        UrlApStaticOverrides        : '/cake4/rd_cake/ap-profiles/ap-static-entry-overrides-view.json'
    },
    init: function() {
        var me = this;
    },
    control: {
        '#btnDelete' : {
            click:  'btnDeleteClick'
        },
        'cntApVpnEntry #cmbVpnType' : {
            change  : 'onCmbVpnTypeChange'
        },
        'cntApVpnEntry #cmbTlsType' : {
            change  : 'onCmbTlsTypeChange'
        }
    },
    btnDeleteClick : function(){
        var me = this;
        me.getView().destroy();   
    },
    onCmbVpnTypeChange : function(combo){
        var me = this;
        var val = combo.getValue();
        if(val === 'ipsec'){
            me.getView().down('#cntIpsec').show();
            me.getView().down('#cntIpsec').enable();
            me.getView().down('#cntOvpn').hide();
            me.getView().down('#cntOvpn').disable();
            me.getView().down('#cntWg').hide();
            me.getView().down('#cntWg').disable();
            me.getView().down('#cntZt').hide();
            me.getView().down('#cntZt').disable();         
        }
        
        
        if(val === 'wg'){
            me.getView().down('#cntIpsec').hide();
            me.getView().down('#cntIpsec').disable();
            me.getView().down('#cntWg').show();
            me.getView().down('#cntWg').enable();
            me.getView().down('#cntOvpn').hide();
            me.getView().down('#cntOvpn').disable();
            me.getView().down('#cntZt').hide();
            me.getView().down('#cntZt').disable();
        }
        
        if(val === 'ovpn'){
            me.getView().down('#cntIpsec').hide();
            me.getView().down('#cntIpsec').disable();
            me.getView().down('#cntOvpn').show();
            me.getView().down('#cntOvpn').enable();
            me.getView().down('#cntWg').hide();
            me.getView().down('#cntWg').disable();
            me.getView().down('#cntZt').hide();
            me.getView().down('#cntZt').disable();
        } 
        
        if(val === 'zt'){
            me.getView().down('#cntIpsec').hide();
            me.getView().down('#cntIpsec').disable();
            me.getView().down('#cntOvpn').hide();
            me.getView().down('#cntOvpn').disable();
            me.getView().down('#cntWg').hide();
            me.getView().down('#cntWg').disable();
            me.getView().down('#cntZt').show();
            me.getView().down('#cntZt').enable();
        } 
           
    },
    onCmbTlsTypeChange : function(combo){
        var me = this;
        var val = combo.getValue();
        if(val === 'none'){
            me.getView().down('#txtTlsKey').hide();
            me.getView().down('#txtTlsKey').disable();
        }else{      
            me.getView().down('#txtTlsKey').show();
            me.getView().down('#txtTlsKey').enable();
        }    
    }
   
});

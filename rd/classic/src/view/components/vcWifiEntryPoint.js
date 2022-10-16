Ext.define('Rd.view.components.vcWifiEntryPoint', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcWifiEntryPoint',
    control: {
        'cmbEncryptionOptions': {
            change: 'cmbEncryptionChange'
        },
        '#chk_auto_nasid': {
            change: 'chkAutoNasidChange'
        },
        '#chk_maxassoc': {
            change: 'chkMaxassocChange'
        },
        'cmbMacFilter': {
            change: 'cmbMacFilterChange'
        }
    },
    init    : function() {
        var me = this;
    },
    cmbEncryptionChange: function(cmb){
        var me      = this;
        var form    = cmb.up('form');
        var key     = form.down('#key');
        var srv     = form.down('#auth_server');
        var scrt    = form.down('#auth_secret'); 
        var nasid   = form.down('#nasid');
        var acct    = form.down('#chk_accounting');
        var auto    = form.down('#chk_auto_nasid');
        var d_vlan  = form.down('#default_vlan');
        var d_key   = form.down('#default_key');

        var val     = cmb.getValue();
        if(val == 'none'){
            key.setVisible(false);
            key.setDisabled(true); 
            srv.setVisible(false);
            srv.setDisabled(true);
            scrt.setVisible(false);
            scrt.setDisabled(true);
            nasid.setVisible(false);
            nasid.setDisabled(true); 
            acct.setVisible(false);
            acct.setDisabled(true);  
            auto.setVisible(false);
            auto.setDisabled(true);

            d_vlan.setHidden(true);
            d_vlan.setDisabled(true);
            d_key.setHidden(true);
            d_key.setDisabled(true); 
        }

        if((val == 'wep')|(val == 'psk')|(val =='psk2')){
            key.setVisible(true);
            key.setDisabled(false); 
            srv.setVisible(false);
            srv.setDisabled(true);
            scrt.setVisible(false);
            scrt.setDisabled(true);
            nasid.setVisible(false);
            nasid.setDisabled(true); 
            acct.setVisible(false);
            acct.setDisabled(true);  
            auto.setVisible(false);
            auto.setDisabled(true);

            d_vlan.setHidden(true);
            d_vlan.setDisabled(true);
            d_key.setHidden(true);
            d_key.setDisabled(true); 
   
        }

        if((val == 'wpa')|(val == 'wpa2')){
            key.setVisible(false);
            key.setDisabled(true); 
            srv.setVisible(true);
            srv.setDisabled(false);
            scrt.setVisible(true);
            scrt.setDisabled(false);
            acct.setVisible(true);
            acct.setDisabled(false);  
            auto.setVisible(true);
            auto.setDisabled(false); 
            if(auto.getValue()){
                nasid.setVisible(false);
                nasid.setDisabled(true);  
            }else{
                nasid.setVisible(true);
                nasid.setDisabled(false);  
            }

            d_vlan.setHidden(true);
            d_vlan.setDisabled(true);
            d_key.setHidden(true);
            d_key.setDisabled(true); 
    
        }

        if(val == 'ppsk'){
            key.setVisible(false);
            key.setDisabled(true); 
            srv.setVisible(true);
            srv.setDisabled(false);
            scrt.setVisible(true);
            scrt.setDisabled(false);
            acct.setVisible(true);
            acct.setDisabled(false);  
            auto.setVisible(true);
            auto.setDisabled(false); 
            if(auto.getValue()){
                nasid.setVisible(false);
                nasid.setDisabled(true);  
            }else{
                nasid.setVisible(true);
                nasid.setDisabled(false);  
            }

            d_vlan.setHidden(false);
            d_vlan.setDisabled(false);
            d_key.setHidden(false);
            d_key.setDisabled(false);   
        }

    },
    chkMaxassocChange: function(chk){
        var me      = this;
        var form    = chk.up('form');
        var num     = form.down('#maxassoc');    
        var val     = chk.getValue();
        if(val){
            num.setVisible(true);
            num.setDisabled(false); 
        }else{
            num.setVisible(false);
            num.setDisabled(true);
        }
    },
    cmbMacFilterChange:function(cmb){
        var me      = this;
        var form    = cmb.up('form');
        var pu      = form.down('cmbPermanentUser');
        var val     = cmb.getValue();
        
        if(val == 'disable'){
            pu.setVisible(false);
            pu.setDisabled(true); 
        }else{
            pu.setVisible(true);
            pu.setDisabled(false); 
        }
    },
    chkAutoNasidChange: function(chk){
        var me      = this;
        var form    = chk.up('form');
        var nasid   = form.down('#nasid');
        var acct    = form.down('#chk_accounting');
        var enc     =  form.down('cmbEncryptionOptions').getValue();
        if((enc == 'wpa')|(enc == 'wpa2')){
            if(acct){
                if(chk.getValue()){
                    nasid.setVisible(false);
                    nasid.setDisabled(true);  
                }else{
                    nasid.setVisible(true);
                    nasid.setDisabled(false);
                }  
            }
        }else{
            nasid.setVisible(false);
            nasid.setDisabled(true);
        }
    }   
});

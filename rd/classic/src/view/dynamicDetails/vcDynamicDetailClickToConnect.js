Ext.define('Rd.view.dynamicDetails.vcDynamicDetailClickToConnect', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcDynamicDetailClickToConnect',
    control: {
        '#chkClickToConnect' : {
            change: 'chkClickToConnectChange'
        },
        '#chkCtcRequireEmail' : {
            change:  'chkCtcRequireEmailChange'
        },
        '#chkCtcRequirePhone' : {
            change:  'chkCtcRequirePhoneChange'
        },
        '#chkCtcRequireDn' : {
            change:  'chkCtcRequireDnChange'
        },
        '#chkCtcEmailOptIn' : {
            change:  'chkCtcEmailOptInChange'    
        },
        '#chkCtcPhoneOptIn' : {
            change:  'chkCtcPhoneOptInChange'    
        }
    },
    chkClickToConnectChange: function(chk){
        var me      = this;
        var form    = chk.up('form');
        var un      = form.down('#txtConnectUsername');
        var sx      = form.down('#txtConnectSuffix');
        var cd      = form.down('#nrConnectDelay');
        var co      = form.down('#chkConnectOnly');
        var re      = form.down('#chkCtcRequireEmail');
        var rs      = form.down('#cmbReSupply');
        var opt_in  = form.down('#chkCtcEmailOptIn');
        var txt     = form.down('#txt_email_opt_in');
        
        var rp      = form.down('#chkCtcRequirePhone');
        var rsp     = form.down('#cmbReSupplyPhone');
        var opt_inp = form.down('#chkCtcPhoneOptIn');
        var txtp    = form.down('#txt_phone_opt_in');
        
        
        var rdn     = form.down('#chkCtcRequireDn');
        var rsdn    = form.down('#cmbReSupplyDn');      
        var value   = chk.getValue();
        if(value){
            un.setDisabled(false);
            sx.setDisabled(false);
            cd.setDisabled(false);
            co.setDisabled(false);
            re.setDisabled(false); 
            rp.setDisabled(false); 
            rdn.setDisabled(false);
            
            if(re.getValue()){
                rs.setDisabled(false);
                opt_in.setDisabled(false);
                if(opt_in.getValue()){
                    txt.setDisabled(false);
                }else{
                    txt.setDisabled(true);
                }
            }else{
                rs.setDisabled(true);
                opt_in.setDisabled(true);
                txt.setDisabled(true);
            }      
            
            
            
                             
        }else{
            un.setDisabled(true);
            sx.setDisabled(true);
            cd.setDisabled(true);
            co.setDisabled(true);
            re.setDisabled(true); 
            rs.setDisabled(true);
            opt_in.setDisabled(true);
            txt.setDisabled(true);
            
            rp.setDisabled(true); 
            rsp.setDisabled(true);
            opt_inp.setDisabled(true);
            txtp.setDisabled(true);
            
            rdn.setDisabled(true); 
            rsdn.setDisabled(true);    
        }
    },
    chkCtcRequireEmailChange: function(chk){
        var me      = this;
        var form    = chk.up('form');
        var value   = chk.getValue();
        var rs      = form.down('#cmbReSupply');
        var opt_in  = form.down('#chkCtcEmailOptIn');
        var txt     = form.down('#txt_email_opt_in');
        if(value){
            rs.setDisabled(false);
            opt_in.setDisabled(false);
            if(opt_in.getValue()){
                txt.setDisabled(false);
            }else{
                txt.setDisabled(true);
            }
        }else{
            rs.setDisabled(true);
            opt_in.setDisabled(true);
            txt.setDisabled(true);
        }       
    },
    chkCtcRequirePhoneChange: function(chk){
        var me      = this;
        var form    = chk.up('form');
        var value   = chk.getValue();
        var rs      = form.down('#cmbReSupplyPhone');
        var opt_in  = form.down('#chkCtcPhoneOptIn');
        var txt     = form.down('#txt_phone_opt_in');
        if(value){
            rs.setDisabled(false);
            opt_in.setDisabled(false);
            if(opt_in.getValue()){
                txt.setDisabled(false);
            }else{
                txt.setDisabled(true);
            }
        }else{
            rs.setDisabled(true);
            opt_in.setDisabled(true);
            txt.setDisabled(true);
        }      
    },
    chkCtcRequireDnChange: function(chk){
        var me      = this;
        var form    = chk.up('form');
        var value   = chk.getValue();
        var rs      = form.down('#cmbReSupplyDn');
        if(value){
            rs.setDisabled(false);
        }else{
            rs.setDisabled(true);
        }       
    },
    chkCtcEmailOptInChange: function(chk){
        var me      = this;
        var form    = chk.up('form');
        var value   = chk.getValue();
        var txt     = form.down('#txt_email_opt_in');
        if(value){
            txt.setDisabled(false);
        }else{
            txt.setDisabled(true);
        }
    },
    chkCtcPhoneOptInChange: function(chk){
        var me      = this;
        var form    = chk.up('form');
        var value   = chk.getValue();
        var txt     = form.down('#txt_phone_opt_in');
        if(value){
            txt.setDisabled(false);
        }else{
            txt.setDisabled(true);
        }
    }
});

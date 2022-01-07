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
        var rp      = form.down('#chkCtcRequirePhone');
        var rsp     = form.down('#cmbReSupplyPhone');
        var rdn     = form.down('#chkCtcRequireDn');
        var rsdn    = form.down('#cmbReSupplyDn');      
        var value   = chk.getValue();
        if(value){
            un.setDisabled(false);
            sx.setDisabled(false);
            cd.setDisabled(false);
            co.setDisabled(false);
            re.setDisabled(false); 
            rs.setDisabled(false);
            rp.setDisabled(false); 
            rsp.setDisabled(false);
            rdn.setDisabled(false); 
            rsdn.setDisabled(false);                   
        }else{
            un.setDisabled(true);
            sx.setDisabled(true);
            cd.setDisabled(true);
            co.setDisabled(true);
            re.setDisabled(true); 
            rs.setDisabled(true);
            rp.setDisabled(true); 
            rsp.setDisabled(true);
            rdn.setDisabled(true); 
            rsdn.setDisabled(true);    
        }
    },
    chkCtcRequireEmailChange: function(chk){
        var me      = this;
        var form    = chk.up('form');
        var value   = chk.getValue();
        var rs      = form.down('#cmbReSupply');
        if(value){
            rs.setDisabled(false);
        }else{
            rs.setDisabled(true);
        }       
    },
    chkCtcRequirePhoneChange: function(chk){
        var me      = this;
        var form    = chk.up('form');
        var value   = chk.getValue();
        var rs      = form.down('#cmbReSupplyPhone');
        if(value){
            rs.setDisabled(false);
        }else{
            rs.setDisabled(true);
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
    }
});

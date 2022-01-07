Ext.define('Rd.view.dynamicDetails.vcDynamicDetailSettings', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcDynamicDetailSettings',
    init: function() {
    
    },  
    onCmbThemesChange: function(cmb){
        var me       = this;
        me.theme     = cmb.getValue();
        console.log("The Theme is now "+me.theme);
        var pnl = cmb.up('panel');
        if(me.theme == 'Custom'){
        
            pnl.down('#txtCoovaDesktopUrl').setDisabled(false);
            pnl.down('#txtCoovaDesktopUrl').setHidden(false);
            
            pnl.down('#txtCoovaMobileUrl').setDisabled(false);
            pnl.down('#txtCoovaMobileUrl').setHidden(false);
            
            pnl.down('#txtMikrotikDesktopUrl').setDisabled(false);
            pnl.down('#txtMikrotikDesktopUrl').setHidden(false);
            
            pnl.down('#txtMikrotikMobileUrl').setDisabled(false);
            pnl.down('#txtMikrotikMobileUrl').setHidden(false);            
        }else{
            pnl.down('#txtCoovaDesktopUrl').setDisabled(true);
            pnl.down('#txtCoovaDesktopUrl').setHidden(true);
            
            pnl.down('#txtCoovaMobileUrl').setDisabled(true);
            pnl.down('#txtCoovaMobileUrl').setHidden(true);
            
            pnl.down('#txtMikrotikDesktopUrl').setDisabled(true);
            pnl.down('#txtMikrotikDesktopUrl').setHidden(true);
            
            pnl.down('#txtMikrotikMobileUrl').setDisabled(true);
            pnl.down('#txtMikrotikMobileUrl').setHidden(true);            
        }
    },
    onChkRegisterUsersChange: function(chk){
         var me     = this;
         var pnl    = chk.up('panel');
         if(chk.getValue()){     
            pnl.down('cmbRealm').setDisabled(false);
            pnl.down('cmbProfile').setDisabled(false);
            pnl.down('#chkRegMacCheck').setDisabled(false);
            pnl.down('#chkRegAutoAdd').setDisabled(false);
            pnl.down('#chkRegEmail').setDisabled(false);
         }else{
            pnl.down('cmbRealm').setDisabled(true);
            pnl.down('cmbProfile').setDisabled(true);
            pnl.down('#chkRegMacCheck').setDisabled(true);
            pnl.down('#chkRegAutoAdd').setDisabled(true);
            pnl.down('#chkRegEmail').setDisabled(true);
         }  
    },
    onChkRegAutoSuffixChange: function(chk){
        var me  = this;
        var pnl = chk.up('panel');
        if(chk.getValue()){
             pnl.down('#txtRegSuffix').setDisabled(false);
        }else{
             pnl.down('#txtRegSuffix').setDisabled(true);
        }
    },
    chkSlideshowChange: function(chk){
        var me      = this;
        var form    = chk.up('form');
        var nr      = form.down('#nrEnforceInSeconds');
        var chkEnforce = form.down('#chkSlideshowEnforce');
        var value   = chk.getValue();
        if(value){
            chkEnforce.setDisabled(false);
            if(chkEnforce.getValue()){ 
                nr.setDisabled(false);
            }else{
                nr.setDisabled(true);
            }             
        }else{
            nr.setDisabled(true);
            chkEnforce.setDisabled(true);
        }
    },
    chkEnforceChange: function(chk){
        var me      = this;
        var form    = chk.up('form');
        var nr      = form.down('#nrEnforceInSeconds');
        var value   = chk.getValue();
        if(value){   
            nr.setDisabled(false);          
        }else{
            nr.setDisabled(true);
        }
    },
    chkRedirectChange: function(chk){
        var me          = this;
        var form        = chk.up('form');
        var disabled    = true;
        if(chk.getValue()){   
            disabled = false;       
        }    
        form.down('#txtRedirectUrl').setDisabled(disabled);
        form.down('#txtRedirectUrl').setHidden(disabled);
    },
    chkUsageChange: function(chk){
        var me          = this;
        var form        = chk.up('form');
        var disabled    = true;
        if(chk.getValue()){   
            disabled = false;       
        }    
        form.down('#nrUsageRefresh').setDisabled(disabled);
        form.down('#nrUsageRefresh').setHidden(disabled);
    },
    chkShowNameChange: function(chk){
        var me          = this;
        var form        = chk.up('form');
        var disabled    = true;
        if(chk.getValue()){   
            disabled = false;       
        }    
        form.down('#clrNameColour').setDisabled(disabled);    
    }
});

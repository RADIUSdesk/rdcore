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
        },
        '#chk_schedule' : {
        	change: 'chkScheduleChange'
        },
        '#chkHotspot2' : {
        	change: 'chkHotspot2Change'
        },
        '#chkFastRoaming' : {
        	change: 'chkFastRoamingChange'
        },
        '#chkFtNasid' : {
        	change: 'chkFtNasidChange'
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
        var realm   = form.down('#cmbRealm');
        var hs2		= form.down('#chkHotspot2');
        
        var	chkFr	= form.down('#chkFastRoaming');
        var	pnlFr	= form.down('#pnlFastRoaming');
        var	chkFrNid= form.down('#chkFtNasid');
        var	txtFrNid= form.down('#txtFtNasid');
        var ppsk_groups = form.down('cmbPpskGroups');

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

            chkFr.hide();
            chkFr.disable();
            pnlFr.hide();
            pnlFr.disable();   
            
        }
        
        //Fast Roaming
        if((val == 'wpa')|(val == 'wpa2')|(val == 'ppsk')|(val == 'psk')|(val =='psk2')|(val == 'ppsk_no_radius')){        
        	if(chkFr.getValue()){
        		pnlFr.show();
            	pnlFr.enable();
            }      
        	chkFr.show();
            chkFr.enable();          
            //Sub set
            if((val == 'wpa')|(val == 'wpa2')|(val == 'ppsk')){    
		    	chkFrNid.hide();
		    	chkFrNid.disable();
		    	txtFrNid.hide();
		    	txtFrNid.disable();		    	             
		    }else{
		    	chkFrNid.show();
		    	chkFrNid.enable();
		    	if(chkFrNid.getValue()){
		    		txtFrNid.hide();
		    		txtFrNid.disable();
		    	}else{
		    		txtFrNid.show();
		    		txtFrNid.enable();
		    	}	
		    }                                      
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
        }
        
        if(val == 'wpa2'){
        	hs2.show();
        	hs2.enable();
        }else{
        	hs2.hide();
        	hs2.disable();
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
            
            realm.setHidden(false);
            realm.setDisabled(false);    
        }else{
            //These items are only for ppsk (with RADIUS)
            realm.setHidden(true);
            realm.setDisabled(true); 
            d_vlan.setHidden(true);
            d_vlan.setDisabled(true);
            d_key.setHidden(true);
            d_key.setDisabled(true);      
        }
        
        if(val == 'ppsk_no_radius'){ 
            //Show these          
            ppsk_groups.setHidden(false);
            ppsk_groups.setDisabled(false);
            
            //Hide these
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
                
        }else{
            //These items are only for ppsk-no-radius
            ppsk_groups.setHidden(true);
            ppsk_groups.setDisabled(true);                        
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
        if((enc == 'wpa')|(enc == 'wpa2')|(enc == 'ppsk')){
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
    },
    chkScheduleChange: function(chk){
   		this.getView().down('gridSchedule').setDisabled(!chk.getValue());
    },
    chkHotspot2Change: function(chk){
    	var me 		= this;
    	var form	= chk.up('form');
    	var val     = chk.getValue();
    	if(val){
    	    form.down('#cmbPasspointProfile').show();
    	    form.down('#cmbPasspointProfile').enable();
    	}else{
    	    form.down('#cmbPasspointProfile').hide();
    	    form.down('#cmbPasspointProfile').disable();
    	}
    },
    chkFastRoamingChange : function(chk){
    	var me 		= this;
    	var form	= chk.up('form');
    	var	pnlFr	= form.down('#pnlFastRoaming');    	
    	if(chk.getValue()){
    		pnlFr.show();
        	pnlFr.enable();
        }else{      
        	pnlFr.hide();
        	pnlFr.disable();
      	}    
    },
    chkFtNasidChange : function(chk){
    	var me 		= this;
    	var form	= chk.up('form');
    	var	txtFrNid= form.down('#txtFtNasid');
    	if(chk.getValue()){
    		txtFrNid.hide();
    		txtFrNid.disable();  	
    	}else{   	
    		txtFrNid.show();
    		txtFrNid.enable();   	
    	}  
    } 
});

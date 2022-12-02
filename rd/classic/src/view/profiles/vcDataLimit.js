Ext.define('Rd.view.profiles.vcDataLimit', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcDataLimit',
    init    : function() {
        var me = this;
    },
    sldrToggleChange: function(sldr){
		var me 		    = this;
		var pnl    	    = sldr.up('panel');
		var cnt         = pnl.down('#cntDetail');
		var main        = sldr.up('pnlAddEditProfile')
		var dataLimit   = main.down('#pnlAdvDataLimit');
		
        var value       = sldr.getValue();     
		if(value == 0){
		    cnt.hide();     
		}else{
		    cnt.show();
		    adv_state = dataLimit.down('#adv_data_limit_enabled');
		    if(adv_state.getValue() == true){
		        adv_state.setValue(0,0); //Disable the advanced Data limit
		        Ext.ux.Toaster.msg(
                    'DISABLING ADVANCED DATA LIMIT',
                    'DISABLING ADVANCED DATA LIMIT',
                    Ext.ux.Constants.clsWarn,
                    Ext.ux.Constants.msgWarn
                );
		    }
		}
	},
	rgrpDataResetChange: function(rgrp,valObj){
		var me 		    = this;
		var pnl    	    = rgrp.up('panel');
		if(valObj.data_reset == 'top_up'){	
		    pnl.down('#pnlDataTopUp').show();
		    pnl.down('#rgrpDataCap').hide();
		    pnl.down('rdSliderData').hide();
		    pnl.down('#chkDataMac').hide();
		}else{
		    pnl.down('#pnlDataTopUp').hide(); 
		    pnl.down('#rgrpDataCap').show();
		    pnl.down('rdSliderData').show();
		    pnl.down('#chkDataMac').show();		
		}
	}
});

Ext.define('Rd.view.profiles.vcTimeLimit', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcTimeLimit',
    init    : function() {
        var me = this;
    },
    sldrToggleChange: function(sldr){
		var me 		    = this;
		var pnl    	    = sldr.up('panel');
		var cnt         = pnl.down('#cntDetail');
	    var main        = sldr.up('pnlAddEditProfile')
		var timeLimit   = main.down('#pnlAdvTimeLimit');	
        var value       = sldr.getValue();     
		if(value == 0){
		    cnt.hide();
		}else{
		    cnt.show();
		    adv_state = timeLimit.down('#adv_time_limit_enabled');
		    if(adv_state.getValue() == true){
		        adv_state.setValue(0,0); //Disable the advanced Data limit
		        Ext.ux.Toaster.msg(
                    'DISABLING ADVANCED TIME LIMIT',
                    'DISABLING ADVANCED TIME LIMIT',
                    Ext.ux.Constants.clsWarn,
                    Ext.ux.Constants.msgWarn
                );
		    }
		}
	},
    rgrpTimeResetChange: function(rgrp,valObj){
		var me 		    = this;
		var pnl    	    = rgrp.up('panel');
		if(valObj.time_reset == 'top_up'){	
		    pnl.down('#pnlTimeTopUp').show();
		    pnl.down('#rgrpTimeUnit').hide();
		    pnl.down('#rgrpTimeCap').hide();
		    pnl.down('rdSlider').hide();
		    pnl.down('#chkTimeMac').hide();
		}else{
		    pnl.down('#pnlTimeTopUp').hide(); 
		    pnl.down('#rgrpTimeUnit').show();
		    pnl.down('#rgrpTimeCap').show();
		    pnl.down('rdSlider').show();
		    pnl.down('#chkTimeMac').show();		
		}
	}
});

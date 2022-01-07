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

		
        var value       = sldr.getValue();     
		if(value == 0){
		    cnt.hide();
      
		}else{
		    cnt.show();
		}
	},
	sldrTimeAmountChange: function(sldr){
        var me 		= this;
		var fc    	= sldr.up('container');
        fc.down('displayfield').setValue(sldr.getValue());
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

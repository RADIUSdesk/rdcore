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

		
        var value       = sldr.getValue();     
		if(value == 0){
		    cnt.hide();
      
		}else{
		    cnt.show();
		}
	},
	rgrpDataResetChange: function(rgrp,valObj){
		var me 		    = this;
		var pnl    	    = rgrp.up('panel');
		if(valObj.data_reset == 'top_up'){	
		    pnl.down('#pnlDataTopUp').show();
		    pnl.down('#rgrpDataUnit').hide();
		    pnl.down('#rgrpDataCap').hide();
		    pnl.down('rdSlider').hide();
		    pnl.down('#chkDataMac').hide();
		}else{
		    pnl.down('#pnlDataTopUp').hide(); 
		    pnl.down('#rgrpDataUnit').show();
		    pnl.down('#rgrpDataCap').show();
		    pnl.down('rdSlider').show();
		    pnl.down('#chkDataMac').show();		
		}
	}
});

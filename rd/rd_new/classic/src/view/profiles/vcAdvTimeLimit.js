Ext.define('Rd.view.profiles.vcAdvTimeLimit', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcAdvTimeLimit',
    init    : function() {
        var me = this;
    },
    control: {
        '#pnlAdvTimeLimit #sldrTimePerDay numberfield'    : {
            change   : 'perDayChange'
        },
        '#pnlAdvTimeLimit #sldrTimePerMonth numberfield'    : {
            change   : 'perMonthChange'
        }
    },
    sldrToggleChange: function(sldr){
		var me 		    = this;
		var pnl    	    = sldr.up('panel');
		var cnt         = pnl.down('#cntDetail');
        var main        = sldr.up('pnlAddEditProfile')
		var timeLimit   = main.down('#pnlTimeLimit');	
        var value       = sldr.getValue();     
		if(value == 0){
		    cnt.hide();
		}else{
		    cnt.show();
		    plain_state = timeLimit.down('#time_limit_enabled');
		    if(plain_state.getValue() == true){
		        plain_state.setValue(0,0); //Disable the plain Time limit
		        Ext.ux.Toaster.msg(
                    'DISABLING BASIC TIME LIMIT',
                    'DISABLING BASIC TIME LIMIT',
                    Ext.ux.Constants.clsWarn,
                    Ext.ux.Constants.msgWarn
                );
		    }
		}
	},
	perDayChange: function(nmbr){
	    var me      = this;
	    //Total per day has to be AT LEAST total per month
	    var month = nmbr.up('#cntDetail').down('#sldrTimePerMonth').down('numberfield')
	    if(month.getValue() < nmbr.getValue()){
	        month.setValue(nmbr.getValue());
	    }	
	},
	perMonthChange: function(nmbr){
	    var me      = this;
	    //Total per month must not be LESS than total per day
	    var day = nmbr.up('#cntDetail').down('#sldrTimePerDay').down('numberfield')
	    if(day.getValue() > nmbr.getValue()){
	        day.setValue(nmbr.getValue());
	    }	
	}
});

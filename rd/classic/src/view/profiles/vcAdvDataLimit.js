Ext.define('Rd.view.profiles.vcAdvDataLimit', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcAdvDataLimit',
    init    : function() {
        var me = this;
    },
    control: {
        '#pnlAdvDataLimit #sldrDataPerDay numberfield'    : {
            change   : 'perDayChange'
        },
        '#pnlAdvDataLimit #sldrDataPerMonth numberfield'    : {
            change   : 'perMonthChange'
        }
    },
    sldrToggleChange: function(sldr){
		var me 		    = this;
		var pnl    	    = sldr.up('panel');
		var cnt         = pnl.down('#cntDetail');
		var main        = sldr.up('pnlAddEditProfile')
		var dataLimit   = main.down('#pnlDataLimit');	
        var value       = sldr.getValue();     
		if(value == 0){
		    cnt.hide(); 
		}else{
		    cnt.show();
		    plain_state = dataLimit.down('#data_limit_enabled');
		    if(plain_state.getValue() == true){
		        plain_state.setValue(0,0); //Disable the palin Data limit
		        Ext.ux.Toaster.msg(
                    'DISABLING BASIC DATA LIMIT',
                    'DISABLING BASIC DATA LIMIT',
                    Ext.ux.Constants.clsWarn,
                    Ext.ux.Constants.msgWarn
                );
		    }
		}
	},
	perDayChange: function(nmbr){
	    var me      = this;
	    //Total per day has to be AT LEAST total per month
	    var month = nmbr.up('#cntDetail').down('#sldrDataPerMonth').down('numberfield')
	    if(month.getValue() < nmbr.getValue()){
	        month.setValue(nmbr.getValue());
	    }	
	},
	perMonthChange: function(nmbr){
	    var me      = this;
	    //Total per month must not be LESS than total per day
	    var day = nmbr.up('#cntDetail').down('#sldrDataPerDay').down('numberfield')
	    if(day.getValue() > nmbr.getValue()){
	        day.setValue(nmbr.getValue());
	    }	
	}
});

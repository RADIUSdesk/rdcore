Ext.define('Rd.view.realms.vcRealmVlanAdd', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcRealmVlanAdd',
    init    : function() {
    
    },
    control: {
        'winRealmVlanAdd #rgrpAction': {
            change   : 'rgrpActionChange'
        }
    },
    rgrpActionChange : function(rgrp,valObj){
		var me 		    = this;
		var pnl    	    = rgrp.up('form');
		if(valObj.action == 'range'){	
		    pnl.down('#nrRangeStart').show();
		    pnl.down('#nrRangeEnd').show();
		    pnl.down('#nrRangeStart').enable();
		    pnl.down('#nrRangeEnd').enable();
		    
		    pnl.down('#nrVlan').hide();
		    pnl.down('#nrVlan').disable();
		    pnl.down('#txtName').hide();	
		    pnl.down('#txtName').disable();
		    pnl.down('#txtComment').hide();	
		    pnl.down('#txtComment').disable();

		}else{
		    pnl.down('#nrRangeStart').hide();
		    pnl.down('#nrRangeEnd').hide(); 
		    pnl.down('#nrRangeStart').disable();
		    pnl.down('#nrRangeEnd').disable();
		    
		    pnl.down('#nrVlan').show();	
		    pnl.down('#nrVlan').enable();
		    pnl.down('#txtName').show();	
		    pnl.down('#txtName').enable();	
		    pnl.down('#txtComment').show();	
		    pnl.down('#txtComment').enable();
		}
	}
});

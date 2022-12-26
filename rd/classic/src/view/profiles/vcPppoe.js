Ext.define('Rd.view.profiles.vcPppoe', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcPppoe',
    init    : function() {
        var me = this;
    },
    sldrToggleChange: function(sldr){
		var me 		    = this;
		var pnl    	    = sldr.up('panel');
		var cnt         = pnl.down('#cntDetail');
        var pnlSettings = sldr.up('#pnlFupSettings');
        var components  = pnlSettings.down('#pnlFupComponents'); 

        var value       = sldr.getValue();     
		if(value == 0){
		    cnt.hide();
            components.disable();
		}else{
		    cnt.show();
            components.enable();
		}
	}
});

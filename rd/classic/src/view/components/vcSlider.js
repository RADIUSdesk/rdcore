Ext.define('Rd.view.components.vcSlider', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcSlider',
    init    : function() {
        var me = this;
    },
	sldrAmountChange: function(sldr){
        var me 		= this;
		var fc    	= sldr.up('container');
		if(sldr.getValue() == 0){
		    fc.down('textfield').disable();
		    if(fc.down('combobox')){  
		        fc.down('combobox').disable();
		    }
		}else{
		    fc.down('textfield').enable();
		    if(fc.down('combobox')){
		        fc.down('combobox').enable();
		    }
		}
        fc.down('textfield').setValue(sldr.getValue());
    },
    nrAmountChange: function(nr){
        var me 		= this;
		var fc  	= nr.up('container');
        fc.down('sliderfield').setValue(nr.getValue());
    }
});

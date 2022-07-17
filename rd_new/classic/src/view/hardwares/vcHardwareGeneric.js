Ext.define('Rd.view.hardwares.vcHardwareGeneric', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcHardwareGeneric',
    config : {
        urlAdvancedSettingsForModel : '/cake3/rd_cake/ap-profiles/advanced_settings_for_model.json',
        urlViewAp                   : '/cake3/rd_cake/ap-profiles/ap_profile_ap_view.json'
    },
    init: function() {
        var me = this;
    },  
    sldrRadioCountChange: function(sldr){
        var me 		= this;
        var form    = sldr.up('form');
		var fc    	= sldr.up('container');
        fc.down('displayfield').setValue(sldr.getValue());
        
        if(sldr.getValue()== 0){     
             form.down('#pnlRadioR0').hide();
             form.down('#pnlRadioR0').setDisabled(true);
             form.down('#pnlRadioR1').hide();
             form.down('#pnlRadioR1').setDisabled(true);
             form.down('#pnlRadioR2').hide();
             form.down('#pnlRadioR2').setDisabled(true);    
        }
        
        if(sldr.getValue()== 1){
            form.down('#pnlRadioR0').show();
            form.down('#pnlRadioR0').setDisabled(false);      
            form.down('#pnlRadioR1').hide();
            form.down('#pnlRadioR1').setDisabled(true);
            form.down('#pnlRadioR2').hide();
            form.down('#pnlRadioR2').setDisabled(true);     
        }
        
        if(sldr.getValue()== 2){
            form.down('#pnlRadioR0').show();
            form.down('#pnlRadioR0').setDisabled(false); 
            form.down('#pnlRadioR1').show();
            form.down('#pnlRadioR1').setDisabled(false); 
            form.down('#pnlRadioR2').hide();
            form.down('#pnlRadioR2').setDisabled(true); 
        }
        
        if(sldr.getValue()== 3){
            form.down('#pnlRadioR0').show();
            form.down('#pnlRadioR0').setDisabled(false);
            form.down('#pnlRadioR1').show();
            form.down('#pnlRadioR1').setDisabled(false);
            form.down('#pnlRadioR2').show();
            form.down('#pnlRadioR2').setDisabled(false);
        }      
    },
    sldrToggleChange: function(sldr){
	    	
	},
	loadSettings: function(panel){ 
	    var me = this;
        var w  = me.getView();   
	    w.loadRecord(w.record);
        var i;
        var n = w.record.get('radio_count');
        for (i = 0; i < n; i++) {
            var radio_nr = i;
            if(w.record.get('radio_'+i+'_disabled')){
	            w.down('#radio_'+i+'_enabled').setValue(0,0);
	        }else{
	            w.down('#radio_'+i+'_enabled').setValue(1,1);
	        }
	        
	        //Default values for distance and beacon interval
	        if(w.record.get('radio_'+i+'_distance') == 0){
	             w.down('numberfield[name="radio_'+i+'_distance"]').setValue(300);
	        }
	        
	        if(w.record.get('radio_'+i+'_beacon_int') == 0){
	             w.down('numberfield[name="radio_'+i+'_beacon_int"]').setValue(100);
	        }
        }    
	}
});

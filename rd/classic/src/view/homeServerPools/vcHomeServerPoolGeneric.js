Ext.define('Rd.view.homeServerPools.vcHomeServerPoolGeneric', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcHomeServerPoolGeneric',
    config : {
        urlAdvancedSettingsForModel : '/cake3/rd_cake/ap-profiles/advanced_settings_for_model.json',
        urlViewAp                   : '/cake3/rd_cake/ap-profiles/ap_profile_ap_view.json'
    },
    init: function() {
        var me = this;
    },  
    sldrHomeServerCountChange: function(sldr){
        var me 		= this;
        var form    = sldr.up('form');
		var fc    	= sldr.up('container');
        fc.down('displayfield').setValue(sldr.getValue());
        
        if(sldr.getValue()== 0){
            form.down('#pnlHomeServerH1').hide();
            form.down('#pnlHomeServerH1').setDisabled(true);      
            form.down('#pnlHomeServerH2').hide();
            form.down('#pnlHomeServerH2').setDisabled(true);
            form.down('#pnlHomeServerH3').hide();
            form.down('#pnlHomeServerH3').setDisabled(true);     
        }        
             
        if(sldr.getValue()== 1){
            form.down('#pnlHomeServerH1').show();
            form.down('#pnlHomeServerH1').setDisabled(false);      
            form.down('#pnlHomeServerH2').hide();
            form.down('#pnlHomeServerH2').setDisabled(true);
            form.down('#pnlHomeServerH3').hide();
            form.down('#pnlHomeServerH3').setDisabled(true);     
        }
        
        if(sldr.getValue()== 2){
            form.down('#pnlHomeServerH1').show();
            form.down('#pnlHomeServerH1').setDisabled(false); 
            form.down('#pnlHomeServerH2').show();
            form.down('#pnlHomeServerH2').setDisabled(false); 
            form.down('#pnlHomeServerH3').hide();
            form.down('#pnlHomeServerH3').setDisabled(true); 
        }
        
        if(sldr.getValue()== 3){
            form.down('#pnlHomeServerH1').show();
            form.down('#pnlHomeServerH1').setDisabled(false);
            form.down('#pnlHomeServerH2').show();
            form.down('#pnlHomeServerH2').setDisabled(false);
            form.down('#pnlHomeServerH3').show();
            form.down('#pnlHomeServerH3').setDisabled(false);
        }      
    },
    sldrToggleChange: function(sldr){
	    	
	},
	loadSettings: function(panel){ 
	    var me = this;
        var w  = me.getView();

         
	    w.loadRecord(w.record);
	    
	    var sldr    = panel.down('#sldrHomeServerCount');
	    var form    = sldr.up('form');
	    sldr.setValue(w.record.get('home_server_count'));  
		var fc    	= sldr.up('container'); 
	    fc.down('displayfield').setValue(sldr.getValue());
	    
	    if(sldr.getValue()== 1){
            form.down('#pnlHomeServerH1').show();
            form.down('#pnlHomeServerH1').setDisabled(false);      
            form.down('#pnlHomeServerH2').hide();
            form.down('#pnlHomeServerH2').setDisabled(true);
            form.down('#pnlHomeServerH3').hide();
            form.down('#pnlHomeServerH3').setDisabled(true);     
        }
        
	    
	    
        /*var i;
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
        }    */
	}
});

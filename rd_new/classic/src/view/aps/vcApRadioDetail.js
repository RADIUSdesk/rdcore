Ext.define('Rd.view.aps.vcApRadioDetail', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcApRadioDetail',
    init    : function() {
        var me = this;
    },
    sldrToggleChange: function(sldr){
		var me 		    = this;
		var pnl    	    = sldr.up('panel');
		var cnt         = pnl.down('#cntDetail');
		var radio_nr    = pnl.radio_nr;
		var rad_dis     = pnl.down('#radio'+radio_nr+'_disabled');
		
        var value       = sldr.getValue();     
		if(value == 0){
		    cnt.hide();
		    rad_dis.setValue(true);         
		}else{
		    cnt.show();
		    rad_dis.setValue(false);
		}
	},
	sldrPowerChange: function(sldr){
        var me 		= this;
		var fc    	= sldr.up('container');
        fc.down('displayfield').setValue(sldr.getValue());
    },
    onBandChange: function(band){
        var me      = this;   
        var pnl     = band.up('panel');//fs  
        if(band.getValue() =='2g'){
	        pnl.setUI('panel-green');
		}	
		if(band.getValue() =='5g'){
		    pnl.setUI('panel-blue');
		}	 
    },     
    onModeChange: function(mode){
        var me      = this;   
        var pnl     = mode.up('panel');//fs   
        var n_t		= pnl.down('#numRadioTwoChan');
		var n_v		= pnl.down('#numRadioFiveChan');
		var band    = pnl.down('#band');
		var title   = "2.4GHz-N";
		
	    if(band.getValue() =='2g'){
	        n_t.setVisible(true);
	        n_t.setDisabled(false);
	        n_v.setVisible(false);
	        n_v.setDisabled(true);
	    }else{
	        n_t.setVisible(false);
	        n_t.setDisabled(true);
	        n_v.setVisible(true);
	        n_v.setDisabled(false);
	    }

        pnl.down('#radio_width_80').setVisible(false);
        pnl.down('#radio_width_160').setVisible(false);
        
        if((band.getValue() == '2g')&&(mode.getValue()== 'ax')){
            title   = "2.4GHz-AX";
        }
        
        if((band.getValue() == '5g')&&(mode.getValue()== 'ac')){
            pnl.down('#radio_width_80').setVisible(true);
            title   = "5GHz-AC";
        }
        if((band.getValue() == '5g')&&(mode.getValue()== 'ax')){
            pnl.down('#radio_width_80').setVisible(true);
            pnl.down('#radio_width_160').setVisible(true);
            title   = "5GHz-AX";
        }
        
        pnl.down('#rgrpWidth').setVisible(true); //Unhide it first
        
        if(mode.getValue()== 'g'){
            pnl.down('#rgrpWidth').setVisible(false);
            title   = "2.4GHz-G (Legacy)";
        }
        
        if(mode.getValue()== 'a'){
            pnl.down('#rgrpWidth').setVisible(false);
            title   = "5GHz-A (Legacy)";
        }
        
        pnl.setTitle(title);	
    },
    OnChkIncludeBeaconIntervalChange : function(chk){
        var me = this;
        var w  = me.getView();
        var i  = w.down('#nfBeaconInterval');
        if(chk.getValue()){
            i.setVisible(true);
            i.setDisabled(false);
        }else{
            i.setVisible(false);
            i.setDisabled(true);
        }  
    },
    OnChkIncludeDistanceChange : function(chk){
        var me = this;
        var w  = me.getView();
        var i  = w.down('#nfDistance');
        if(chk.getValue()){
            i.setVisible(true);
            i.setDisabled(false);
        }else{
            i.setVisible(false);
            i.setDisabled(true);
        }  
    }    
});

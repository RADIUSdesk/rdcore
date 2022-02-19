Ext.define('Rd.view.hardwares.vcRadioDetail', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcRadioDetail',
    config : {
        urlAdvancedSettingsForModel : '/cake3/rd_cake/ap-profiles/advanced_settings_for_model.json',
        urlViewAp                   : '/cake3/rd_cake/ap-profiles/ap_profile_ap_view.json'
    },
    init: function() {
        var me = this;
    }, 
    rgrpFreqChange: function( rgrp,newValue, oldValue, eOpts){
    
        var me       = this;
        var pnl    	 = rgrp.up('panel');
        var radio_nr = pnl.radio_nr;   
        var val      = newValue['radio_'+radio_nr+'_band'];     
        if(val == '2g'){
            me.do2g();
        }       
        if(val == '5g'){
            me.do5g();

        }       
    }, 
    do2g: function(){
        var me          = this;
        var w           = me.getView();
        var val_mode    = w.down('#rgrpMode').getValue();
        var val_width   = w.down('#rgrpWidth').getValue();
        
        var radio_nr    = w.radio_nr;
        w.down('#radio_mode_ac').setVisible(false);
        w.down('#radio_mode_a').hide();
        w.down('#radio_mode_g').show();
        w.down('#radio_width_80').setVisible(false);
        w.down('#radio_width_160').setVisible(false);
        if((val_mode['radio_'+radio_nr+'_mode'] == 'ac')||(val_mode['radio_'+radio_nr+'_mode'] == 'a')){
            //2g cant do AC or a set to n
            var a   = 'radio_'+radio_nr+'_mode';
            var t   = {};
            t[a]    = 'n';
            w.down('#rgrpMode').setValue(t);
        }
        
        if((val_width['radio_'+radio_nr+'_width'] == '80')||(val_width['radio_'+radio_nr+'_width'] == '160')){
            var a   = 'radio_'+radio_nr+'_width';
            var t   = {};
            t[a]    = '20';
            w.down('#rgrpWidth').setValue(t);        
        }    
    },   
    do5g: function(){
        var me          = this;
        var w           = me.getView();
        var val         = w.down('#rgrpMode').getValue();
        var radio_nr    = w.radio_nr;
        
        if(val['radio_'+radio_nr+'_mode'] == 'g'){
            //5g cant do g set to n
            var a   = 'radio_'+radio_nr+'_mode';
            var t   = {};
            t[a]    = 'n';
            w.down('#rgrpMode').setValue(t);
        }
        
        w.down('#radio_mode_ac').setVisible(true);
        w.down('#radio_mode_a').show();
        w.down('#radio_mode_g').hide();
               
        if(val['radio_'+radio_nr+'_mode']== 'n'){
            w.down('#radio_width_80').setVisible(false);
            w.down('#radio_width_160').setVisible(false); 
        }
        if(val['radio_'+radio_nr+'_mode']== 'ac'){
            w.down('#radio_width_80').setVisible(true);
            w.down('#radio_width_160').setVisible(false); 
        } 
        if(val['radio_'+radio_nr+'_mode']== 'ax'){
            w.down('#radio_width_80').setVisible(true); 
            w.down('#radio_width_160').setVisible(true); 
        }      

    },
    
    rgrpModeChange: function( rgrp,newValue, oldValue, eOpts){
    
        var me       = this;
        var pnl    	 = rgrp.up('panel');
        var radio_nr = pnl.radio_nr;   
        var val      = newValue['radio_'+radio_nr+'_mode'];
        
        if(val == 'a'){
            me.doA();
        } 
        if(val == 'g'){
            me.doG();
        }       
        if(val == 'n'){
            me.doN();
        }       
        if(val == 'ac'){
            me.doAc();

        }
        if(val == 'ax'){
            me.doAx();
        }         
    },
    
    doG: function(){
        var me = this;
        var w  = me.getView();
        w.down('#rgrpWidth').setVisible(false);
        w.down('#rgrpWidth').setDisabled(true); 
    },
    
    doA: function(){
        var me = this;
        var w  = me.getView();
        w.down('#rgrpWidth').setVisible(false);
        w.down('#rgrpWidth').setDisabled(true);  
    },
    
    doN: function(){
        var me = this;
        var w  = me.getView();
        w.down('#rgrpWidth').setVisible(true);
        w.down('#rgrpWidth').setDisabled(false);
        w.down('#radio_width_80').setVisible(false);
        w.down('#radio_width_160').setVisible(false);
        var val_width   = w.down('#rgrpWidth').getValue();
        var radio_nr    = w.radio_nr;
        if((val_width['radio_'+radio_nr+'_width'] == '80')||(val_width['radio_'+radio_nr+'_width'] == '160')){
            var a   = 'radio_'+radio_nr+'_width';
            var t   = {};
            t[a]    = '20';
            w.down('#rgrpWidth').setValue(t);        
        }    
    }, 
    doAc: function(){
        var me = this;
        var w  = me.getView();
        w.down('#rgrpWidth').setVisible(true);
        w.down('#rgrpWidth').setDisabled(false);
        w.down('#radio_width_80').setVisible(true);
        w.down('#radio_width_160').setVisible(false);
        var val_width   = w.down('#rgrpWidth').getValue();
        var radio_nr    = w.radio_nr;
        if(val_width['radio_'+radio_nr+'_width'] == '160'){
            var a   = 'radio_'+radio_nr+'_width';
            var t   = {};
            t[a]    = '20';
            w.down('#rgrpWidth').setValue(t);        
        }   
    },
    doAx: function(){
        var me          = this;
        var w           = me.getView();
        w.down('#rgrpWidth').setVisible(true);
        w.down('#rgrpWidth').setDisabled(false);
        var radio_nr    = w.radio_nr;     
        //Here we need to check if it is 2g or 5g and epending on that make the widths visible / hide them
        var val        = w.down('#radio_'+radio_nr+'_radio_band').getValue();
        if(val['radio_'+radio_nr+'_band']== '2g'){
            w.down('#radio_width_80').setVisible(false);
            w.down('#radio_width_160').setVisible(false); 
        }        
        if(val['radio_'+radio_nr+'_band']== '5g'){
            w.down('#radio_width_80').setVisible(true);
            w.down('#radio_width_160').setVisible(true); 
        }
    },   
    sldrToggleChange: function(sldr){
		var me 		    = this;
		var pnl    	    = sldr.up('panel');
		var cnt         = pnl.down('#cntDetail');
		var radio_nr    = pnl.radio_nr;
		var rad_dis     = pnl.down('#radio_'+radio_nr+'_disabled');
		
        var value       = sldr.getValue();     
		if(value == 0){
		    cnt.hide();
		    cnt.setDisabled(true);
		    rad_dis.setValue(1);         
		}else{
		    cnt.show();
		    cnt.setDisabled(false);
		    rad_dis.setValue(0);
		}
	},
	sldrPowerChange: function(sldr){
        var me 		= this;
		var fc    	= sldr.up('container');
        fc.down('displayfield').setValue(sldr.getValue());
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

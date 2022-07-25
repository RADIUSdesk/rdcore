Ext.define('Rd.view.meshes.vcMeshNodeGeneric', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcMeshNodeGeneric',
    config : {
        urlAdvancedSettingsForModel : '/cake3/rd_cake/meshes/advanced_settings_for_model.json',
        urlViewNode : '/cake3/rd_cake/meshes/mesh-node-view.json'
    },
    init: function() {
        var me = this;
    },
    control: {
        '#chkEnableSchedules' : {
            change:  'chkEnableSchedulesChange'
        }
    },
    onChkNoControllerChange: function(chk){
        var me      = this;
        var form    = chk.up('form');
        var cnt     = form.down('#cntRebootController');      
        if(chk.getValue()){
            cnt.setVisible(true);
            cnt.setDisabled(false);   
        }else{
            cnt.setVisible(false);
            cnt.setDisabled(true);   
        }        
    },   
    onChkDailyRebootChange: function(chk){
        var me      = this;
        var form    = chk.up('form');
        var cnt     = form.down('#cntDailyReboot');      
        if(chk.getValue()){
            cnt.setVisible(true);
            cnt.setDisabled(false);   
        }else{
            cnt.setVisible(false);
            cnt.setDisabled(true);   
        }    
    },    
    onCmbInternetConnectionChange: function(cmb){
        var me              = this;
        var form            = cmb.up('form');
        var cntWbW          = form.down('#cntWbW');
        var pnlWanStatic    = form.down('#pnlWanStatic');
        var pnlWanPppoe     = form.down('#pnlWanPppoe');
        var pnlWifiStatic   = form.down('#pnlWifiStatic');
        var pnlWifiPppoe    = form.down('#pnlWifiPppoe');
        var pnlQmi          = form.down('#pnlQmi');
              
        if(cmb.getValue() == 'wifi'){
            cntWbW.setHidden(false);
            cntWbW.setDisabled(false); 
        }else{
            cntWbW.setHidden(true);
            cntWbW.setDisabled(true);    
        } 
        
        if(cmb.getValue() == 'wan_static'){
            pnlWanStatic.setHidden(false);
            pnlWanStatic.setDisabled(false);   
        }else{
            pnlWanStatic.setHidden(true);
            pnlWanStatic.setDisabled(true);
        }
        
        if(cmb.getValue() == 'wan_pppoe'){
            pnlWanPppoe.setHidden(false);
            pnlWanPppoe.setDisabled(false);   
        }else{
            pnlWanPppoe.setHidden(true);
            pnlWanPppoe.setDisabled(true);
        }
        
        if(cmb.getValue() == 'wifi_static'){
            pnlWifiStatic.setHidden(false);
            pnlWifiStatic.setDisabled(false);   
        }else{
            pnlWifiStatic.setHidden(true);
            pnlWifiStatic.setDisabled(true);
        } 
        
        if(cmb.getValue() == 'wifi_pppoe'){
            pnlWifiPppoe.setHidden(false);
            pnlWifiPppoe.setDisabled(false);   
        }else{
            pnlWifiPppoe.setHidden(true);
            pnlWifiPppoe.setDisabled(true);
        }
        
        if(cmb.getValue() == 'qmi'){
            pnlQmi.setHidden(false);
            pnlQmi.setDisabled(false);   
        }else{
            pnlQmi.setHidden(true);
            pnlQmi.setDisabled(true);
        }           
    }, 
    onCmbEncryptionOptionsChangeWbw : function(cmb){
        var me      = this;
        var form    = cmb.up('form');
        if(cmb.getValue() == 'none'){
            form.down('#wbw_key').setVisible(false);
            form.down('#wbw_key').setDisabled(true);  
        }else{
            form.down('#wbw_key').setVisible(true);
            form.down('#wbw_key').setDisabled(false);  
        }
    },
    onCmbEncryptionOptionsChangeStatic : function(cmb){
        var me      = this;
        var form    = cmb.up('form');
        if(cmb.getValue() == 'none'){
            form.down('#wifi_static_key').setVisible(false);
            form.down('#wifi_static_key').setDisabled(true);  
        }else{
            form.down('#wifi_static_key').setVisible(true);
            form.down('#wifi_static_key').setDisabled(false);  
        }
    },
    onCmbEncryptionOptionsChangePppoe : function(cmb){
        var me      = this;
        var form    = cmb.up('form');
        if(cmb.getValue() == 'none'){
            form.down('#wifi_pppoe_key').setVisible(false);
            form.down('#wifi_pppoe_key').setDisabled(true);  
        }else{
            form.down('#wifi_pppoe_key').setVisible(true);
            form.down('#wifi_pppoe_key').setDisabled(false);  
        }
    },
    onCmbMeshChange : function(cmb){
        var me      = this;
        var form    = cmb.up('form');
        var cmbSe   = form.down('tagStaticEntries');
        cmbSe.setValue(''); // Clear the values if there were perhaps some selected
        cmbSe.getStore().getProxy().setExtraParam('mesh_id',cmb.getValue());
        cmbSe.getStore().load();
    },
    onCmbHardwareOptionsChange: function(cmb){
     
		var me      = this;
        var form    = cmb.up('form');
        var val     = cmb.getValue();
        
        var r_count = 1;  
        var record  = cmb.getSelection();
        if(record != null){
            r_count =record.get('radios');
        }
        
        if(form.nodeId == 0){
            var params  = {model:val};
        }else{
            var params  = {model:val,node_id:form.nodeId};
        }  
        //Load the advanced settings for this hardware...
        form.load({
            url     : me.getUrlAdvancedSettingsForModel(), 
            method  : 'GET',
            params  : params,
            success : function(a,b,c){
                var w  = me.getView();
                me.radioCountChange(b.result.data.radio_count);
                var i;
                var n = b.result.data.radio_count;
                for (i = 0; i < n; i++) {
                    if(b.result.data['radio'+i+'_disabled']){
	                    w.down('#radio'+i+'_enabled').setValue(0,0);
	                }else{
	                    w.down('#radio'+i+'_enabled').setValue(1,1);
	                }    
                }
                return true;
            }
        });
	}, 
	onChkRadioEnableChange: function(chk){
		var me 		= this;
		var fs    	= chk.up('panel');//fs
        var value   = chk.getValue();
	},
	onChkRadioMeshChange: function(chk){
		var me 		= this;
		var fs    	= chk.up('panel');//fs
		var t_band	= fs.down('#txtRadioBand');
		var n_t		= fs.down('#numRadioTwoChan');
		var n_v		= fs.down('#numRadioFiveChan');	
		if(chk.getValue() == false){
			if(t_band.getValue()== '24'){	//2.4 selected... show it
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
		}else{
			//hide and disable both
			t_band.setVisible(false);
			t_band.setDisabled(true);
			n_t.setVisible(false);
			n_t.setDisabled(true);
			n_v.setVisible(false);
			n_v.setDisabled(true);
		}		
	},
    
    //New Additions...
    loadBasicSettings: function(form){
        var me      = this;      
        if(form.nodeId == 0){
            var hw      = form.down('cmbHardwareOptions');
        }else{
            form.load({
                url     : me.getUrlViewNode(), 
                method  : 'GET',
                params  : {'node_id': form.nodeId},
                success : function(a,b,c){
                    var schedule    = form.down("cmbSchedule");
                    var sch_val     = schedule.getValue();
                    if(sch_val != null){
                        var cmb     = form.down("cmbSchedule");
                        var rec     = Ext.create('Rd.model.mAp', {name: b.result.data.schedule_name, id: b.result.data.schedule_id});
                        cmb.getStore().loadData([rec],false);
                        cmb.setValue(b.result.data.schedule_id);
                    }
                }
            });    
        }         
    },
    radioCountChange: function(count){
      
        var me 		= this;
        var form    = me.getView();
        if(count == undefined){ //If not specified or empty
            count = 0;
        }
        
        form.down('#cmbInternetConnection').setDisabled(false);  
      
        if(count == 0){     
             form.down('#pnlRadioR0').hide();
             form.down('#pnlRadioR0').setDisabled(true);
             form.down('#pnlRadioR1').hide();
             form.down('#pnlRadioR1').setDisabled(true);
             form.down('#pnlRadioR2').hide();
             form.down('#pnlRadioR2').setDisabled(true);
             
            //Hide the whole option of selecting wbw
            form.down('#cmbInternetConnection').setValue('auto_detect');//This hould take care of hiding the wbw options
            form.down('#cmbInternetConnection').setDisabled(true);             
        }
        
        if(count == 1){
            form.down('#pnlRadioR0').show();
            form.down('#pnlRadioR0').setDisabled(false);      
            form.down('#pnlRadioR1').hide();
            form.down('#pnlRadioR1').setDisabled(true);
            form.down('#pnlRadioR2').hide();
            form.down('#pnlRadioR2').setDisabled(true);
            
            form.down('#wbw_radio_1').setDisabled(true);
            form.down('#wbw_radio_1').hide(); 
            form.down('#wbw_radio_2').setDisabled(true);
            form.down('#wbw_radio_2').hide(); 
            
            form.down('#wifi_static_radio_1').setDisabled(true);
            form.down('#wifi_static_radio_1').hide(); 
            form.down('#wifi_static_radio_2').setDisabled(true);
            form.down('#wifi_static_radio_2').hide(); 
            
            form.down('#wifi_pppoe_radio_1').setDisabled(true);
            form.down('#wifi_pppoe_radio_1').hide(); 
            form.down('#wifi_pppoe_radio_2').setDisabled(true);
            form.down('#wifi_pppoe_radio_2').hide(); 
             
            form.down('#wifi_static_radio_0').setValue(true);  
            form.down('#wifi_pppoe_radio_0').setValue(true);     
            form.down('#rgrpWifiPppoeRadio').hide();
            form.down('#rgrpWifiStaticRadio').hide(); 
            
            form.down('#wbw_radio_0').setValue(true);       
            form.down('#rgrpWbWradio').hide();    
               
        }
        
        if(count == 2){
            form.down('#pnlRadioR0').show();
            form.down('#pnlRadioR0').setDisabled(false); 
            form.down('#pnlRadioR1').show();
            form.down('#pnlRadioR1').setDisabled(false); 
            form.down('#pnlRadioR2').hide();
            form.down('#pnlRadioR2').setDisabled(true);
             
            form.down('#wbw_radio_1').setDisabled(false);
            form.down('#wbw_radio_1').show(); 
            form.down('#wbw_radio_2').setDisabled(true);
            form.down('#wbw_radio_2').hide();
            
            form.down('#wifi_static_radio_1').setDisabled(false);
            form.down('#wifi_static_radio_1').show(); 
            form.down('#wifi_static_radio_2').setDisabled(true);
            form.down('#wifi_static_radio_2').hide();
            
            form.down('#wifi_pppoe_radio_1').setDisabled(false);
            form.down('#wifi_pppoe_radio_1').show(); 
            form.down('#wifi_pppoe_radio_2').setDisabled(true);
            form.down('#wifi_pppoe_radio_2').hide();
            
            form.down('#rgrpWbWradio').show();
            form.down('#rgrpWifiPppoeRadio').show();
            form.down('#rgrpWifiStaticRadio').show();      
            
        }
        
        if(count == 3){
            form.down('#pnlRadioR0').show();
            form.down('#pnlRadioR0').setDisabled(false);
            form.down('#pnlRadioR1').show();
            form.down('#pnlRadioR1').setDisabled(false);
            form.down('#pnlRadioR2').show();
            form.down('#pnlRadioR2').setDisabled(false);
            
            form.down('#wbw_radio_1').setDisabled(false);
            form.down('#wbw_radio_1').show(); 
            form.down('#wbw_radio_2').setDisabled(false);
            form.down('#wbw_radio_2').show();
            
            form.down('#wifi_static_radio_1').setDisabled(false);
            form.down('#wifi_static_radio_1').show(); 
            form.down('#wifi_static_radio_2').setDisabled(false);
            form.down('#wifi_static_radio_2').show();
            
            form.down('#wifi_pppoe_radio_1').setDisabled(false);
            form.down('#wifi_pppoe_radio_1').show(); 
            form.down('#wifi_pppoe_radio_2').setDisabled(false);
            form.down('#wifi_pppoe_radio_2').show();
            
            form.down('#rgrpWbWradio').show();
            form.down('#rgrpWifiPppoeRadio').show();
            form.down('#rgrpWifiStaticRadio').show();              
        }      
    },    
    onCmbQmiOptionsChange: function(cmb){
        var me      = this;
        var form    = cmb.up('form');
        if(cmb.getValue() == 'none'){
            form.down('#qmi_username').setVisible(false);
            form.down('#qmi_username').setDisabled(true); 
            form.down('#qmi_password').setVisible(false);
            form.down('#qmi_password').setDisabled(true);  
        }else{
            form.down('#qmi_username').setVisible(true);
            form.down('#qmi_username').setDisabled(false);  
            form.down('#qmi_password').setVisible(true);
            form.down('#qmi_password').setDisabled(false);
        }
    },
    chkEnableSchedulesChange : function(chk){
		var me 		= this;
		var form	= chk.up('form');
		var cnt	    = form.down('#cntSchedule');
		if(chk.getValue()){
		    cnt.setVisible(true);
            cnt.setDisabled(false); 
		}else{
			cnt.setVisible(false);
            cnt.setDisabled(true); 
		}
	}
});

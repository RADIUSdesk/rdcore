Ext.define('Rd.view.aps.vcApGeneric', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcApGeneric',
    config : {
        urlAdvancedSettingsForModel : '/cake4/rd_cake/ap-profiles/advanced-settings-for-model.json',
        urlViewAp                   : '/cake4/rd_cake/ap-profiles/ap-profile-ap-view.json',
        urlApStaticOverrides        : '/cake4/rd_cake/ap-profiles/ap-static-entry-overrides-view.json',
        changedLoad                 : false        
    },
    init: function() {
        var me = this;
    },
    control: {
        '#btnPickGroup': {
             click: 'btnPickGroupClick'
        },
        '#chkEnableSchedules' : {
            change:  'chkEnableSchedulesChange'
        }
    },
    stores      : [	
		'sClouds'
    ],    
    btnPickGroupClick : function(button){
        var me             = this;
        var form           = button.up('form');
        var updateDisplay  = form.down('#displTag');
        var updateValue    = form.down('#hiddenTag');      
        if(!Ext.WindowManager.get('winSelectCloudId')){
            var w = Ext.widget('winSelectCloud',{id:'winSelectCloudId',updateDisplay:updateDisplay,updateValue:updateValue});
            me.getView().add(w);
            w.show();         
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
        var pnlWifiEnt      = form.down('#pnlWifiEnt');
        var pnlQmi          = form.down('#pnlQmi');
        var pnlMwan         = form.down('#pnlMwan');
              
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
        
        if(cmb.getValue() == 'wifi_ent'){
            pnlWifiEnt.setHidden(false);
            pnlWifiEnt.setDisabled(false);   
        }else{
            pnlWifiEnt.setHidden(true);
            pnlWifiEnt.setDisabled(true);
        }
        
        if(cmb.getValue() == 'qmi'){
            pnlQmi.setHidden(false);
            pnlQmi.setDisabled(false);   
        }else{
            pnlQmi.setHidden(true);
            pnlQmi.setDisabled(true);
        } 
        if(cmb.getValue() == 'mwan'){
            pnlMwan.setHidden(false);
            pnlMwan.setDisabled(false);   
        }else{
            pnlMwan.setHidden(true);
            pnlMwan.setDisabled(true);
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
   onCmbApHardwareModelsChange: function(cmb){
     
		var me      = this;
        var form    = cmb.up('form');
        var val     = cmb.getValue();
        
        var r_count = 1;  
        var record  = cmb.getSelection();
        if(record != null){
            r_count =record.get('radios');
        }
         
        if(form.apId == 0){
            var params  = {model:val};
        }else{
            var params  = {model:val,ap_id:form.apId};
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
	
	loadBasicSettings: function(formPanel) {
        var me = this;

        if (formPanel.apId === 0) {
            var hw = formPanel.down('cmbApHardwareModels');
            return;
        }

        formPanel.load({
            url    : me.getUrlViewAp(),
            method : 'GET',
            params : { ap_id: formPanel.apId },

            success: function(basicForm, action) {
                var data = action.result.data;
                
                // Remember what the server says this AP has, so the static entry
                // list can be re-applied once its option store has loaded (see
                // syncStaticEntries): the store load and this form load race.
                formPanel.loadedApProfileId   = data.ap_profile_id;
                formPanel.loadedStaticEntries = data['static_entries[]'] || [];
                me.syncStaticEntries(formPanel);
                
                // Example: work with specific returned data
                var cmbSchedule = formPanel.down("cmbSchedule");

                if (data.schedule_id && data.schedule_name) {
                    var rec = Ext.create('Rd.model.mAp', {
                        id:   data.schedule_id,
                        name: data.schedule_name
                    });

                    cmbSchedule.getStore().loadData([rec], false);
                    cmbSchedule.setValue(data.schedule_id);
                }

                if (me.getChangedLoad()) {
                    formPanel.setLoading(false);
                }
            },

            failure: function(form, action) {
                Ext.Msg.alert('Load failed', 'Could not load AP data.');
                formPanel.setLoading(false);
            }
        });
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
            
            form.down('#wifi_ent_radio_1').setDisabled(true);
            form.down('#wifi_ent_radio_1').hide(); 
            form.down('#wifi_ent_radio_2').setDisabled(true);
            form.down('#wifi_ent_radio_2').hide();  
             
            form.down('#wifi_static_radio_0').setValue(true);  
            form.down('#wifi_pppoe_radio_0').setValue(true);
            form.down('#wifi_ent_radio_0').setValue(true);    
            form.down('#rgrpWifiPppoeRadio').hide();
            form.down('#rgrpWifiStaticRadio').hide(); 
            form.down('#rgrpWifiEntRadio').hide(); 
            
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
            
            form.down('#wifi_ent_radio_1').setDisabled(false);
            form.down('#wifi_ent_radio_1').show(); 
            form.down('#wifi_ent_radio_2').setDisabled(true);
            form.down('#wifi_ent_radio_2').hide();
            
            form.down('#rgrpWbWradio').show();
            form.down('#rgrpWifiPppoeRadio').show();
            form.down('#rgrpWifiStaticRadio').show();
            form.down('#rgrpWifiEntRadio').show();      
            
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
            
            form.down('#wifi_ent_radio_1').setDisabled(false);
            form.down('#wifi_ent_radio_1').show(); 
            form.down('#wifi_ent_radio_2').setDisabled(false);
            form.down('#wifi_ent_radio_2').show();
            
            form.down('#rgrpWbWradio').show();
            form.down('#rgrpWifiPppoeRadio').show();
            form.down('#rgrpWifiStaticRadio').show();  
            form.down('#rgrpWifiEntRadio').show();             
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
    onCmbApProfileChange: function(cmb){
        var me          = this;        
        var apProfileId = cmb.getValue()
        
        var form    = cmb.up('form');
        me.setChangedLoad(true);
        form.setLoading();
        var s       = Ext.create('Ext.data.Store', {
            fields: ['id', 'type'],
            proxy: {
                    type    : 'ajax',
                    format  : 'json',
                    batchActions: true,
                    url     : '/cake4/rd_cake/ap-profiles/ap_profile_exits_index.json',
                    reader: {
                        type            : 'json',
                        rootProperty    : 'items',
                        messageProperty : 'message'
                    }
            },
            autoLoad: false
        });
        s.getProxy().setExtraParams({ap_profile_id: cmb.getValue(),add_no_exit : true});
        s.reload({
            callback: function(records, op, success) {
                me.guiPrepTwo(form,s,apProfileId);
            }
        });               
    },
    
    guiPrepTwo  : function(form,s,apProfileId){
        var me = this;
        form.down('#wbw_wan_bridge').setStore(s);      
        form.down('#wifi_static_wan_bridge').setStore(s);        
        form.down('#wifi_pppoe_wan_bridge').setStore(s); 
        form.down('#wifi_ent_wan_bridge').setStore(s);        
        form.down('#qmi_wan_bridge').setStore(s);

        // The static entry options load asynchronously and a tag field can only hold
        // values its store knows. Clearing the field here and relying on the value the
        // form load set earlier lost the AP's entry points whenever this load finished
        // after the form load: the override panels never appeared and a Save then wiped
        // the AP's entry points and overrides. Re-apply the loaded selection once the
        // options are in (syncStaticEntries) and keep Save disabled until then.
        
        //-- We get the static entries for this AP --
        //-- Once we got that; it will trigger 'onTagApProfileStaticEntriesChange' if there were any 
        var cmbSe   = form.down('tagApProfileStaticEntries');
        form.staticEntriesSynced = false;
        me.setSaveEnabled(form, false);
        cmbSe.getStore().getProxy().setExtraParam('ap_profile_id',apProfileId);
        cmbSe.getStore().load({
            callback: function(records, op, success) {             
                if(form.apId > 0){
                    me.syncStaticEntries(form);
                    me.loadBasicSettings(form); //Now that everything is loaded for the specific profile we can reload the screen's data                 
                }else{
                    form.setLoading(false);
                }
            }
        });    
    },
    
    syncStaticEntries: function(form){
        // Apply the AP's entry points to the tag field once BOTH the form data and the
        // option store are available; clear them when the profile was changed by hand.
        var me      = this;
        var cmbSe   = form.down('tagApProfileStaticEntries');
        var cmb     = form.down('#ap_profile_id');
        var store   = cmbSe.getStore();
        if(form.loadedApProfileId === undefined || store.isLoading() || store.getCount() == 0){
            return; // the other half has not arrived yet
        }
        var wanted = [];
        if(cmb.getValue() == form.loadedApProfileId){
            wanted = form.loadedStaticEntries;
        }
        var current = cmbSe.getValue() || [];
        if(Ext.Array.equals(Ext.Array.sort(Ext.Array.clone(current)), Ext.Array.sort(Ext.Array.clone(wanted)))){
            form.staticEntriesSynced = true;
            me.setSaveEnabled(form, (form.overridesPending || 0) == 0);
            return;
        }
        form.staticEntriesSynced = true;
        cmbSe.setValue(wanted); // fires onTagApProfileStaticEntriesChange, which loads the overrides
    },
    setSaveEnabled: function(form, enabled){
        var btn = form.down('#editsave') || form.down('#addsave');
        if(btn){
            btn.setDisabled(!enabled);
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
	},
	onTagApProfileStaticEntriesChange : function(tag){
	    var me                  = this;
	    var form	            = tag.up('form');
	    var cntEntryOverrides   = form.down('#cntEntryOverrides');
	    
	    //Clear it out first
	    cntEntryOverrides.removeAll();      
        cntEntryOverrides.hide();
        cntEntryOverrides.disable();
        
        // Save stays disabled until every selected entry's override panel is in place,
	    // so an early click cannot submit a form that does not yet carry the overrides.
	    var selected = tag.getValue() || [];
	    form.overridesPending = selected.length;
	    me.setSaveEnabled(form, form.overridesPending == 0 && form.staticEntriesSynced !== false);
	    var settle = function(){
	        form.overridesPending = Math.max(0, (form.overridesPending || 0) - 1);
	        if(form.overridesPending == 0 && form.staticEntriesSynced !== false){
	            me.setSaveEnabled(form, true);
	        }
	        console.log("Settle Down Pappie");
	    };
	    
	    Ext.Array.forEach(selected,function(r){    	      
            Ext.Ajax.request({
                url: me.getUrlApStaticOverrides(),
                params: {
                    ap_id               : me.getView().apId,
                    ap_profile_entry_id : r,
                    toolkit             : 'classic'
                },
                method: 'GET',
                success: function(response){
                    cntEntryOverrides.show();
                    cntEntryOverrides.enable();
                    var jsonData = Ext.JSON.decode(response.responseText);                    
                    if(jsonData.success){    
                        me.addStaticEntryEdit(jsonData.data);
                    }else{
                        //console.log("NOT COOL");                      
                    }
                    settle();
                },
                failure: function(){
                    settle();
                 }
            });
        });	    	    
	},
	addStaticEntryEdit: function(data){
	    var me                  = this;
	    var cntEntryOverrides   = me.getView().down('#cntEntryOverrides');	    
	    var item    = {
	        xtype       : 'cntApEntryOverride',
	        info        : data
	    };	        	    
	    cntEntryOverrides.add(item);	    
	}
});

Ext.define('Rd.view.firewallProfiles.vcFirewallProfileEntry', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcFirewallProfileEntry',
    init    : function() {
    
    },
    control: {
    	'cmbFwCategories': {
           change   : 'cmbFwCategoryChange'
        },
        'cmbFwSchedule': {
           change   : 'cmbFwScheduleChange'
        },
        '#btnAllow': {
        	click	: 'onBtnAllowClick'
        },
        '#btnBlock': {
        	click	: 'onBtnBlockClick'
        },
        '#btnLimit': {
        	click	: 'onBtnLimitClick'
        }         
    },
    onTimeSlideChange : function( slider , newValue , thumb ){
        var me 		= this;
        var start   = me.getView().down('#sldrStart').getValue();
        var end		= me.getView().down('#sldrEnd').getValue();
        var human_span = '0 minutes';
        if(start > end){
        	var span 		= (1440- start) + end; //Whats left from the first day PLUS second day
        	var human_span 	= me.forHumans(span);        
        }
             
        if(start < end){
        	var span 		= end - start;
        	var human_span 	= me.forHumans(span);
        }       
        var cmp     = me.getView().down('#cmpTimeDisplay');
        var hm_start= me.timeFormat(start);
        var hm_end	= me.timeFormat(end);
        cmp.setData({start_time: hm_start,end_time: hm_end,timespan: human_span});     
    },
    onTipText: function(thumb){
        var me = this;
        var f_val = me.timeFormat(thumb.value);
        return Ext.String.format('<b>{0}</b>', f_val);
    },
    timeFormat: function(newValue){
        var m       = newValue % 60;
        var h       = (newValue-m)/60;
        var hrs_mins= h.toString() + ":" + (m<10?"0":"") + m.toString();
        return hrs_mins;
    },
    cmbFwCategoryChange: function(cmb,new_value){
    	var me = this;
    	if(new_value == 'app'){
    		me.getView().down('tagFwApps').show();
    		me.getView().down('tagFwApps').enable();
    	} 	
    	if(new_value != 'app'){
    		me.getView().down('tagFwApps').hide();
    		me.getView().down('tagFwApps').disable();
    	}
    	if(new_value == 'domain'){
    		me.getView().down('#txtDomain').show();
    		me.getView().down('#txtDomain').enable();
    	} 
    	if(new_value != 'domain'){
    		me.getView().down('#txtDomain').hide();
    		me.getView().down('#txtDomain').disable();
    	}
    	if(new_value == 'ip_address'){
    		me.getView().down('#txtIpAddress').show();
    		me.getView().down('#txtIpAddress').enable();
    	} 
    	if(new_value != 'ip_address'){
    		me.getView().down('#txtIpAddress').hide();
    		me.getView().down('#txtIpAddress').disable();
    	}   		   	
    },
    cmbFwScheduleChange: function(cmb,new_value){
    	var me = this;
    	if((new_value == 'every_day')||(new_value == 'every_week')||(new_value == 'one_time')||(new_value == 'custom')){
    		me.getView().down('#sldrStart').show();
    		me.getView().down('#sldrEnd').show();
    		me.getView().down('#cmpTimeDisplay').show();
    	}else{
    		me.getView().down('#sldrStart').hide();
    		me.getView().down('#sldrEnd').hide();
    		me.getView().down('#cmpTimeDisplay').hide();
    	}
    	
    	if(new_value == 'every_week'){
    		me.getView().down('#chkGrpWeekDays').show();
    	}else{
    		me.getView().down('#chkGrpWeekDays').hide();
    	}  	    	   	
    },
    onBtnAllowClick: function(btn){
    	var me = this;
    	me.getView().down('#bw_up').hide();
    	me.getView().down('#bw_down').hide();
    	me.getView().down('#txtAction').setValue('allow');
    },
    onBtnBlockClick: function(btn){
    	var me = this;
    	me.getView().down('#bw_up').hide();
    	me.getView().down('#bw_down').hide();
    	me.getView().down('#txtAction').setValue('block');
    },
    onBtnLimitClick: function(btn){
    	var me = this;
    	me.getView().down('#bw_up').show();
    	me.getView().down('#bw_down').show();
    	me.getView().down('#txtAction').setValue('limit');
    },
    forHumans: function( minutes ) {
		var milliseconds = minutes * 60 * 1000;
		var mydate = new Date(milliseconds);
		var humandate = mydate.getUTCHours()+" hours, "+mydate.getUTCMinutes()+" minutes";
		return humandate;
	}
});

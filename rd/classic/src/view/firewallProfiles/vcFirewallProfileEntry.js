Ext.define('Rd.view.firewallProfiles.vcFirewallProfileEntry', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcFirewallProfileEntry',
    init    : function() {
    
    },
    control: {
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
    onAfterEditRender : function(window){
        var me      = this;
        var form    = window.down('form');
        var r       = window.record;
        var rg_day  = form.down('#rgDay');
        var rg_time = form.down('#rgTime');
        var cg_days = form.down('#chkGrpWeekDays');
        var slide   = form.down('multislider');
        var every_day = r.get('every_day');
        if(every_day){    
            var val = {selected_days : 'every_day'};
            rg_day.setValue(val);
        }else{
            var val = {selected_days : 'specific_days'};
            rg_day.setValue(val);
            
            //Here we need also to set out the days
            var values  = [];
            var days    = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
            days.forEach(function(element, index, array){
                var t   = r.get(element);
                if(t){
                    values.push(element);
                } 
            })
            cg_days.setValue({'weekday[]':values});
        }
        
        var always = r.get('always');     
        if(always){    
            var val = {time_slot : 'always'};
            rg_time.setValue(val);
        }else{
            var val = {time_slot : 'specific_time'};
            rg_time.setValue(val);
            //Here we need to set the value of the sliders
            var start   = r.get('start');
            var stop    = r.get('stop');
            slide.setValue([start,stop]);    
        }      
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
    cmbFwScheduleChange: function(cmb,new_value){
    	var me = this;
    	console.log("Change Schedule TO "+new_value);
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
    },
    onBtnBlockClick: function(btn){
    	var me = this;
    	me.getView().down('#bw_up').hide();
    	me.getView().down('#bw_down').hide();
    },
    onBtnLimitClick: function(btn){
    	var me = this;
    	me.getView().down('#bw_up').show();
    	me.getView().down('#bw_down').show();
    },
    forHumans: function( minutes ) {
		var milliseconds = minutes * 60 * 1000;
		var mydate = new Date(milliseconds);
		var humandate = mydate.getUTCHours()+" hours, "+mydate.getUTCMinutes()+" minutes";
		return humandate;
	}
});

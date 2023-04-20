Ext.define('Rd.view.firewallProfiles.vcFirewallProfileEntry', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcFirewallProfileEntry',
    init    : function() {
    
    },
    control: {
        'cmbFwSchedule': {
           change   : 'cmbFwScheduleChange'
        }        
    },
    onTimeSlideChange : function( slider , newValue , thumb ){
        var me 		= this;
        var form    = slider.up('form');
        var cmp     = form.down('#cmpTimeDisplay');
        var hrs_mins= me.timeFormat(newValue);
        cmp.setData({start_time: hrs_mins});     
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
    	
    	    	   	
    }
});

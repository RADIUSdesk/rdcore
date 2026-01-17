Ext.define('Rd.view.freeradiusStats.vcFreeradiusStats', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcFreeradiusStats',
    config: {
        span        : 'day',
        urlRadstats : '/cake4/rd_cake/freeradius-stats/index.json'
    },
    control: {
        'pnlFreeradiusStats': {
            activate   : 'genChange'
        },
        'pnlFreeradiusStats #reload' : {
            click  : 'genChange'        
        },
        'pnlFreeradiusStats cmbTimezones' : {
            change  : 'genChange'
        },
        'pnlFreeradiusStats #dtDate' : {
            change  : 'genChange'
        }
    },
    genChange: function(cmb){
        var me = this;
        me.fetchStats();
    },
    onClickTodayButton: function(button){
        var me = this;
        me.lookup('btnTimeBack').setTooltip('Go Back 1Day');
        me.lookup('btnTimeForward').setTooltip('Go Forward 1Day');
        me.setSpan('day');
        me.fetchStats();
    },
    onClickThisWeekButton: function(button){
        var me = this;
        me.lookup('btnTimeBack').setTooltip('Go Back 1Week');
        me.lookup('btnTimeForward').setTooltip('Go Forward 1Week');
        me.setSpan('week');
        me.fetchStats();
    },
    onClickThisMonthButton: function(button){
        var me = this;
        me.lookup('btnTimeBack').setTooltip('Go Back 1Month');
        me.lookup('btnTimeForward').setTooltip('Go Forward 1Month');
        me.setSpan('month');
        me.fetchStats();
    },
    onClickTimeBack: function(b){
        var me          = this;
        var picker      = me.lookup('dtDate');
        var step        = -1;
        var unit        = Ext.Date.DAY;
        if(me.getSpan()== 'week'){
            step        = -7;
        }
        if(me.getSpan()== 'month'){
            step        = -1;
            unit        = Ext.Date.MONTH;
        }
        me.lookup('btnTimeForward').setDisabled(false);
        var d_current   = picker.getValue();
        var d_back      = Ext.Date.add(d_current, unit, step);
        picker.setValue(d_back);       
    },
    onClickTimeForward: function(b){
        var me          = this;
        var picker      = me.lookup('dtDate');
        var step        = 1;
        var unit        = Ext.Date.DAY;
        if(me.getSpan()== 'week'){
            step        = 7;
        }
        if(me.getSpan()== 'month'){
            step        = 1;
            unit        = Ext.Date.MONTH;
        }
        var d_current   = picker.getValue();
        var today       = new Date();
        var d_fwd       = Ext.Date.add(d_current, unit, step);
        if(Ext.Date.format(d_fwd,'timestamp') >= Ext.Date.format(today,'timestamp')){
            me.lookup('btnTimeForward').setDisabled(true);
            d_fwd  = today;
        }
        picker.setValue(d_fwd); 
    },  
    fetchStats : function(){  
        var me  = this;    
        me.getView().setLoading(true);
        var day     = me.getView().down('#dtDate').getRawValue();
        var tz_id   = me.getView().down('cmbTimezones').getValue();      
        Ext.Ajax.request({
                url: me.getUrlRadstats(),
                params: {
                    span        : me.getSpan(),
                    day         : day,
                    timezone_id : tz_id
                },
                method: 'GET',
                success: function(response){
                    var jsonData = Ext.JSON.decode(response.responseText);
                    me.getView().setLoading(false);                
                    if(jsonData.success){
                        //Here we'll paintScreen()    
                        me.paintScreen(jsonData.data);
                    }
                }
            });
    },
    paintScreen : function(data){
        var me = this;
        me.getView().down('#barTotals').getStore().setData(data.graph.items);
        me.getView().down('#plrAcctAuth').getStore().setData(data.polar.totals);
        me.getView().down('#pnlSummary').setData(data.summary);  
    }
});

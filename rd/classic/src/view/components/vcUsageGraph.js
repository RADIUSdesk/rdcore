Ext.define('Rd.view.components.vcUsageGraph', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcUsageGraph', 
    onPnlUsageGraphActivate: function(pnl){
        var me = this;
        me.getView().down('#chrtUsage').getStore().load();
    },  
    onBtnReloadClick: function(button){
        var me 		        = this;
        me.getView().down('#chrtUsage').getStore().load();
    },
    onDayChange: function(sel_day){
        var me      = this; 
        me.getView().down('#chrtUsage').getStore().getProxy().setExtraParam('day',sel_day.getRawValue());
        me.getView().down('#chrtUsage').getStore().load();
    },
    onCmbTimezonesChange: function(cmb){
        var me 		        = this;
        me.getView().down('#chrtUsage').getStore().getProxy().setExtraParam('timezone_id',cmb.getValue());
        me.getView().down('#chrtUsage').getStore().load();
    },
    onClickTimeBack: function(b){
        var me          = this;
        var picker      = me.lookup('dtDate');
        var step        = -1;
        var unit        = Ext.Date.DAY;
        if(me.getView().span == 'weekly'){
            step        = -7;
        }
        if(me.getView().span == 'monthly'){
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
        if(me.getView().span == 'weekly'){
            step        = 7;
        }
        if(me.getView().span == 'monthly'){
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
});

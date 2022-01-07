Ext.define('Rd.view.charts.vcChartApUsers', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcChartApUsers',
    span    : 'hour',   //Default start value
    entry_id: 0,        //Default start value
    init: function() {
    
    },
    onBtnTimeToggled   : function(button){
        var me      = this;
        if(button.pressed){
            me.span = button.getItemId();
            me.load();
        }
    },
    onBtnReloadClick: function(button){
        var me      = this;
        me.load();
    },
    onCmbSsidChange: function(cmb){
        var me          = this;
        me.entry_id     = cmb.getValue();
        me.load();
    },
    pnlAfterRender: function(pnl){
        var me      = this;
        me.load();
    },
    load    : function(){
        var me      = this;
        var apId    = me.getView().apId;
        var chrt    = me.getView().down('cartesian');
        chrt.getStore().getProxy().setExtraParams({'timespan': me.span,'entry_id':me.entry_id,'ap_id':apId});
        chrt.getStore().load();
    }  
});

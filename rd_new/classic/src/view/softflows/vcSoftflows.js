Ext.define('Rd.view.softflows.vcSoftflows', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcSoftflows',
    config  : {
        timespan        : 'now'
    },
    onBtnReload: function(button){
        var me = this;
        me.reload();
    }, 
    onComboChange: function(combo){
        var me = this;
         me.reload();
    },  
    onClickNowButton: function(button){
        var me = this;  
        me.setTimespan('now');
        me.reload();
    }, 
    onClickDayButton: function(button){
        var me = this;  
        me.setTimespan('daily');
        me.reload();
    }, 
    onClickWeekButton: function(button){
        var me = this;  
        me.setTimespan('weekly');
        me.reload();     
    },
    reload: function(){
        var me      = this;
        var dd      = Ext.getApplication().getDashboardData();
        var tz_id   = dd.user.timezone_id;
        var grid    = me.getView().down('gridSoftflows');
        var dc_id   = me.getView().down('cmbDynamicClient').getValue();
        console.log("DC ID IS "+dc_id);
        if(dc_id == null){
            Ext.ux.Toaster.msg(
                'Select A RADIUS Client',
                'Select A RADIUS Client To See Its Flows',
                Ext.ux.Constants.clsWarn,
                Ext.ux.Constants.msgWarn
            );     
        }else{
            grid.getStore().getProxy().setExtraParams({
                'dynamic_client_id' :dc_id,
                'timespan'          : me.getTimespan(),      
                'timezone_id'       : tz_id
            });
            grid.getStore().reload();     
        }      
    }
});

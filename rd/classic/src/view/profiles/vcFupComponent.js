Ext.define('Rd.view.profiles.vcFupComponent', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcFupComponent',
    init    : function() {
        var me = this;
    },
    cmbConditionTypeChange : function(cmb){
        var me      = this;
        var value   = cmb.getValue();
        var pnl     = cmb.up('panel');

        var t_start = pnl.down('#timeStart');
        var t_end   = pnl.down('#timeEnd');
        var amount  = pnl.down('#amount')
        var unit    = pnl.down('#unit'); 

        if(value == 'time_of_day'){
            t_start.show();
            t_end.show();
            amount.hide(); 
            unit.hide();
        }else{
            t_start.hide();
            t_end.hide();
            amount.show();
            unit.show();
        }
    }
});

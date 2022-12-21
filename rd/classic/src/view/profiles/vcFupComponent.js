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
        var amount  = pnl.down('#dataAmount')
        var unit    = pnl.down('#dataUnit'); 

        if(value == 'time_of_day'){
            t_start.show();
            t_start.enable();
            t_end.show();
            t_end.enable();

            amount.hide();
            amount.disable();
            unit.hide();
            unit.disable();
        }else{
            t_start.hide();
            t_start.disable();
            t_end.hide();
            t_end.disable();

            amount.show();
            amount.enable();
            unit.show();
            unit.enable();
        }
    },
    cmbActionChange : function(cmb){
        var me      = this;
        var value   = cmb.getValue();
        var pnl     = cmb.up('panel');

        var a       = pnl.down('#nrActionAmount');
        var b       = pnl.down('#lblPercent');
        if(value == 'block'){
            a.hide();
            a.disable();
            b.hide();
            b.disable();
        }else{
            a.show();
            a.enable();
            b.show();
            b.enable();
        }

    },
    delComponent: function(){
        var me = this;
        me.getView().destroy();
	}
});

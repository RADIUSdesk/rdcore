Ext.define('Rd.view.profiles.vcLogintime', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcLogintime',
    init    : function() {
        var me = this;
    },
    control: {
        '#rgrpSlotType' : {
            change : 'rgrpChange'
        }
    },
    rgrpChange: function(grp,new_val,old_val){
        var me  = this;
        var pnl = grp.up('panel');
        var d   = pnl.down('#chkGrpDays');
        var s   = pnl.down('#timeStart');
        var e   = pnl.down('#timeEnd');      
        var val_arr = Object.keys(new_val);
        var v       = new_val[val_arr[0]];  
        if(v == 'disabled'){
            d.setDisabled(true);
            s.setDisabled(true);
            e.setDisabled(true);
        }else{
            if(v == 'specific'){
                d.setDisabled(false);
            }else{
                d.setDisabled(true);
            }
            s.setDisabled(false);
            e.setDisabled(false);
        }
    }
});

Ext.define('Rd.view.aps.vcAccessPointCommonSettings', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcAccessPointCommonSettings',
    init    : function() {
        var me = this;
    },
    rgrpVlanChange: function( rgrp,newValue, oldValue, eOpts){
    
        var me     = this;
        var val    = newValue['vlan_range_or_list'];
        var w      = me.getView();
        var start  = w.down('#vlan_start');
        var end    = w.down('#vlan_end');
        var list   = w.down('#vlan_list');
        if(val == 'range'){
            start.show();
            start.enable();
            end.show();
            end.enable();
            list.hide();
            list.disable();
        }
        if(val == 'list'){
            start.hide();
            start.disable();
            end.hide();
            end.disable();
            list.show();
            list.enable();
        }      
    },
    OnChkVlanEnableChange : function(chk){
        var me = this;
        var w  = me.getView();
        var r  = w.down('#rgrpVlanRangeOrList');
        var start  = w.down('#vlan_start');
        var end    = w.down('#vlan_end');
        var list   = w.down('#vlan_list');
        var rgrp   = w.down('#rgrpVlanRangeOrList');
        rgrpVal    = rgrp.getValue();
        if(chk.getValue()){
           // r.setVisible(true);
            if(rgrpVal['vlan_range_or_list'] == 'range'){
                start.show();
                end.show();
                list.hide();
            }
            if(rgrpVal['vlan_range_or_list'] == 'list'){
                start.hide();
                end.hide();
                list.show();
            }
            r.setDisabled(false);
            start.setDisabled(false);
            end.setDisabled(false);
        }else{
            r.setDisabled(true);
            start.setDisabled(true);
            end.setDisabled(true);
            list.setDisabled(true);
        } 
    }
});

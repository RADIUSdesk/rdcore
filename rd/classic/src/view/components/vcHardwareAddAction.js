Ext.define('Rd.view.schedules.vcHardwareAddAction', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcHardwareAddAction',
    init    : function() {
    
    },
    rgrpChange: function(grp,new_val,old_val){
        var me = this;
       if(new_val.action == 'predefined_command'){
            me.getView().down('#hbPredefinedCommand').setDisabled(false);
            me.getView().down('#hbPredefinedCommand').setVisible(true);
            me.getView().down('#hbCommand').setDisabled(true);
            me.getView().down('#hbCommand').setVisible(false);          
        }
        if((new_val.action == 'execute')||(new_val.action == 'execute_and_reply')){
            me.getView().down('#hbPredefinedCommand').setDisabled(true);
            me.getView().down('#hbPredefinedCommand').setVisible(false); 
            me.getView().down('#hbCommand').setDisabled(false);
            me.getView().down('#hbCommand').setVisible(true);      
        }
    }
});

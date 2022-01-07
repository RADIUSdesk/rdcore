Ext.define('Rd.view.components.vcSelectOwner', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcSelectOwner',
    onBtnOwnerSelectClick: function(button){
        var me 		        = this;
        var pnl             = button.up('panel');
        var updateDisplay   = pnl.down('#displUser');
        var updateValue     = pnl.down('#hiddenUser');   
        var tree = button.up('treepanel');
        //Get selection:
        var sr = tree.getSelectionModel().getLastSelected();
        if(sr){    
            var win = button.up('window');
           // me.getView().updateDisplay.setValue(sr.get('username'));
            me.getView().updateDisplay.setValue("<div class=\"fieldOrange\"><i class='fa fa-pen'></i> <b> "+sr.get('username')+"</b></div>");
            me.getView().updateValue.setValue(sr.getId());
            win.close();
        }else{
            Ext.ux.Toaster.msg(
                        i18n('sSelect_an_owner'),
                        i18n('sFirst_select_an_Access_Provider_who_will_be_the_owner'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }
    }
});

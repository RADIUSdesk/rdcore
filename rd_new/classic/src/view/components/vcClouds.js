Ext.define('Rd.view.components.vcClouds', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcClouds',
    onBtnCloudSelectClick: function(button){
        var me 		        = this;
        var pnl             = button.up('panel');
        var updateDisplay   = pnl.down('#displTag');
        var updateValue     = pnl.down('#hiddenTag');        
        var tree = button.up('treepanel');
        //Get selection:
        var sr = tree.getSelectionModel().getLastSelected();    
        var v = me.getView();
       
        if(sr){
            if(v.onlyLeaves){
                if(sr.isLeaf()){       
                    var win = button.up('window');
                    // me.getView().updateDisplay.setValue(sr.get('username'));
                    me.getView().updateDisplay.setValue("<div class=\"fieldOrange\"><i class='fa fa-pen'></i> <b> "+sr.get('name')+"</b></div>");
                    me.getView().updateValue.setValue(sr.getId());
                    win.close(); 
                }else{
                     Ext.ux.Toaster.msg(
                        'Select an item',
                        'Select a grouping end point',
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
                    );
                }  
            }else{
                var win = button.up('window');
                // me.getView().updateDisplay.setValue(sr.get('username'));
                me.getView().updateDisplay.setValue("<div class=\"fieldOrange\"><i class='fa fa-pen'></i> <b> "+sr.get('name')+"</b></div>");
                me.getView().updateValue.setValue(sr.getId());
                win.close(); 
            }            
        }else{
            Ext.ux.Toaster.msg(
                'Select an item',
                'Select a grouping end point',
                Ext.ux.Constants.clsWarn,
                Ext.ux.Constants.msgWarn
            );
        }
    }
});

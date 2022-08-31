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

                    //See if we are restricted to same selected cloud id
                    if(v.noJumping){
                        console.log(sr.parentNode.parentNode.get('name'));
                        console.log(sr.parentNode.parentNode.get('id'));
                        var cloud_full  = sr.parentNode.parentNode.get('id');
                        cloud_select_id = cloud_full.split("_").pop("");
                        var cloud_id    = Ext.getApplication().getCloudId();
                        if(cloud_id == cloud_select_id){
                            var win = button.up('window');
                            // me.getView().updateDisplay.setValue(sr.get('username'));
                            me.getView().updateDisplay.setValue("<div class=\"fieldOrange\"><i class='fa fa-pen'></i> <b> "+sr.get('name')+"</b></div>");
                            me.getView().updateValue.setValue(sr.getId());
                            win.close();
                        }else{
                            Ext.ux.Toaster.msg(
                                'Only Select In Current Cloud',
                                'Selection Limited To Current Cloud',
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

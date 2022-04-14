Ext.define('Rd.view.dynamicDetails.vcDynamicDetailSocialLogin', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcDynamicDetailSocialLogin',
    config: {
        urlViewCtoC   : '/cake3/rd_cake/dynamic-details/view-click-to-connect.json'
    }, 
    control: {
        '#chkEnableSocialLogin' : {
            change: 'chkEnableSocialLoginChange'
        },
        '#chkFbEnable' : {
            change:  'chkFbEnableChange'    
        },
        '#chkTwEnable' : {
            change:  'chkTwEnableChange'    
        },
        '#chkGpEnable' : {
            change:  'chkGpEnableChange'    
        }
    },
    onViewActivate: function(){
        var me = this;
        var dd_id = me.getView().dynamic_detail_id;
        me.getView().getForm().load({
            url     : me.getUrlViewCtoC(),
            method  : 'GET',
            params  : {
                dynamic_detail_id   : dd_id
            },
            failure : function(form, action) {
                Ext.Msg.alert(action.response.statusText, action.response.responseText);
            }
        });    
    },
    chkEnableSocialLoginChange: function(chk){
        var me      = this;
        var form    = chk.up('form');
        var pu      = form.down('cmbPermanentUser');
        var fb      = form.down('#chkFbEnable');
        var tw      = form.down('#chkTwEnable');
        var gp      = form.down('#chkGpEnable');
        var value   = chk.getValue();
        if(value){
            pu.setDisabled(false);
            fb.setDisabled(false);
            tw.setDisabled(false);
            gp.setDisabled(false);
                                                
        }else{
            pu.setDisabled(true);
            fb.setValue('fb_enable');
            fb.setValue(0);
            fb.setDisabled(true);
            
            tw.setValue('tw_enable');
            tw.setValue(0);
            tw.setDisabled(true); 
            
            gp.setValue('gp_enable');
            gp.setValue(0);
            gp.setDisabled(true);               
        }
    },
    chkFbEnableChange : function(chk){
        var me      = this;
        var pnl     = chk.up('panel');
        var value   = chk.getValue();     
        pnl.query('field').forEach(function(item){
            var n   = item.getName();
            if(value){ 
                item.setDisabled(false);     
            }else{
                if(item.getName() !== 'fb_enable'){
                    item.setDisabled(true);   
                }        
           }                 
        });
    },
    chkTwEnableChange : function(chk){
        var me      = this;
        var pnl     = chk.up('panel');
        var value   = chk.getValue();     
        pnl.query('field').forEach(function(item){
            var n   = item.getName();
            if(value){ 
                item.setDisabled(false);     
            }else{
                if(item.getName() !== 'tw_enable'){
                    item.setDisabled(true);   
                }        
           }                 
        });
    },
    chkGpEnableChange : function(chk){
        var me      = this;
        var pnl     = chk.up('panel');
        var value   = chk.getValue();     
        pnl.query('field').forEach(function(item){
            var n   = item.getName();
            if(value){ 
                item.setDisabled(false);     
            }else{
                if(item.getName() !== 'gp_enable'){
                    item.setDisabled(true);   
                }        
           }                 
        });
    }
});

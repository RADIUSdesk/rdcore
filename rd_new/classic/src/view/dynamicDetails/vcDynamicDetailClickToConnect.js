Ext.define('Rd.view.dynamicDetails.vcDynamicDetailClickToConnect', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcDynamicDetailClickToConnect',
    config: {
        urlViewCtoC   : '/cake3/rd_cake/dynamic-details/view-click-to-connect.json'
    }, 
    control: {
        '#chkClickToConnect' : {
            change: 'chkClickToConnectChange'
        },
        '#chkCtcEmailOptIn' : {
            change:  'chkCtcEmailOptInChange'    
        },
        '#chkCtcPhoneOptIn' : {
            change:  'chkCtcPhoneOptInChange'    
        },
        '#chkCustInfo' : {
            change: 'chkCustInfoChange'    
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
    chkClickToConnectChange: function(chk){
        var me      = this;
        var form    = chk.up('form');
        var un      = form.down('#txtConnectUsername');
        var sx      = form.down('#txtConnectSuffix');
        var cd      = form.down('#nrConnectDelay');
        var co      = form.down('#chkConnectOnly');
        var ci      = form.down('#chkCustInfo');
        var value   = chk.getValue();
        if(value){
            un.setDisabled(false);
            sx.setDisabled(false);
            cd.setDisabled(false);
            co.setDisabled(false);
            ci.setDisabled(false);                                      
        }else{
            un.setDisabled(true);
            sx.setDisabled(true);
            cd.setDisabled(true);
            co.setDisabled(true);
            ci.setValue('cust_info_check');
            ci.setValue(0);
            ci.setDisabled(true);  
        }
    },
    chkCustInfoChange: function(chk){
        var me      = this;
        var pnl     = chk.up('panel');
        var value   = chk.getValue();     
        pnl.query('field').forEach(function(item){
            var n   = item.getName();
            //var cmp = pnl.query("[name='ci_email_required']");
            //console.log(cmp);
            //if(cmp[0]){
            //    cmp[0].setDisabled(true);
           //}
            if(value){ 
                item.setDisabled(false);     
            }else{
                if(item.getName() !== 'cust_info_check'){
                    item.setDisabled(true);   
                }        
           }                 
        });
    },
    chkCtcEmailOptInChange: function(chk){
        var me      = this;
        var form    = chk.up('form');
        var value   = chk.getValue();
        var txt     = form.down('#ci_email_opt_in_txt');
        if(value){
            txt.setDisabled(false);
        }else{
            txt.setDisabled(true);
        }
    },
    chkCtcPhoneOptInChange: function(chk){
        var me      = this;
        var form    = chk.up('form');
        var value   = chk.getValue();
        var txt     = form.down('#ci_phone_opt_in_txt');
        if(value){
            txt.setDisabled(false);
        }else{
            txt.setDisabled(true);
        }
    },
    sldrToggleChange: function(sldr){
		var me 		    = this;
		var pnl    	    = sldr.up('panel');
		var pnlC        = sldr.up('#pnlCustomerData');
		var first       = pnl.down('checkbox')
		var req         = pnl.down('#sldrRequire');
        var value       = sldr.getValue(); 
		if(!value){
		    req.setDisabled(true);
		    //Email options
		    if(first.getName() == 'ci_email'){
		        pnlC.down('#pnlEmail').setDisabled(true);   
		    }
		    //Phone
		    if(first.getName() == 'ci_phone'){
		        pnlC.down('#pnlPhone').setDisabled(true);   
		    }
		    //Custom1
		    if(first.getName() == 'ci_custom1'){
		        pnlC.down('#pnlCustom1').setDisabled(true);   
		    }
		    //Custom2
		    if(first.getName() == 'ci_custom2'){
		        pnlC.down('#pnlCustom2').setDisabled(true);   
		    }
		    //Custom3
		    if(first.getName() == 'ci_custom3'){
		        pnlC.down('#pnlCustom3').setDisabled(true);   
		    }
		    		          
		}else{
		    req.setDisabled(false);
		    //Email options
		    if(first.getName() == 'ci_email'){
		        pnlC.down('#pnlEmail').setDisabled(false);   
		    }
		    //Phone
		    if(first.getName() == 'ci_phone'){
		        pnlC.down('#pnlPhone').setDisabled(false);   
		    }
		    //Custom1
		    if(first.getName() == 'ci_custom1'){
		        pnlC.down('#pnlCustom1').setDisabled(false);   
		    }
		    //Custom2
		    if(first.getName() == 'ci_custom2'){
		        pnlC.down('#pnlCustom2').setDisabled(false);   
		    }
		    //Custom3
		    if(first.getName() == 'ci_custom3'){
		        pnlC.down('#pnlCustom3').setDisabled(false);   
		    }		    
		}
	}
});

Ext.define('Rd.view.settings.vcSettingsSms', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcSettingsSms',
    config: {
        urlView  : '/cake4/rd_cake/settings/view-sms.json',
        urlSave  : '/cake4/rd_cake/settings/edit-sms.json',
        UrlSms   : '/cake4/rd_cake/settings/test-sms.json'
    }, 
    control: {
        '#chkSmsEnabled' : {
            change : 'onChkSmsEnabledChange'
        },
        'pnlSettingsSms #save'    : {
            click   : 'save'
        }
    },
    onViewActivate: function(pnl){
        var me = this;
        //console.log("Settings Panel Activated "+me.getView().nr);
        me.getView().setLoading(true);
        me.getView().load({url:me.getUrlView(), method:'GET',params:{'nr':me.getView().nr,'edit_cloud_id':me.getView().cloud_id},
			success : function(a,b){  
		        me.getView().setLoading(false);
            }
		});       
    },
    onChkSmsEnabledChange: function(chk){
        var me = this;
        var pnl     = chk.up('form');
        var value   = chk.getValue(); 
        if(value){
            pnl.down('#btnSmsTest').setDisabled(false);
        }else{
            pnl.down('#btnSmsTest').setDisabled(true);
        }    
        pnl.query('field').forEach(function(item){
            var n   = item.getName();
            if(value){ 
                item.setDisabled(false);                     
            }else{
                if(item.getItemId() !== 'chkSmsEnabled'){
                    item.setDisabled(true);   
                }        
           }                 
        });
        pnl.down('#hiddenNr').setDisabled(false);  //Needed to know which one to enable / disable  
    },
    save: function(button){
        var me      = this;
        var form    = button.up('form');
        var e_cloud_id = form.down('#editCloudId').getValue();
        form.submit({
            clientValidation    : true,
            url                 : me.getUrlSave(),
            params              : { //Add extra param for cloud id
                edit_cloud_id : e_cloud_id
            },
            success             : function(form, action) {              
                //FIXME reload store....
                Ext.ux.Toaster.msg(
                    i18n('sItem_updated'),
                    i18n('sItem_updated_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },
            failure             : Ext.ux.formFail
        });
    },
    onSmsTestClick : function(){
        var me = this;
        if(!Ext.WindowManager.get('winSettingsSmsTestId')){
            var w = Ext.widget('winSettingsSmsTest',{id:'winSettingsSmsTestId','nr':me.getView().nr,'cloud_id':me.getView().cloud_id});
            me.getView().add(w); 
            w.show();                 
        }     
    },
    onSmsTestOkClick : function(btn){
        var me      = this;
        var form    = btn.up('form');
        var win     = btn.up('window');
        form.submit({
            clientValidation    : true,
            url                 : me.getUrlSms(),
            success             : function(form, action) {
            
                if(action.result.success == true){
                    win.down('#pnlSmsTestReply').setData(action.result.data);            
                    Ext.ux.Toaster.msg(
                        'SMS Sent',
                        'SMS Sent Please Check',
                        Ext.ux.Constants.clsInfo,
                        Ext.ux.Constants.msgInfo
                    );
                }
                //win.close();
            },
            failure  : Ext.ux.formFail
        });       
    },
    onSmsHistoryClick : function(btn){
        var me      = this;
        var tp      = btn.up('tabpanel');
        var tab_id  = 'smsHistoryTab_'+me.getView().nr;
        var nt      = tp.down('#'+tab_id);
        if(nt){
            tp.setActiveTab(tab_id); //Set focus on  Tab
            return;
        }

        var tab_name    = 'SMS '+me.getView().nr +' History';
        //Tab not there - add one
        tp.add({ 
            title           : tab_name,
            itemId          : tab_id,
            closable        : true,
            xtype           : 'gridSmsHistories',
            glyph           : Rd.config.icnView,
            edit_cloud_id   : me.getView().cloud_id,
            nr              : me.getView().nr
        });
        tp.setActiveTab(tab_id); //Set focus on Add Tab    
    }     
});

Ext.define('Rd.view.dynamicDetails.vcDynamicDetailMobileApp', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcDynamicDetailMobileApp',
    config: {
        urlView   : '/cake3/rd_cake/dynamic-detail-mobiles/view.json',
        urlSave   : '/cake3/rd_cake/dynamic-detail-mobiles/save.json'
    }, 
    control: {
        '#chkAndroidEnable' : {
            change  : 'chkAndroidEnableChange'
        },
        '#chkAppleEnable' : {
            change  : 'chkAppleEnableChange'
        },
        '#save'    : {
            click   : 'saveClick'
        }
    },
    onViewActivate: function(){
        var me = this;
        var dd_id = me.getView().dynamic_detail_id;
        me.getView().getForm().load({
            url     : me.getUrlView(),
            method  : 'GET',
            params  : {
                dynamic_detail_id   : dd_id
            },
            failure : function(form, action) {
                Ext.Msg.alert(action.response.statusText, action.response.responseText);
            }
        });    
    },
    chkAndroidEnableChange: function(){
        var me      = this;
        var chk     = me.getView().down('#chkAndroidEnable');
        var href    = me.getView().down('#txtAndroidHref');
        var link    = me.getView().down('#txtAndroidLink');
        var edit    = me.getView().down('#editAndroidContent');
        if(chk.getValue()){
            href.setDisabled(false);
            link.setDisabled(false);
            edit.setDisabled(false);
        }else{
            href.setDisabled(true);
            link.setDisabled(true);
            edit.setDisabled(true); 
        }
    },
    chkAppleEnableChange: function(){
        var me      = this;
        var chk     = me.getView().down('#chkAppleEnable');
        var href    = me.getView().down('#txtAppleHref');
        var link    = me.getView().down('#txtAppleLink');
        var edit    = me.getView().down('#editAppleContent');
        if(chk.getValue()){
            href.setDisabled(false);
            link.setDisabled(false);
            edit.setDisabled(false);
        }else{
            href.setDisabled(true);
            link.setDisabled(true);
            edit.setDisabled(true); 
        }
    },
    saveClick: function(button){
        var me      = this;
        var form    = button.up('form');
        var dd_id   = me.getView().dynamic_detail_id;
        form.submit({
            clientValidation    : true,
            submitEmptyText     : false,
            url                 : me.getUrlSave(),
            params              : {
                dynamic_detail_id   : dd_id
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
    }  
});

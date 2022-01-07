Ext.define('Rd.view.dynamicDetails.vcPhotoTranslate', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcPhotoTranslate',
    config: {
        urlView : '/cake3/rd_cake/dynamic-detail-translations/view-photo-translation.json',
        urlSave : '/cake3/rd_cake/dynamic-detail-translations/save-photo-translation.json'
    }, 
    control: {
        '#cmbImages' : {
            change  : 'onCmbImagesChange'
        },
        'cmbDynamicLanguages' : {
            change  : 'onCmbDynamicLanguagesChange'
        },
        '#chkDelete' : {
            change  : 'onChkDeleteChange'
        },
        '#saveT'    : {
            click   : 'saveT'
        }
    },
    onCmbImagesChange : function(cmb){
        var me = this;
        me.fetchInfo();
    },
    onCmbDynamicLanguagesChange : function(cmb){
        var me  = this;
        var l   = cmb.getValue();
        var r   = cmb.findRecordByValue(l); 
        me.getView().down('#txtTitle').setFieldLabel(r.get('name') +' Title');
        me.getView().down('#txtDescription').setFieldLabel(r.get('name') +' Description');
        me.fetchInfo();      
    },
    onChkDeleteChange : function(chk){
        var me = this;
        if(chk.getValue()){
            me.getView().down('#txtTitle').disable();
            me.getView().down('#txtDescription').disable();    
        }else{
            me.getView().down('#txtTitle').enable();
            me.getView().down('#txtDescription').enable();     
        }
    },
    fetchInfo : function(){ 
        var me          = this; 
        var photo_id    = me.getView().down('#cmbImages').getValue();
        var language_id = me.getView().down('cmbDynamicLanguages').getValue();     
        me.getView().down('form').load({
            url     : me.getUrlView(),
            method  : 'GET',
            params  : {
                dynamic_photo_id            : photo_id,
                dynamic_detail_language_id  : language_id
            },
            failure : function(form, action) {
                Ext.Msg.alert(action.response.statusText, action.response.responseText);
            }
        });    
    },    
    saveT: function(button){
        var me      = this;
        var form    = button.up('form');
        var window  = form.up('window');
        var chkM    = form.down('#chkMultiple');     
        form.submit({
            clientValidation    : true,
            url                 : me.getUrlSave(),
            success             : function(form, action) {
                Ext.ux.Toaster.msg(
                    i18n('sItem_updated'),
                    i18n('sItem_updated_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                ); 
                me.getView().data_view.getStore().load();                    
                if(!chkM.getValue()){ //If not multiple
                    window.close();
                }else{
                    me.fetchInfo();
                }                    
            },
            failure             : Ext.ux.formFail
        });
    }  
});

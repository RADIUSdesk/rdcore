Ext.define('Rd.view.dynamicDetails.vcDynamicDetailTweaks', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcDynamicDetailTweaks',
    config: {
        addAct  : 'addPhrase',
        editAct : 'editPhrase',
        delAct  : 'deletePhrase',
        urlAddLanguage  : '/cake3/rd_cake/dynamic-detail-translations/add-language.json',
        urlViewTweaks   : '/cake3/rd_cake/dynamic-detail-translations/view-tweaks.json',
        urlSaveTweaks   : '/cake3/rd_cake/dynamic-detail-translations/save-tweaks.json'
    }, 
    control: {
        '#chkFacebookLogin' : {
            change  : 'chkFacebookLoginChange'
        },
        '#chkShareFbAfterLogin' : {
            change  : 'chkShareFbAfterLoginChange'
        },
        '#translate'    : {
            click   : 'translate'
        },
        '#save'    : {
            click   : 'saveTweaks'
        }
    },
    chkFacebookLoginChange: function(chk){
        var me = this;
        var p = me.getView().down('#pnlFbOptions');
        if(chk.getValue()){
            //p.setVisible(true);
            p.setDisabled(false);       
        }else{
            //p.setVisible(false);
            p.setDisabled(true);  
        }
    },
    chkShareFbAfterLoginChange: function(chk){ 
        var me = this;            
        var t1 = me.getView().down('#txtFbAppId');
        var t2 = me.getView().down('#txtFbPageToShare');        
        if(chk.getValue()){
            t1.setDisabled(false); 
            t2.setDisabled(false);      
        }else{
            t1.setDisabled(true); 
            t2.setDisabled(true);      
        }    
    },
    translate: function(button){
        var me = this; 
        //Check if the node is not already open; else open the node:
        var tp1     = me.getView().up('tabpanel');
        var tp      = tp1.up('tabpanel');
        var tab_id  = 'dynamicDetailTranslateTab';
        var nt      = tp.down('#'+tab_id);
        if(nt){
            tp.setActiveTab(tab_id); //Set focus on  Tab
            return;
        }
        tp.add({ 
            title       : 'Translations',
            itemId      : tab_id,
            closable    : true,
            glyph       : Rd.config.icnGlobe, 
            layout      : 'fit', 
            items       : {'xtype' : 'gridDynamicDetailTranslations'}
        });
        tp.setActiveTab(tab_id); //Set focus on Add Tab
    },
    onViewActivate: function(){
        var me = this;
        var dd_id = me.getView().dynamic_detail_id;
        me.getView().getForm().load({
            url     : me.getUrlViewTweaks(),
            method  : 'GET',
            params  : {
                dynamic_detail_id   : dd_id
            },
            failure : function(form, action) {
                Ext.Msg.alert(action.response.statusText, action.response.responseText);
            }
        });    
    },
    saveTweaks: function(button){
        var me      = this;
        var form    = button.up('form');
        var dd_id   = me.getView().dynamic_detail_id;
        form.submit({
            clientValidation    : true,
            url                 : me.getUrlSaveTweaks(),
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

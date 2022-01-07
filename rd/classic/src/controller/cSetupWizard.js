Ext.define('Rd.controller.cSetupWizard', {
    extend: 'Ext.app.Controller',
    actionIndex: function(){

        var me = this;
        if(!Ext.WindowManager.get('sSetupWizard')){
            var win = Ext.widget('window',{
                id          : 'sSetupWizard',
                title       : 'Setup Wizard',
                width       : Rd.config.winWidth,
                height      : Rd.config.winHeight,
                glyph       : Rd.config.icnWizard,
                maximizable : true,
                maximized   : true,
                animCollapse:false,
                border      :false,
                constrainHeader:true,
                layout      : 'fit',
                items: [ 
                    {
                        xtype   : 'pnlWizardNewSite',
                        ui      : 'light',
                        border  : false
                    }
                ]
            });
            win.show();
        }
    },

    views:  [
        'wizard.pnlWizardNewSite',
        'wizard.winWizardPhotoAdd'
    ],
    stores: [],
    models: ['mDynamicPhoto'],
    selectedRecord: null,
    config: {
        urlCancel           : '/cake3/rd_cake/wizards/cancel.json',
        urlUploadPhoto      : '/cake3/rd_cake/wizards/upload-photo/'
    },
    refs: [
        {  ref: 'grid',  selector: 'gridSsids'}       
    ],
    init: function() {
        var me = this;
        if (me.inited) {
            return;
        }
        me.inited = true;
        me.control({
            '#sSetupWizard' : {
                beforeclose  : me.onBeforeClose
            },
            'winWizardPhotoAdd #save': {
                click:      me.onBtnPhotoAddSaveClick
            },
            'winWizardPhotoAdd #cancel': {
                click:      me.onBtnPhotoAddCancelClick
            },
            '#photoDelete' : {
                click:      me.onBtnPhotoDeleteClick
            } 
        });
    },
    onBeforeClose : function(win){
    
        var me = this;
        
        if(win.step_one_done){
           if(win.closeMe) {
                win.closeMe = false;
                return true;
            }
            
            Ext.Msg.show({
                title   :'Confirm this action please',
                msg     :'Remove items created in <b>step One</b>?',
                buttons :Ext.Msg.YESNO,
                callback:function(btn) {
                    if('yes' === btn) {                        
                        //Get the name
                        var n       = win.down('#txtName');
                        var name    = n.getValue();                    
                        Ext.Ajax.request({
                            url: me.getUrlCancel(),
                            method: 'POST',          
                            jsonData: {name: name},
                            success: function(batch,options){
                                win.closeMe = true;
                                win.close();
                                Ext.ux.Toaster.msg(
                                    'Clean up complete',
                                    'Clean up completed fine',
                                    Ext.ux.Constants.clsInfo,
                                    Ext.ux.Constants.msgInfo
                                );
                            }
                        });
                              
                        //win.closeMe = true;
                        //win.close();
                    }
                }
            })
            return false;
        }else{
            return true;
        }      
    },
    onBtnPhotoAddSaveClick : function(button){
        var me      = this;
        var form    = button.up('form');
        var window  = form.up('window');
        form.submit({
            clientValidation: true,
            waitMsg: 'Uploading your photo...',
            url: me.getUrlUploadPhoto(),
            params: {'name' : window.new_name },
            success: function(form, action) {              
                //FIXME reload store....
                Ext.ux.Toaster.msg(
                    i18n('sItem_updated'),
                    i18n('sItem_updated_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
                window.data_view.getStore().load();
                window.close();
            },
            failure: Ext.ux.formFail
        });
    },
    onBtnPhotoAddCancelClick : function(button){
        var me      = this;
        var form    = button.up('form');
        form.getForm().reset();
    },
    onBtnPhotoDeleteClick :   function(button){
        var me      = this;
        var d_view  = button.up('window').down('dataview');     
        //Find out if there was something selected
        if(d_view.getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item_to_delete'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            Ext.MessageBox.confirm(i18n('sConfirm'), i18n('sAre_you_sure_you_want_to_do_that_qm'), function(val){
                if(val== 'yes'){
                    d_view.getStore().remove(d_view.getSelectionModel().getSelection());
                    d_view.getStore().sync({
                        success: function(batch,options){
                            Ext.ux.Toaster.msg(
                                i18n('sItem_deleted'),
                                i18n('sItem_deleted_fine'),
                                Ext.ux.Constants.clsInfo,
                                Ext.ux.Constants.msgInfo
                            );
                            d_view.getStore().load();   //Update the count   
                        },
                        failure: function(batch,options,c,d){
                            Ext.ux.Toaster.msg(
                                i18n('sProblems_deleting_item'),
                                batch.proxy.getReader().rawData.message.message,
                                Ext.ux.Constants.clsWarn,
                                Ext.ux.Constants.msgWarn
                            );
                            d_view.getStore().load(); //Reload from server since the sync was not good
                        }
                    });

                }
            });
        }
    }     
});

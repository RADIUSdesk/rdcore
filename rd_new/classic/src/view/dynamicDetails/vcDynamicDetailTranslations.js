Ext.define('Rd.view.dynamicDetails.vcDynamicDetailTranslations', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcDynamicDetailTranslations',
    config: {
        gridPage        : null,
        urlAddLanguage  : '/cake3/rd_cake/dynamic-detail-translations/add-language.json',
        urlEditLanguage : '/cake3/rd_cake/dynamic-detail-translations/edit-language.json',
        urlDelLanguage  : '/cake3/rd_cake/dynamic-detail-translations/del-language.json',
        urlAddKey       : '/cake3/rd_cake/dynamic-detail-translations/add-key.json',
        urlEditKey      : '/cake3/rd_cake/dynamic-detail-translations/edit-key.json',
        urlDelKey       : '/cake3/rd_cake/dynamic-detail-translations/del-key.json',
        urlAddPhrase    : '/cake3/rd_cake/dynamic-detail-translations/add-phrase.json',
        urlExistingChk  : '/cake3/rd_cake/dynamic-detail-translations/existing-check.json',
        urlDelPhrase    : '/cake3/rd_cake/dynamic-detail-translations/del-phrase.json',
        urlPreviewApi   : '/cake3/rd_cake/dynamic-detail-translations/get-translations.json',
    }, 
    control: {
        '#tbCmbDynamicDetailTransPages' : {
            change : 'reload'
        },
        '#reload': {
             click: 'reload'
        },
        '#add': {
             click: 'add'
        },
        '#edit': {
            click: 'edit'
        },
        '#delete': {
             click: 'del'
        },
        '#preview': {
             click: 'previewApi'
         },
        'winDynamicLanguageAdd #save': {
            click: 'languageAddSave'
        },
        'winDynamicLanguageEdit #save': {
            click: 'languageEditSave'
        },
        'winDynamicLanguageDel #save': {
            click: 'languageDelSave'
        },
        'winDynamicDetailTransKeyAdd #save': {
            click: 'keyAddSave'
        },
        'winDynamicDetailTransKeyEdit #save': {
            click: 'keyEditSave'
        },
        'winDynamicDetailTransKeyDel #save': {
            click: 'keyDelSave'
        },
        'winDynamicDetailTranslationAdd #save': {
            click: 'phraseAddSave'
        },
        'winDynamicDetailTranslationEdit #save': {
           // click: 'phraseEditSave'
        },
        'winDynamicDetailTranslationDel #save': {
          //  click: 'phraseDelSave'
        }          
    },
    gridAfterrender: function(){
        var me = this;
        Ext.ux.Toaster.msg(
            'Select First',
            'Select A Login Page To Display Its Info',
            Ext.ux.Constants.clsWarn,
            Ext.ux.Constants.msgWarn
        );
    },
    reload: function(){
        var me = this;
        var p = me.getView().down('#tbCmbDynamicDetailTransPages');
        if(p.getValue()){
            me.setConfig('gridPage',p.getValue());
            me.getView().getStore().getProxy().setExtraParam('dynamic_detail_id',p.getValue());
            me.getView().getStore().reload();        
        }else{
            Ext.ux.Toaster.msg(
                'Select First',
                'Select A Login Page To Display Its Info',
                Ext.ux.Constants.clsWarn,
                Ext.ux.Constants.msgWarn
            );
        }
    },
	add: function(button) {
	
        var me      = this;
        var option  = me.getView().down('#cmbDynamicDetailTransOptions').getValue();
              
        if(option == 'language'){
            if(!Ext.WindowManager.get('winDynamicLanguageAddId')){
                var w = Ext.widget('winDynamicLanguageAdd',{id:'winDynamicLanguageAddId'});
                w.show();  
                this.getView().add(w);       
            }
        }
         
        if(option == 'key'){
            if(!Ext.WindowManager.get('winDynamicDetailTransKeyAddId')){
                var w = Ext.widget('winDynamicDetailTransKeyAdd',{id:'winDynamicDetailTransKeyAddId','dynamic_detail_id': me.getConfig('gridPage')});
                this.getView().add(w); 
                w.show();        
            }
        }
            
        if(option == 'phrase'){
            if(!Ext.WindowManager.get('winDynamicDetailTranslationAddId')){
                var w = Ext.widget('winDynamicDetailTranslationAdd',{id:'winDynamicDetailTranslationAddId','dynamic_detail_id': me.getConfig('gridPage')});
                this.getView().add(w); 
                w.show();           
            }
        }  
    },
    edit: function(button) {
        var me      = this;
        var option  = me.getView().down('#cmbDynamicDetailTransOptions').getValue();
              
        if(option == 'language'){
            if(!Ext.WindowManager.get('winDynamicLanguageEditId')){
                var w = Ext.widget('winDynamicLanguageEdit',{id:'winDynamicLanguageEditId'});
                w.show();  
                this.getView().add(w);       
            }
        }
        
        if(option == 'key'){
            if(!Ext.WindowManager.get('winDynamicDetailTransKeyEditId')){  
                var w = Ext.widget('winDynamicDetailTransKeyEdit',{id:'winDynamicDetailTransKeyEditId','dynamic_detail_id': me.getConfig('gridPage')});
                this.getView().add(w);
                w.show();       
            }
        }
        
        if(option == 'phrase'){
           if(me.getView().getSelectionModel().getCount() == 0){
                 Ext.ux.Toaster.msg(
                            i18n('sSelect_an_item'),
                            i18n('sFirst_select_an_item_to_edit'),
                            Ext.ux.Constants.clsWarn,
                            Ext.ux.Constants.msgWarn
                );
            }else{
                var sr  = me.getView().getSelectionModel().getLastSelected();      
                if(!Ext.WindowManager.get('winDynamicDetailTranslationAddId')){
                    var w = Ext.widget('winDynamicDetailTranslationAdd',{id:'winDynamicDetailTranslationAddId',record:sr});
                    w.show();  
                    this.getView().add(w);       
                }
            }
        }  
          
    },
    del: function(button) {
        var me      = this;
        var option  = me.getView().down('#cmbDynamicDetailTransOptions').getValue();
        
        if(option == 'language'){
            if(!Ext.WindowManager.get('winDynamicLanguageDelId')){
                var w = Ext.widget('winDynamicLanguageDel',{id:'winDynamicLanguageDelId'});
                me.getView().add(w); 
                w.show();                 
            }
        } 
        
        if(option == 'key'){
            if(!Ext.WindowManager.get('winDynamicDetailTransKeyDelId')){
                var w = Ext.widget('winDynamicDetailTransKeyDel',{id:'winDynamicDetailTransKeyDelId','dynamic_detail_id': me.getConfig('gridPage')});
                me.getView().add(w); 
                w.show();      
            }
        }
        
       if(option == 'phrase'){
       
            if(me.getView().getSelectionModel().getCount() == 0){
                 Ext.ux.Toaster.msg(
                            i18n('sSelect_an_item'),
                            i18n('sFirst_select_an_item_to_delete'),
                            Ext.ux.Constants.clsWarn,
                            Ext.ux.Constants.msgWarn
                );
            }else{
                Ext.MessageBox.confirm(i18n('sConfirm'), i18n('sAre_you_sure_you_want_to_do_that_qm'), function(val){
                    if(val== 'yes'){
                        var selected    = me.getView().getSelectionModel().getSelection();
                        var list        = [];
                        Ext.Array.forEach(selected,function(item){
                            var id = item.getId();
                            Ext.Array.push(list,{'id' : id});
                        });
                        Ext.Ajax.request({
                            url: me.getUrlDelPhrase(),
                            method: 'POST',          
                            jsonData: list,
                            success: function(batch,options){console.log('success');
                                Ext.ux.Toaster.msg(
                                    i18n('sItem_deleted'),
                                    i18n('sItem_deleted_fine'),
                                    Ext.ux.Constants.clsInfo,
                                    Ext.ux.Constants.msgInfo
                                );
                                me.reload(); //Reload from server
                            },                                    
                            failure: function(batch,options){
                                console.log("Could not delete!");
                                me.reload(); //Reload from server
                            }
                        });
                    }
                });
            }          
        }     
    },   
    languageAddSave: function(button){
        var me      = this;
        var form    = button.up('form');
        var window  = form.up('window');

        form.submit({
            clientValidation: true,
            url: me.getUrlAddLanguage(),
            params: {},
            success: function(form, action) {              
                //FIXME reload store....
                Ext.ux.Toaster.msg(
                    i18n('sItem_updated'),
                    i18n('sItem_updated_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
                window.close();
            },
            failure: Ext.ux.formFail
        });
    },  
    onCmbDynamicLanguagesChange: function(cmb){
        var me  = this;
        var f   = cmb.up('form');
        console.log(cmb.getValue());
        var id  = cmb.getValue()
        var m   = cmb.getStore().getById(id);
        f.loadRecord(m);   
    },
    languageEditSave: function(button){
        var me      = this;
        var form    = button.up('form');
        var window  = form.up('window');

        form.submit({
            clientValidation: true,
            url: me.getUrlEditLanguage(),
            params: {},
            success: function(form, action) {              
                //FIXME reload store....
                Ext.ux.Toaster.msg(
                    i18n('sItem_updated'),
                    i18n('sItem_updated_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
                window.close();
            },
            failure: Ext.ux.formFail
        });
    },
    languageDelSave: function(button){
        var me      = this;
        var form    = button.up('form');
        var window  = form.up('window');

        form.submit({
            clientValidation: true,
            url: me.getUrlDelLanguage(),
            params: {},
            success: function(form, action) {              
                //FIXME reload store....
                Ext.ux.Toaster.msg(
                    'Item Deleted',
                    'Item Deleted Fine',
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
                window.close();
            },
            failure: Ext.ux.formFail
        });
    },
    keyAddSave: function(button){
        var me      = this;
        var form    = button.up('form');
        var window  = form.up('window');
        form.submit({
            clientValidation: true,
            url: me.getUrlAddKey(),
            params: {},
            success: function(form, action) {              
                //FIXME reload store....
                Ext.ux.Toaster.msg(
                    'Item Deleted',
                    'Item Deleted Fine',
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
                window.close();
            },
            failure: Ext.ux.formFail
        }); 
    },
    onCmbDynamicDetailBeforeShowK: function(cmb){
        var me = this;
        me.onCmbDynamicDetailChangeK(cmb);
    },
    onCmbDynamicDetailChangeK: function(cmb){
        var me      = this;
        var form    = cmb.up('form');
        var cmbKey  = form.down('cmbDynamicTransKeys');
        var txtName = form.down('#txtName');
        if(txtName){
            txtName.setValue('');
        }
        cmbKey.setValue(''); // Clear the values if there were perhaps some selected
        cmbKey.getStore().getProxy().setExtraParam('dynamic_detail_id',cmb.getValue());
        cmbKey.getStore().load(); 
    },
    onCmbDynamicTransKeysChangeK: function(cmb){
        var me      = this;
        var f   = cmb.up('form');
        var id  = cmb.getValue()
        var m   = cmb.getStore().getById(id);
        if(m){
            f.loadRecord(m);
        }    
    },
    keyEditSave: function(button){
        var me      = this;
        var form    = button.up('form');
        var window  = form.up('window');

        form.submit({
            clientValidation: true,
            url: me.getUrlEditKey(),
            params: {},
            success: function(form, action) {              
                //FIXME reload store....
                Ext.ux.Toaster.msg(
                    i18n('sItem_updated'),
                    i18n('sItem_updated_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
                window.close();
            },
            failure: Ext.ux.formFail
        });
    },
    keyDelSave: function(button){
        var me      = this;
        var form    = button.up('form');
        var window  = form.up('window');

        form.submit({
            clientValidation: true,
            url: me.getUrlDelKey(),
            params: {},
            success: function(form, action) {              
                //FIXME reload store....
                Ext.ux.Toaster.msg(
                    'Item Deleted',
                    'Item Deleted Fine',
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
                window.close();
            },
            failure: Ext.ux.formFail
        });
    },          
    //==== ALL ENDING WITH X are for translation window=== 
    onCmbDynamicDetailBeforeShowX: function(cmb){
        var me = this;
        me.onCmbDynamicDetailChangeX(cmb);
    }, 
    onCmbDynamicDetailChangeX: function(cmb){
        var me      = this;
        var form    = cmb.up('form');
        var win     = cmb.up('window');
        if((win.record)&&(win.firstTime)){ //If it has a record dont clear it the FIRST TIME
            win.firstTime = false;
        }else{
            var cmbKey  = form.down('cmbDynamicTransKeys');
            cmbKey.setValue(''); // Clear the values if there were perhaps some selected
            cmbKey.getStore().getProxy().setExtraParam('dynamic_detail_id',cmb.getValue());
            cmbKey.getStore().load();
        }
        me.lookForExistingX(form);   
    },
    onCmbDynamicTransKeysChangeX: function(cmb){
        var me      = this;
        var form    = cmb.up('form');
        me.lookForExistingX(form);   
    }, 
    onCmbDynamicLanguagesChangeX: function(cmb){
        var me      = this;
        var form    = cmb.up('form');
        me.lookForExistingX(form);   
    },
    lookForExistingX: function(form){
        var me      = this;
        var win     = form.up('window');
        var dNew    = form.down('#dispNew');
        var dEdit   = form.down('#dispExist');
        var cmbDD   = form.down('cmbDynamicDetailTransPages');
        var valDdId = cmbDD.getValue();
        var cmbKey  = form.down('cmbDynamicTransKeys');
        var valKey  = cmbKey.getValue();     
        var cmbLang = form.down('cmbDynamicLanguages');
        var valLang = cmbLang.getValue();
        
        if(valDdId && valKey && valLang){
        
            Ext.Ajax.request({
                url: me.getUrlExistingChk(),
                method: 'GET',
                params: { dynamic_detail_language_id:valLang, dynamic_detail_trans_key_id:valKey},
                success: function(response){
                    var jsonData    = Ext.JSON.decode(response.responseText);
                    if(jsonData.success){
                        form.down('#id').setValue(jsonData.data.id)
                        form.down('#txtPhrase').setValue(jsonData.data.value)
                        dNew.hide();
                        dEdit.show();
                        win.setGlyph(Rd.config.icnEdit);
                        win.setTitle('Edit Phrase');
                    }else{
                        form.down('#id').setValue('');
                        form.down('#txtPhrase').setValue('');
                        dNew.show();
                        dEdit.hide();
                        win.setGlyph(Rd.config.icnAdd);
                        win.setTitle('Add Phrase');                       
                    } 
                },
                scope: me
            });
            
        }      
    },     
    //===== END ending with X ======  
    phraseAddSave: function(button){
        var me      = this;
        var form    = button.up('form');
        var window  = form.up('window');
        var chkM    = form.down('#chkMultiple');      
        form.submit({
            clientValidation: true,
            url: me.getUrlAddPhrase(),
            params: {},
            success: function(form, action) {              
                //FIXME reload store....
                Ext.ux.Toaster.msg(
                    'Item Added',
                    'Item Added Fine',
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
                if(!chkM.getValue()){ //If not multiple
                    window.close();
                }else{
                    me.lookForExistingX(window.down('form'));
                }
                me.reload();
            },
            failure: Ext.ux.formFail,
            scope: me
        });     
    },      
    previewApi: function(){    
        var me  = this;
        var p   = me.getView().down('#tbCmbDynamicDetailTransPages');
        if(p.getValue()){
            window.open(me.getUrlPreviewApi()+"?dynamic_detail_id="+p.getValue());
        }else{
            Ext.ux.Toaster.msg(
                'Select First',
                'Select A Login Page To Show API Reply',
                Ext.ux.Constants.clsWarn,
                Ext.ux.Constants.msgWarn
            );
        }
    }  
});
